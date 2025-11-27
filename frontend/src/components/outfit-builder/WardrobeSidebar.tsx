// src/components/outfit-builder/WardrobeSidebar.tsx

'use client';

import { useEffect, useState } from 'react';
import { useOutfitBuilderStore, type ClothingItem, type ClothingLayer } from '@/store/outfit-builder-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shirt, ShoppingBag, Layers, Layers2, Watch, Search, Loader2 } from 'lucide-react';
import  apiClient  from '@/lib/api/client';
import { toast } from 'sonner';

interface WardrobeItemCardProps {
  item: ClothingItem;
  layer: ClothingLayer;
  onAddToCanvas: (item: ClothingItem, layer: ClothingLayer) => void;
}

function WardrobeItemCard({ item, layer, onAddToCanvas }: WardrobeItemCardProps) {
  const canAddItemToLayer = useOutfitBuilderStore((state) => state.canAddItemToLayer);
  const canAdd = canAddItemToLayer(layer);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-white transition-all shadow-sm',
        canAdd ? 'cursor-pointer hover:shadow-lg hover:scale-105' : 'cursor-not-allowed opacity-50'
      )}
      onClick={() => canAdd && onAddToCanvas(item, layer)}
    >
      <div className="aspect-square">
        <img
          src={item.imageUrl}
          alt={item.category}
          className="h-full w-full object-cover"
        />
      </div>
      
      <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/40">
        {canAdd && (
          <div className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="secondary" size="sm">
              Add to Outfit
            </Button>
          </div>
        )}
      </div>

      <div className="p-2.5">
        <p className="truncate text-xs font-semibold">{item.category}</p>
        <div className="mt-1.5 flex gap-1">
          {item.colors && item.colors.slice(0, 3).map((color, idx) => (
            <div
              key={idx}
              className="h-4 w-4 rounded-full border-2 border-gray-200 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        {item.brand && (
          <p className="mt-1 text-xs text-gray-500">{item.brand}</p>
        )}
      </div>

      {!canAdd && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="text-sm font-medium text-white">Layer Full</p>
        </div>
      )}
    </div>
  );
}

const LAYER_ICONS = {
  tops: Shirt,
  bottoms: ShoppingBag,
  mid: Layers,
  outer: Layers2,
  accessory: Watch,
};

const LAYER_LABELS = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  mid: 'Mid',
  outer: 'Outer',
  accessory: 'Accessories',
};

const LAYER_DESCRIPTIONS = {
  tops: 'Shirts, blouses, t-shirts, and other upper body clothing',
  bottoms: 'Pants, jeans, skirts, shorts, and other lower body clothing',
  mid: 'Sweaters, hoodies, cardigans, and mid-layer items',
  outer: 'Jackets, coats, blazers, and outerwear',
  accessory: 'Hats, scarves, belts, jewelry, bags, and shoes',
};

// Backend response interface
interface BackendWardrobeItem {
  id: number;
  item_image: string;
  category: string;
  season?: string;
  brand?: string;
  material?: string;
  price?: number;
  name?: string;
}

export function WardrobeSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const wardrobeItems = useOutfitBuilderStore((state) => state.wardrobeItems);
  const addItemToCanvas = useOutfitBuilderStore((state) => state.addItemToCanvas);
  const setWardrobeItems = useOutfitBuilderStore((state) => state.setWardrobeItems);

  useEffect(() => {
    const fetchWardrobeItems = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<BackendWardrobeItem[]>('/wardrobe/items/');
        
        // Transform backend data to frontend ClothingItem format
        const transformedItems: ClothingItem[] = response.data.map(item => ({
          id: item.id.toString(), // Convert number to string for frontend
          imageUrl: item.item_image || 'https://via.placeholder.com/200/CCCCCC/FFFFFF?text=No+Image',
          category: item.category || 'Uncategorized',
          colors: ['#CCCCCC'], // Default color - can be enhanced with ML tagging later
          season: item.season || 'None',
          brand: item.brand || 'None',
        }));
        
        console.log('Loaded wardrobe items:', transformedItems);
        setWardrobeItems(transformedItems);
      } catch (error: any) {
        console.error('Error fetching wardrobe items:', error);
        toast.error('Failed to load wardrobe items');
        
        // Fallback to empty array if API fails
        setWardrobeItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWardrobeItems();
  }, [setWardrobeItems]);

  const getItemsByCategory = (items: ClothingItem[], layer: ClothingLayer) => {
    // More flexible category matching
    const categoryMap: Record<ClothingLayer, string[]> = {
      tops: ['tops', 't-shirt', 'shirt', 'blouse', 'top', 'dress', 'tank', 'polo', 'turtleneck'],
      bottoms: ['bottoms', 'pants', 'jeans', 'shorts', 'skirt', 'bottom', 'trousers', 'leggings'],
      mid: ['innerwear', 'sweater', 'cardigan', 'vest', 'hoodie', 'pullover', 'sweatshirt'],
      outer: ['outerwear', 'jacket', 'coat', 'blazer', 'parka', 'windbreaker'],
      accessory: ['accessories', 'shoes', 'hat', 'scarf', 'belt', 'jewelry', 'bag', 'watch', 'accessory', 'socks', 'tie', 'etc.'],
};

    // Filter by layer
    let filteredItems = items.filter(item => {
      const itemCategory = item.category.toLowerCase();
      return categoryMap[layer].some(cat => 
        itemCategory.includes(cat) || cat.includes(itemCategory)
      );
    });

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.category.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        (item.colors && item.colors.some(color => color.toLowerCase().includes(query)))
      );
    }

    return filteredItems;
  };

  if (isLoading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading your wardrobe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Your Wardrobe</h2>
        <p className="text-xs text-gray-500 mb-3">
          Click items to add them to your outfit
        </p>
        
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <Tabs defaultValue="tops" className="h-[calc(100%-140px)]">
        <TabsList className="w-full justify-start rounded-none border-b px-2">
          {(Object.keys(LAYER_ICONS) as ClothingLayer[]).map((layer) => {
            const Icon = LAYER_ICONS[layer];
            return (
              <TabsTrigger key={layer} value={layer} className="gap-2 text-sm py-3 px-4 min-w-[80px]">
                <Icon className="h-4 w-4" />
                {LAYER_LABELS[layer]}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(LAYER_ICONS) as ClothingLayer[]).map((layer) => {
          const layerItems = getItemsByCategory(wardrobeItems, layer);
          
          return (
            <TabsContent key={layer} value={layer} className="h-full p-4">
              <div className="mb-3 rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-600">{LAYER_DESCRIPTIONS[layer]}</p>
                {searchQuery && (
                  <p className="text-xs text-gray-500 mt-1">
                    {layerItems.length} {layerItems.length === 1 ? 'item' : 'items'} found
                  </p>
                )}
              </div>

              <ScrollArea className="h-[calc(100%-80px)]">
                {layerItems.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-gray-400">
                    <p className="text-sm text-center">
                      {searchQuery 
                        ? 'No items match your search' 
                        : wardrobeItems.length === 0
                        ? 'Your wardrobe is empty. Add some items first!'
                        : 'No items in this category'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 pr-6">
                    {layerItems.map((item) => (
                      <WardrobeItemCard
                        key={item.id}
                        item={item}
                        layer={layer}
                        onAddToCanvas={addItemToCanvas}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}