"""
Florence-2-based auto-tagger for FitFinder.

Public API:

    tags, caption = run_autotagger(image_path_or_pil)
    category = infer_category_from_type_tags(tags, caption)

The model is lazy loaded on first use
"""

from __future__ import annotations

import os
import re
import warnings
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Union

import torch
from PIL import Image
from transformers import AutoProcessor, AutoModelForCausalLM

# ---------------------------------------------------------------------------
# Section 1 – Configuration
# ---------------------------------------------------------------------------

MODEL_ID: str = "microsoft/Florence-2-base"
REVISION: str = "main"

TASK_MORE_DETAILED_CAPTION: str = "<MORE_DETAILED_CAPTION>"

MAX_NEW_TOKENS: int = 128
NUM_BEAMS: int = 3
RESIZE_LONG_SIDE: int = 512
PREFERRED_DTYPE: str = "float32"
FORCE_CPU: bool = False

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
os.environ.setdefault("TRANSFORMERS_VERBOSITY", "error")
warnings.filterwarnings("ignore", category=UserWarning, module="huggingface_hub.file_download")

# Globals for lazy loading
_MODEL: Optional[AutoModelForCausalLM] = None
_PROCESSOR: Optional[AutoProcessor] = None
_DEVICE: Optional[torch.device] = None
_MODEL_DTYPE: Optional[torch.dtype] = None


# ---------------------------------------------------------------------------
# Section 2 – Device / dtype helpers
# ---------------------------------------------------------------------------

def _pick_device(force_cpu: bool = False) -> torch.device:
    if force_cpu:
        return torch.device("cpu")
    if torch.cuda.is_available():
        return torch.device("cuda:0")
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def _pick_dtype(pref: str, device: torch.device) -> torch.dtype:
    pref = pref.lower()
    if device.type == "cuda":
        if pref in {"float16", "fp16"}:
            return torch.float16
        if pref in {"bfloat16", "bf16"} and getattr(torch.cuda, "is_bf16_supported", lambda: False)():
            return torch.bfloat16
        return torch.float32
    return torch.float32


def _get_model_and_processor() -> Tuple[AutoModelForCausalLM, AutoProcessor, torch.device]:
    """
    Lazy-load Florence-2 and its processor on first use.
    """
    global _MODEL, _PROCESSOR, _DEVICE, _MODEL_DTYPE

    if _MODEL is not None and _PROCESSOR is not None and _DEVICE is not None:
        return _MODEL, _PROCESSOR, _DEVICE

    device = _pick_device(FORCE_CPU)
    dtype = _pick_dtype(PREFERRED_DTYPE, device)

    processor = AutoProcessor.from_pretrained(
        MODEL_ID,
        revision=REVISION,
        trust_remote_code=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        revision=REVISION,
        torch_dtype=dtype,
        trust_remote_code=True,
    )

    model.to(device)
    model.eval()

    _MODEL = model
    _PROCESSOR = processor
    _DEVICE = device
    _MODEL_DTYPE = dtype

    return model, processor, device


# ---------------------------------------------------------------------------
# Section 3 – Image utilities
# ---------------------------------------------------------------------------

def load_image(img: Union[str, Path, Image.Image]) -> Image.Image:
    if isinstance(img, Image.Image):
        pil_img = img
    else:
        pil_img = Image.open(str(img))
    if pil_img.mode != "RGB":
        pil_img = pil_img.convert("RGB")
    return pil_img


def resize_long_side(img: Image.Image, long_side: int) -> Image.Image:
    w, h = img.size
    if max(w, h) <= long_side:
        return img
    if w >= h:
        new_w = long_side
        new_h = int(h * (long_side / w))
    else:
        new_h = long_side
        new_w = int(w * (long_side / h))
    return img.resize((new_w, new_h), Image.BICUBIC)


# ---------------------------------------------------------------------------
# Section 4 – Caption → tags (type / color / pattern)
# ---------------------------------------------------------------------------

