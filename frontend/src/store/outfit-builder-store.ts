/**
 * File: src/store/outfit-builder-store.ts
 * Zustand store for outfit builder state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types
export type ClothingLayer = 'tops' | 'bottoms' | 'mid' | 'outer' | 'accessory';

export interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  colors: string[];
  season: string;
  brand?: string;
}

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

export interface Outfit {
  id?: string;
  name: string;
  items: OutfitItem[];
  occasion?: string;
  season?: string;
  createdAt?: string;
  updatedAt?: string;
  previewImageUrl?: string;
}

interface OutfitBuilderState {
  // Current outfit being built
  currentOutfit: Outfit;
  selectedItemId: string | null;
  
  // Available wardrobe items to drag from
  wardrobeItems: ClothingItem[];
  
  // Canvas settings
  canvasSize: {
    width: number;
    height: number;
  };
  
  // Saved outfits
  savedOutfits: Outfit[];
  
  // Actions
  addItemToCanvas: (item: ClothingItem, layer: ClothingLayer) => void;
  removeItemFromCanvas: (itemId: string) => void;
  updateItemPosition: (itemId: string, position: { x: number; y: number }) => void;
  updateItemSize: (itemId: string, size: { width: number; height: number }) => void;
  updateItemRotation: (itemId: string, rotation: number) => void;
  updateItemLayer: (itemId: string, layer: ClothingLayer) => void;
  bringToFront: (itemId: string) => void;
  sendToBack: (itemId: string) => void;
  
  setSelectedItem: (itemId: string | null) => void;
  
  // Outfit operations
  saveOutfit: (name: string, occasion?: string) => void;
  loadOutfit: (outfitId: string) => void;
  clearCanvas: () => void;
  setOutfitName: (name: string) => void;
  setOutfitOccasion: (occasion: string) => void;
  
  // Wardrobe operations
  setWardrobeItems: (items: ClothingItem[]) => void;
  
  // Utility
  getItemsByLayer: (layer: ClothingLayer) => OutfitItem[];
  canAddItemToLayer: (layer: ClothingLayer) => boolean;
}

const DEFAULT_CANVAS_SIZE = { width: 400, height: 800 };

const DEFAULT_ITEM_SIZE = {
  tops: { width: 200, height: 220 },
  bottoms: { width: 200, height: 240 },
  mid: { width: 220, height: 240 },
  outer: { width: 240, height: 280 },
  accessory: { width: 100, height: 100 },
};

const LAYER_Z_INDEX = {
  bottoms: 1,
  tops: 2,
  mid: 3,
  outer: 4,
  accessory: 5,
};

export const useOutfitBuilderStore = create<OutfitBuilderState>()(
  devtools(
    (set, get): OutfitBuilderState => ({
      currentOutfit: {
        name: 'Untitled Outfit',
        items: [],
      },
      selectedItemId: null,
      wardrobeItems: [],
      canvasSize: DEFAULT_CANVAS_SIZE,
      savedOutfits: [],

      addItemToCanvas: (item: ClothingItem, layer: ClothingLayer) => {
        const state = get();
        
        // Check if we can add to this layer (e.g., max 1 base layer item)
        if (!state.canAddItemToLayer(layer)) {
          console.warn(`Cannot add more items to layer: ${layer}`);
          return;
        }

        const existingItems = state.currentOutfit.items;
        const maxZIndex = existingItems.length > 0 
          ? Math.max(...existingItems.map((i: OutfitItem) => i.zIndex))
          : 0;

        // Get default size for layer, with fallback
        const defaultSize = DEFAULT_ITEM_SIZE[layer] || { width: 150, height: 150 };

        const outfitItem: OutfitItem = {
          ...item,
          layer,
          position: {
            x: state.canvasSize.width / 2 - defaultSize.width / 2,
            y: state.canvasSize.height / 2 - defaultSize.height / 2,
          },
          size: defaultSize,
          rotation: 0,
          zIndex: maxZIndex + 1,
        };

        set((state) => ({
          currentOutfit: {
            ...state.currentOutfit,
            items: [...state.currentOutfit.items, outfitItem],
          },
          selectedItemId: outfitItem.id,
        }));
      },

      removeItemFromCanvas: (itemId: string) => {
        set((state) => ({
          currentOutfit: {
            ...state.currentOutfit,
            items: state.currentOutfit.items.filter(item => item.id !== itemId),
          },
          selectedItemId: state.selectedItemId === itemId ? null : state.selectedItemId,
        }));
      },

      updateItemPosition: (itemId: string, position: { x: number; y: number }) => {
        set((state) => ({
          currentOutfit: {
            ...state.currentOutfit,
            items: state.currentOutfit.items.map(item =>
              item.id === itemId ? { ...item, position } : item
            ),
          },
        }));
      },

      updateItemSize: (itemId: string, size: { width: number; height: number }) => {
        set((state) => ({
          currentOutfit: {
            ...state.currentOutfit,
            items: state.currentOutfit.items.map(item =>
              item.id === itemId ? { ...item, size } : item
            ),
          },
        }));
      },

      updateItemRotation: (itemId: string, rotation: number) => {
        set((state) => ({
          currentOutfit: {
            ...state.currentOutfit,
            items: state.currentOutfit.items.map(item =>
              item.id === itemId ? { ...item, rotation } : item
            ),
          },
        }));
      },

      updateItemLayer: (itemId: string, layer: ClothingLayer) => {
        set((state) => ({
          currentOutfit: {
            ...state.currentOutfit,
            items: state.currentOutfit.items.map(item =>
              item.id === itemId 
                ? { ...item, layer, zIndex: LAYER_Z_INDEX[layer] } 
                : item
            ),
          },
        }));
      },

      bringToFront: (itemId: string) => {
        set((state) => {
          const items = state.currentOutfit.items;
          const maxZIndex = Math.max(...items.map((i: OutfitItem) => i.zIndex));
          
          return {
            currentOutfit: {
              ...state.currentOutfit,
              items: items.map(item =>
                item.id === itemId ? { ...item, zIndex: maxZIndex + 1 } : item
              ),
            },
          };
        });
      },

      sendToBack: (itemId: string) => {
        set((state) => {
          const items = state.currentOutfit.items;
          const minZIndex = Math.min(...items.map((i: OutfitItem) => i.zIndex));
          
          return {
            currentOutfit: {
              ...state.currentOutfit,
              items: items.map(item =>
                item.id === itemId ? { ...item, zIndex: minZIndex - 1 } : item
              ),
            },
          };
        });
      },

      setSelectedItem: (itemId: string | null) => {
        set({ selectedItemId: itemId });
      },

      saveOutfit: (name: string, occasion?: string) => {
        const state = get();
        const outfit: Outfit = {
          id: `outfit-${Date.now()}`,
          name,
          items: state.currentOutfit.items,
          occasion,
          season: state.currentOutfit.season,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          savedOutfits: [...state.savedOutfits, outfit],
          currentOutfit: {
            ...state.currentOutfit,
            name,
            occasion,
          },
        }));

        // TODO: Call API to save outfit to backend
        console.log('Outfit saved:', outfit);
      },

      loadOutfit: (outfitId: string) => {
        const state = get();
        const outfit = state.savedOutfits.find(o => o.id === outfitId);
        
        if (outfit) {
          set({
            currentOutfit: { ...outfit },
            selectedItemId: null,
          });
        }
      },

      clearCanvas: () => {
        set({
          currentOutfit: {
            name: 'Untitled Outfit',
            items: [],
          },
          selectedItemId: null,
        });
      },

      setOutfitName: (name: string) => {
        set((state) => ({
          currentOutfit: {
            ...state.currentOutfit,
            name,
          },
        }));
      },

      setOutfitOccasion: (occasion: string) => {
        set((state) => ({
          currentOutfit: {
            ...state.currentOutfit,
            occasion,
          },
        }));
      },

      setWardrobeItems: (items: ClothingItem[]) => {
        set({ wardrobeItems: items });
      },

      getItemsByLayer: (layer: ClothingLayer) => {
        return get().currentOutfit.items.filter(item => item.layer === layer);
      },

      canAddItemToLayer: (layer: ClothingLayer) => {
        const items = get().currentOutfit.items.filter(item => item.layer === layer);
        
        // Increased limits to allow more flexibility
        const MAX_ITEMS_PER_LAYER: Record<ClothingLayer, number> = {
          tops: 2,      // Usually 1-2 tops (shirt, maybe undershirt)
          bottoms: 1,   // Typically 1 bottom (pants/skirt)
          mid: 3,       // Allow multiple mid layer items
          outer: 3,     // Allow multiple outer items
          accessory: 8, // Allow many accessories
        };
        
        if (items.length >= MAX_ITEMS_PER_LAYER[layer]) {
          return false;
        }
        
        return true;
      },
    }),
    { name: 'outfit-builder-store' }
  )
);