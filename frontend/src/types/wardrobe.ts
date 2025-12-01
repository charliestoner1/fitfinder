// frontend/src/types/wardrobe.ts

export interface ClothingItem {
  id: number;
  user: number;
  itemImage: string;          // Django: item_image
  name: string;               // Django: name (REQUIRED)
  category: string;           // Django: category
  season: string;             // Django: season
  brand?: string;             // Django: brand
  material?: string;          // Django: material
  price?: number;             // Django: price
  createdAt: string;          // Django: created_at
  updatedAt: string;          // Django: updated_at
  tags?: ClothingTags;        // Django: tags 
}


export interface ClothingItemCreate {
  image: File;                // Will be sent as item_image
  name: string;               // REQUIRED by Django
  category?: string;
  season?: string;
  brand?: string;
  material?: string;
  price?: number;
}

export interface ClothingItemUpdate {
  name?: string;
  category?: string;
  season?: string;
  brand?: string;
  material?: string;
  price?: number;
}

export interface ClothingTags {
  type?: string[];
  color?: string[];
  pattern?: string[];
}

export interface AutoTagSuggestion {
  tags: ClothingTags;
  caption?: string;
  suggestedName: string;
  suggestedCategory: string | null;
}