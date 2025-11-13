/**
 * File: src/types/outfit.ts
 * Shared TypeScript types for the Outfit Builder feature
 */

export type ClothingLayer = 'tops' | 'bottoms' | 'mid' | 'outer' | 'accessory';

export type ClothingCategory = 
  | 't-shirt' 
  | 'shirt' 
  | 'dress' 
  | 'pants' 
  | 'shorts' 
  | 'skirt'
  | 'sweater' 
  | 'cardigan' 
  | 'vest' 
  | 'hoodie'
  | 'jacket' 
  | 'coat' 
  | 'blazer' 
  | 'parka'
  | 'hat' 
  | 'scarf' 
  | 'belt' 
  | 'jewelry' 
  | 'bag' 
  | 'shoes' 
  | 'watch';

export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';

export type Occasion = 
  | 'casual' 
  | 'work' 
  | 'formal' 
  | 'party' 
  | 'date' 
  | 'gym' 
  | 'outdoor' 
  | 'beach';

/**
 * Base clothing item from wardrobe
 */
export interface ClothingItem {
  id: string;
  imageUrl: string;
  category: ClothingCategory | string;
  colors: string[];
  season: Season;
  brand?: string;
  material?: string;
  price?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Clothing item positioned on outfit canvas
 */
export interface OutfitItem extends ClothingItem {
  layer: ClothingLayer;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  zIndex: number;
}

/**
 * Complete outfit with metadata
 */
export interface Outfit {
  id?: string;
  name: string;
  items: OutfitItem[];
  occasion?: Occasion | string;
  season?: Season;
  createdAt?: string;
  updatedAt?: string;
  previewImageUrl?: string;
  likes?: number;
  tags?: string[];
}

/**
 * API request to create/update outfit
 */
export interface OutfitRequest {
  name: string;
  occasion?: string;
  season?: string;
  items: Array<{
    clothing_item_id: string;
    layer: ClothingLayer;
    position_x: number;
    position_y: number;
    size_width: number;
    size_height: number;
    rotation: number;
    z_index: number;
  }>;
}

/**
 * API response for outfit
 */
export interface OutfitResponse {
  id: string;
  name: string;
  occasion?: string;
  season?: string;
  preview_image_url?: string;
  items: Array<{
    id: string;
    clothing_item: ClothingItem;
    layer: ClothingLayer;
    position_x: number;
    position_y: number;
    size_width: number;
    size_height: number;
    rotation: number;
    z_index: number;
  }>;
  created_at: string;
  updated_at: string;
  likes?: number;
  tags?: string[];
}

/**
 * Wardrobe filter options
 */
export interface WardrobeFilter {
  category?: ClothingCategory[];
  season?: Season[];
  colors?: string[];
  brands?: string[];
  searchQuery?: string;
}

/**
 * Canvas settings
 */
export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor?: string;
  gridEnabled?: boolean;
  snapToGrid?: boolean;
}

/**
 * Layer configuration
 */
export interface LayerConfig {
  layer: ClothingLayer;
  maxItems: number;
  defaultSize: {
    width: number;
    height: number;
  };
  zIndexBase: number;
}

/**
 * Drag event data
 */
export interface DragData {
  itemId: string;
  sourceLayer?: ClothingLayer;
  startPosition: {
    x: number;
    y: number;
  };
}

/**
 * Canvas interaction mode
 */
export type InteractionMode = 'select' | 'move' | 'resize' | 'rotate';

/**
 * History state for undo/redo
 */
export interface HistoryState {
  outfit: Outfit;
  timestamp: number;
}

/**
 * Export options for outfit image
 */
export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp';
  quality?: number;
  scale?: number;
  includeBackground?: boolean;
}

/**
 * Utility type: Transform API response to frontend format
 */
export function transformOutfitResponse(response: OutfitResponse): Outfit {
  return {
    id: response.id,
    name: response.name,
    occasion: response.occasion,
    season: response.season as Season | undefined,
    previewImageUrl: response.preview_image_url,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    likes: response.likes,
    tags: response.tags,
    items: response.items.map(item => ({
      ...item.clothing_item,
      layer: item.layer,
      position: {
        x: item.position_x,
        y: item.position_y,
      },
      size: {
        width: item.size_width,
        height: item.size_height,
      },
      rotation: item.rotation,
      zIndex: item.z_index,
    })),
  };
}

/**
 * Utility type: Transform frontend outfit to API request
 */
export function transformOutfitToRequest(outfit: Outfit): OutfitRequest {
  return {
    name: outfit.name,
    occasion: outfit.occasion,
    season: outfit.season,
    items: outfit.items.map(item => ({
      clothing_item_id: item.id,
      layer: item.layer,
      position_x: item.position.x,
      position_y: item.position.y,
      size_width: item.size.width,
      size_height: item.size.height,
      rotation: item.rotation,
      z_index: item.zIndex,
    })),
  };
}