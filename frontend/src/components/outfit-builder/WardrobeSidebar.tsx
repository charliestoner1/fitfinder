
// src/components/outfit-builder/WardrobeSidebar.tsx


'use client';

import { useEffect, useState } from 'react';
import { useOutfitBuilderStore, type ClothingItem, type ClothingLayer } from '@/store/outfit-builder-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shirt, ShoppingBag, Layers, Layers2, Watch, Search } from 'lucide-react';

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
          {item.colors.slice(0, 3).map((color, idx) => (
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
  mid: 'Mid-Layer',
  outer: 'Outer Layer',
  accessory: 'Accessories',
};

const LAYER_DESCRIPTIONS = {
  tops: 'Shirts, blouses, t-shirts, and other upper body clothing',
  bottoms: 'Pants, jeans, skirts, shorts, and other lower body clothing',
  mid: 'Sweaters, hoodies, cardigans, and mid-layer items',
  outer: 'Jackets, coats, blazers, and outerwear',
  accessory: 'Hats, scarves, belts, jewelry, bags, and shoes',
};

export function WardrobeSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const wardrobeItems = useOutfitBuilderStore((state) => state.wardrobeItems);
  const addItemToCanvas = useOutfitBuilderStore((state) => state.addItemToCanvas);
  const setWardrobeItems = useOutfitBuilderStore((state) => state.setWardrobeItems);

  // TODO: Fetch wardrobe items from API
  // Once Thai-Son finishes the backend, replace mock data with this:
  /*
  useEffect(() => {
    const fetchWardrobeItems = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await axios.get(`${API_URL}/wardrobe/items/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        
        const { keysToCamelCase } = await import('@/lib/utils/case-transformer');
        const transformedData = keysToCamelCase<ClothingItem[]>(response.data);
        setWardrobeItems(transformedData);
      } catch (error) {
        console.error('Error fetching wardrobe items:', error);
      }
    };

    fetchWardrobeItems();
  }, [setWardrobeItems]);
  */
  
  useEffect(() => {
    // Mock data for development - includes various item types
    const mockItems: ClothingItem[] = [
      // Tops
      {
        id: '1',
        imageUrl: 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=Red+T-Shirt',
        category: 'T-Shirt',
        colors: ['#FF6B6B', '#FFFFFF'],
        season: 'summer',
        brand: 'Nike',
      },
      {
        id: '3',
        imageUrl: 'https://via.placeholder.com/200/95E1D3/000000?text=White+Shirt',
        category: 'Shirt',
        colors: ['#95E1D3', '#FFFFFF'],
        season: 'all',
        brand: 'H&M',
      },
      {
        id: '11',
        imageUrl: 'https://via.placeholder.com/200/C7CEEA/000000?text=Blue+Blouse',
        category: 'Blouse',
        colors: ['#C7CEEA'],
        season: 'spring',
        brand: 'Zara',
      },
      
      // Bottoms
      {
        id: '2',
        imageUrl: 'https://via.placeholder.com/200/4ECDC4/FFFFFF?text=Blue+Jeans',
        category: 'Jeans',
        colors: ['#4ECDC4'],
        season: 'all',
        brand: "Levi's",
      },
      {
        id: '4',
        imageUrl: 'https://via.placeholder.com/200/3D3D3D/FFFFFF?text=Black+Pants',
        category: 'Pants',
        colors: ['#000000'],
        season: 'all',
        brand: 'Zara',
      },
      {
        id: '12',
        imageUrl: 'https://via.placeholder.com/200/B8E994/000000?text=Khaki+Shorts',
        category: 'Shorts',
        colors: ['#B8E994'],
        season: 'summer',
        brand: 'Gap',
      },
      
      // Mid-layer
      {
        id: '5',
        imageUrl: 'https://via.placeholder.com/200/AA96DA/FFFFFF?text=Purple+Sweater',
        category: 'Sweater',
        colors: ['#AA96DA'],
        season: 'winter',
        brand: 'Gap',
      },
      {
        id: '6',
        imageUrl: 'https://via.placeholder.com/200/FCBAD3/000000?text=Pink+Hoodie',
        category: 'Hoodie',
        colors: ['#FCBAD3'],
        season: 'fall',
        brand: 'Adidas',
      },
      
      // Outer layer
      {
        id: '7',
        imageUrl: 'https://via.placeholder.com/200/A8D8EA/000000?text=Light+Jacket',
        category: 'Jacket',
        colors: ['#A8D8EA'],
        season: 'spring',
        brand: 'North Face',
      },
      {
        id: '8',
        imageUrl: 'https://via.placeholder.com/200/FFD93D/000000?text=Yellow+Coat',
        category: 'Coat',
        colors: ['#FFD93D'],
        season: 'winter',
        brand: 'Patagonia',
      },
      
      // Accessories
      {
        id: '9',
        imageUrl: 'https://via.placeholder.com/200/6BCB77/FFFFFF?text=Green+Hat',
        category: 'Hat',
        colors: ['#6BCB77'],
        season: 'summer',
        brand: 'Generic',
      },
      {
        id: '10',
        imageUrl: 'https://via.placeholder.com/200/4D96FF/FFFFFF?text=Blue+Scarf',
        category: 'Scarf',
        colors: ['#4D96FF'],
        season: 'winter',
        brand: 'Generic',
      },
    ];
    
    setWardrobeItems(mockItems);
  }, [setWardrobeItems]);

  const getItemsByCategory = (items: ClothingItem[], layer: ClothingLayer) => {
    // More flexible category matching
    const categoryMap: Record<ClothingLayer, string[]> = {
      tops: ['t-shirt', 'shirt', 'blouse', 'top', 'dress', 'tank', 'polo', 'turtleneck'],
      bottoms: ['pants', 'jeans', 'shorts', 'skirt', 'bottom', 'trousers', 'leggings'],
      mid: ['sweater', 'cardigan', 'vest', 'hoodie', 'pullover', 'sweatshirt'],
      outer: ['jacket', 'coat', 'blazer', 'parka', 'outerwear', 'windbreaker'],
      accessory: ['hat', 'scarf', 'belt', 'jewelry', 'bag', 'shoes', 'watch', 'accessory', 'socks', 'tie'],
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
        item.colors.some(color => color.toLowerCase().includes(query))
      );
    }

    return filteredItems;
  };

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
            placeholder="Search by name, brand, or color..."
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
        <TabsList className="w-full justify-start rounded-none border-b px-4">
          {(Object.keys(LAYER_ICONS) as ClothingLayer[]).map((layer) => {
            const Icon = LAYER_ICONS[layer];
            return (
              <TabsTrigger key={layer} value={layer} className="gap-2 text-xs">
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
                    <p className="text-sm">
                      {searchQuery ? 'No items match your search' : 'No items in this category'}
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