TYPE_ALIASES: Dict[str, str] = {
    # tops
    "tee": "t-shirt", "tshirt": "t-shirt", "t-shirt": "t-shirt", "t": "t-shirt",
    "tshirt.": "t-shirt", "t-shirt.": "t-shirt",
    "top": "top", "blouse": "blouse", "shirt": "shirt", "polo": "polo shirt",
    "hoodie": "hoodie", "sweatshirt": "sweatshirt", "sweater": "sweater", "cardigan": "cardigan",
    "tank": "tank top", "tanktop": "tank top", "camisole": "camisole", "crop": "crop top",
    "longsleeve": "long-sleeve shirt", "long-sleeve": "long-sleeve shirt",

    # outerwear
    "jacket": "jacket", "coat": "coat", "blazer": "blazer", "parka": "parka",
    "windbreaker": "windbreaker", "raincoat": "raincoat",

    # bottoms
    "jeans": "jeans", "pant": "pants", "pants": "pants", "trousers": "pants",
    "sweatpants": "sweatpants", "joggers": "joggers",
    "shorts": "shorts", "skirt": "skirt", "leggings": "leggings",

    # one-pieces
    "dress": "dress", "gown": "dress", "jumpsuit": "jumpsuit", "romper": "romper",

    # footwear
    "shoe": "shoes", "shoes": "shoes", "sneaker": "sneakers", "sneakers": "sneakers",
    "boot": "boots", "boots": "boots", "sandals": "sandals", "sandal": "sandals",
    "heels": "heels", "heel": "heels", "loafer": "loafers", "loafers": "loafers",

    # accessories
    "hat": "hat", "beanie": "beanie", "cap": "cap", "snapback": "cap",
    "scarf": "scarf", "belt": "belt", "bag": "bag", "handbag": "bag",
    "backpack": "backpack", "purse": "bag", "tie": "tie",
}

CANONICAL_TYPES = set(TYPE_ALIASES.values())
CLOTHING_TOKENS = set(TYPE_ALIASES.keys()) | CANONICAL_TYPES

COLOR_ALIASES = {
    # spelling variants
    "grey": "gray",

    # common shades that we treat as their own colors
    "navy": "navy",
    "olive": "olive",
    "khaki": "khaki",
    "teal": "teal",
    "cyan": "cyan",
    "turquoise": "turquoise",
    "aqua": "aqua",
    "magenta": "magenta",
    "fuchsia": "fuchsia",
    "coral": "coral",
    "salmon": "salmon",
    "mustard": "mustard",
    "lime": "lime",
    "mint": "mint",
    "ivory": "ivory",
    "charcoal": "charcoal",
}

COLOR_WORDS = {
    # basic
    "black", "white", "gray", "red", "blue", "green", "yellow",
    "orange", "brown", "beige", "tan", "pink", "purple",

    # extras
    "navy", "olive", "khaki", "lavender", "maroon", "burgundy",
    "cream", "gold", "silver", "teal", "cyan", "turquoise",
    "aqua", "magenta", "fuchsia", "coral", "salmon",
    "mustard", "lime", "mint", "ivory", "charcoal",
}

PATTERN_ALIASES: Dict[str, str] = {
    "stripe": "striped", "stripes": "striped", "striped": "striped",
    "checkered": "plaid", "checked": "plaid", "plaid": "plaid",
    "polka": "polka dot", "polka-dot": "polka dot", "dots": "polka dot",
    "dot": "polka dot",
    "camo": "camouflage", "camouflage": "camouflage",
    "floral": "floral", "flower": "floral", "flowers": "floral",
    "leopard": "animal print", "zebra": "animal print", "snake": "animal print",
}

PATTERN_WORDS = set(PATTERN_ALIASES.values())

# category mapping for primary type -> wardrobe category
CATEGORY_MAP: Dict[str, str] = {
    # Tops
    "t-shirt": "Tops", "top": "Tops", "blouse": "Tops", "shirt": "Tops",
    "polo shirt": "Tops", "hoodie": "Tops", "tank top": "Tops", "camisole": "Tops", 
    "crop top": "Tops", "long-sleeve shirt": "Tops", "turtleneck": "Tops", "tank": "Tops",

    # Mid Layer (soft layering pieces - sweaters, cardigans)
    "sweater": "Mid Layer", "cardigan": "Mid Layer", "sweatshirt": "Mid Layer",
    "vest": "Mid Layer", "gilet": "Mid Layer", "pullover": "Mid Layer",

    # Outer Layer (structured jackets and coats)
    "jacket": "Outer Layer", "coat": "Outer Layer", "parka": "Outer Layer",
    "blazer": "Outer Layer", "windbreaker": "Outer Layer", "raincoat": "Outer Layer", 
    "trench coat": "Outer Layer", "winter coat": "Outer Layer", "wool coat": "Outer Layer",
    "denim jacket": "Outer Layer", "leather jacket": "Outer Layer",

    # Bottoms
    "jeans": "Bottoms", "pants": "Bottoms", "sweatpants": "Bottoms",
    "joggers": "Bottoms", "shorts": "Bottoms", "skirt": "Bottoms",
    "leggings": "Bottoms", "trousers": "Bottoms", "chinos": "Bottoms",
    "cargo pants": "Bottoms", "dress pants": "Bottoms",

    # Accessories (includes jewelry, bags, footwear accessories, etc.)
    "hat": "Accessory", "beanie": "Accessory", "cap": "Accessory",
    "scarf": "Accessory", "belt": "Accessory", "bag": "Accessory",
    "backpack": "Accessory", "tie": "Accessory", "gloves": "Accessory",
    "mittens": "Accessory", "sunglasses": "Accessory", "glasses": "Accessory",
    "watch": "Accessory", "bracelet": "Accessory", "necklace": "Accessory",
    "ring": "Accessory", "earrings": "Accessory", "pendant": "Accessory",
    "anklet": "Accessory", "choker": "Accessory", "locket": "Accessory",
    "brooch": "Accessory", "pin": "Accessory", "hair clip": "Accessory",
    "headband": "Accessory", "hairband": "Accessory", "hair accessory": "Accessory",
    "umbrella": "Accessory", "wallet": "Accessory", "purse": "Accessory",
    "shoes": "Accessory", "sneakers": "Accessory", "boots": "Accessory",
    "sandals": "Accessory", "heels": "Accessory", "loafers": "Accessory",
    "flats": "Accessory", "pumps": "Accessory", "slip-ons": "Accessory",
}

