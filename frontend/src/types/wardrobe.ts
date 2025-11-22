// frontend/src/types/wardrobe.ts

export interface ClothingItem {
  id: number;
  user: number;
  image: string;
  category: string;
  colors: string[];
  season: string;
  brand?: string;
  material?: string;
  price?: number;
  created_at: string;
  updated_at: string;
}

export interface ClothingItemCreate {
  image: File;
  category?: string;
  colors?: string[];
  season?: string;
  brand?: string;
  material?: string;
  price?: number;
}

export interface ClothingItemUpdate {
  category?: string;
  colors?: string[];
  season?: string;
  brand?: string;
  material?: string;
  price?: number;
}