def _norm_token(token: str) -> str:
    """Lowercase & strip punctuation for approximate matching."""
    return re.sub(r"[^\w-]", "", token.lower()).strip()

def extract_tags_from_caption(
    caption: str,
    max_colors: int = 3,
) -> Dict[str, List[str]]:
    """
    Extract clothing 'type', 'color', 'pattern' tags from a Florence caption,
    focusing on tokens near clothing words so we ignore background (floors, walls, etc.).
    """
    caption = caption or ""
    tokens_raw = caption.split()
    tokens = [_norm_token(t) for t in tokens_raw]

    types = set()
    colors = set()
    patterns = set()

    n = len(tokens)

    for i, tok in enumerate(tokens):
        if not tok:
            continue

        # Is this token a clothing type?
        if tok in CLOTHING_TOKENS:
            canonical_type = TYPE_ALIASES.get(tok, tok)
            types.add(canonical_type)

            # Look in a window around this clothing word for colors/patterns
            start = max(0, i - 4)
            end = min(n, i + 5)
            window = tokens[start:end]

            for w in window:
                if w in COLOR_ALIASES:
                    colors.add(COLOR_ALIASES[w])
                elif w in COLOR_WORDS:
                    colors.add(w)

                # pattern alias -> canonical
                if w in PATTERN_ALIASES:
                    patterns.add(PATTERN_ALIASES[w])
                elif w in PATTERN_WORDS:
                    patterns.add(w)

    # We only care about clothing contexts.
    if len(colors) > max_colors:
        colors = set(list(colors)[:max_colors])

    return {
        "type": sorted(types),
        "color": sorted(colors),
        "pattern": sorted(p for p in patterns if p),
    }

def select_primary_type(
    tags: Dict[str, List[str]],
    caption: str,
) -> Optional[str]:
    """
    Pick a single 'primary' clothing type to represent this item,
    preferring a type that appears in the caption near BOTH a pattern and a color,
    then near a color, then anything.

    This keeps the item name & category consistent (e.g. 'Black Beanie' -> Accessories).
    """
    types = tags.get("type") or []
    if not types:
        return None

    caption = caption or ""
    tokens_raw = caption.split()
    tokens = [_norm_token(t) for t in tokens_raw]
    n = len(tokens)

    # Pre-index occurrences where a clothing type shows up in the caption
    occurrences = []  # list of (index, canonical_type, has_color, has_pattern)
    canonical_types = set(types)

    for i, tok in enumerate(tokens):
        if not tok:
            continue

        # Map token to canonical type if it's an alias
        if tok in TYPE_ALIASES or tok in canonical_types:
            canonical = TYPE_ALIASES.get(tok, tok)
            if canonical not in canonical_types:
                # Florence might mention extra garments not kept; skip
                continue

            start = max(0, i - 4)
            end = min(n, i + 5)
            window = tokens[start:end]

            has_color = any(w in COLOR_WORDS for w in window)
            has_pattern = any((w in PATTERN_ALIASES or w in PATTERN_WORDS) for w in window)

            occurrences.append((i, canonical, has_color, has_pattern))

    if not occurrences:
        # No explicit mention found in caption; just pick the first type tag
        return types[0]

    # Prefer earliest occurrence with both color & pattern, then color-only, then anything
    occurrences.sort(key=lambda x: x[0])  # sort by position

    # 1) color + pattern
    for _, canonical, has_color, has_pattern in occurrences:
        if has_color and has_pattern:
            return canonical

    # 2) color only
    for _, canonical, has_color, has_pattern in occurrences:
        if has_color:
            return canonical

    # 3) fallback: first occurrence
    return occurrences[0][1]


# ---------------------------------------------------------------------------
# Section 5 – Florence-2 caption generation
# ---------------------------------------------------------------------------

@torch.inference_mode()
def florence_generate_caption(
    img: Image.Image,
    task_token: str = TASK_MORE_DETAILED_CAPTION,
    max_new_tokens: int = MAX_NEW_TOKENS,
    num_beams: int = NUM_BEAMS,
) -> str:
    model, processor, device = _get_model_and_processor()

    prompt = task_token
    img_resized = resize_long_side(img, RESIZE_LONG_SIDE)

    inputs = processor(
        text=prompt,
        images=[img_resized],
        return_tensors="pt",
    )

    model_dtype = next(model.parameters()).dtype

    aligned_inputs = {}
    for k, v in inputs.items():
        if torch.is_tensor(v):
            if torch.is_floating_point(v):
                aligned_inputs[k] = v.to(device=device, dtype=model_dtype)
            else:
                aligned_inputs[k] = v.to(device=device)
        else:
            aligned_inputs[k] = v

    outputs = model.generate(
        **aligned_inputs,
        max_new_tokens=max_new_tokens,
        num_beams=num_beams,
    )

    raw = processor.batch_decode(outputs, skip_special_tokens=True)[0]
    caption = (
        raw.replace("<CAPTION>", "")
           .replace("<MORE_DETAILED_CAPTION>", "")
           .strip()
    )
    return caption


def image_to_tags_and_caption(img: Image.Image) -> Tuple[Dict[str, List[str]], str]:
    caption = florence_generate_caption(img, TASK_MORE_DETAILED_CAPTION)
    tags = extract_tags_from_caption(caption)
    return tags, caption


# ---------------------------------------------------------------------------
# Section 6 – Public entrypoints for Django
# ---------------------------------------------------------------------------

def run_autotagger(img: Union[str, Path, Image.Image]) -> Tuple[Dict[str, List[str]], str]:
    pil_img = load_image(img)
    return image_to_tags_and_caption(pil_img)


def infer_category_from_type_tags(
    tags: Dict[str, List[str]],
    caption: Optional[str] = None,
) -> Optional[str]:
    """
    Infer a high-level wardrobe category (Tops, Bottoms, Outerwear, Accessories, Footwear, Other)
    from the *same* primary type used for naming.
    """
    caption = caption or ""
    primary_type = select_primary_type(tags, caption)

    # If select_primary_type didn't find one, fall back to the first type (if any)
    if not primary_type:
        types = tags.get("type") or []
        if not types:
            return None
        primary_type = types[0]

    return CATEGORY_MAP.get(primary_type, "Etc.")

def build_item_name_from_tags(
    tags: Dict[str, List[str]],
    caption: Optional[str] = None,
) -> str:
    """
    Build a human-readable item name like:
    - 'Plaid Red Dress'
    - 'Striped Black and White Shirt'
    - 'Camo Skirt'

    Rules:
    - Always Title Case the final result.
    - If exactly 1 color:   [Pattern] [Color1] [ItemType]
    - If >=2 colors:        [Pattern] [Color1] and [Color2] [ItemType]
    - If no pattern:        just drop [Pattern].
    """
    caption = caption or ""
    types = tags.get("type") or []
    colors = tags.get("color") or []
    patterns = tags.get("pattern") or []

    # Decide which garment its naming
    primary_type = select_primary_type(tags, caption)
    if not primary_type and types:
        primary_type = types[0]

    if not primary_type:
        if colors and patterns:
            base = f"{patterns[0]} {' and '.join(colors)} item"
        elif colors:
            base = f"{' and '.join(colors)} item"
        elif patterns:
            base = f"{patterns[0]} item"
        else:
            return "Clothing Item"
        return base.strip().title()

    # Choose one pattern if present
    pattern = patterns[0] if patterns else None

    # Color logic
    name_parts: List[str] = []

    if pattern:
        name_parts.append(pattern)

    if len(colors) == 1:
        # Single color: "[Pattern] Red Dress"
        name_parts.append(colors[0])
    elif len(colors) >= 2:
        # Two or more colors: use the first two
        # "[Pattern] Red and Blue Dress"
        name_parts.append(f"{colors[0]} and {colors[1]}")

    name_parts.append(primary_type)

    base = " ".join(part for part in name_parts if part).strip()

    # Title Case for the final display name
    return base.title() if base else "Clothing Item"
