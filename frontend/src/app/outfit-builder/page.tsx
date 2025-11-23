// src/app/outfit-builder/page.tsx
// Updated to support editing existing outfits

'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOutfitBuilderStore } from '@/store/outfit-builder-store';
import { WardrobeSidebar } from '@/components/outfit-builder/WardrobeSidebar';
import { OutfitCanvas } from '@/components/outfit-builder/OutfitCanvas';
import { OutfitBuilderToolbar } from '@/components/outfit-builder/OutfitBuilderToolbar';
import  apiClient from '@/lib/api/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

function OutfitBuilderContent() {
  const searchParams = useSearchParams();
  const editOutfitId = searchParams.get('edit');
  const clearCanvas = useOutfitBuilderStore((state) => state.clearCanvas);
  const addItemToCanvas = useOutfitBuilderStore((state) => state.addItemToCanvas);

  useEffect(() => {
    const loadOutfitForEditing = async () => {
      if (!editOutfitId) {
        // Clear canvas when entering builder in create mode
        clearCanvas();
        return;
      }

      try {
        // Fetch the outfit from backend
        const response = await apiClient.get(`/outfits/${editOutfitId}/`);
        const backendOutfit = response.data;

        // Clear canvas first
        clearCanvas();

        // Add each item to the canvas with its saved properties
        backendOutfit.items.forEach((item: any) => {
          const clothingItem = {
            id: item.clothing_item.id.toString(),
            imageUrl: item.clothing_item.item_image,
            category: item.clothing_item.name || item.clothing_item.category,
            colors: ['#CCCCCC'],
            season: item.clothing_item.season,
            brand: item.clothing_item.brand,
          };

          // Add to canvas with saved position, size, rotation
          addItemToCanvas(clothingItem, item.layer);

          // Update the item's properties to match saved state
          const addedItem = useOutfitBuilderStore.getState().currentOutfit.items.find(
            (i) => i.id === clothingItem.id
          );
          
          if (addedItem) {
            useOutfitBuilderStore.setState((state) => ({
              currentOutfit: {
                ...state.currentOutfit,
                name: backendOutfit.name,
                occasion: backendOutfit.occasion,
                season: backendOutfit.season,
                items: state.currentOutfit.items.map((i) =>
                  i.id === addedItem.id
                    ? {
                        ...i,
                        position: { x: item.position_x, y: item.position_y },
                        size: { width: item.size_width, height: item.size_height },
                        rotation: item.rotation,
                        zIndex: item.z_index,
                      }
                    : i
                ),
              },
            }));
          }
        });

        // Set the outfit metadata
        useOutfitBuilderStore.setState((state) => ({
          currentOutfit: {
            ...state.currentOutfit,
            id: editOutfitId,
            name: backendOutfit.name,
            occasion: backendOutfit.occasion,
            season: backendOutfit.season,
          },
        }));

        toast.success('Outfit loaded for editing');
      } catch (error) {
        console.error('Error loading outfit:', error);
        toast.error('Failed to load outfit');
      }
    };

    loadOutfitForEditing();
  }, [editOutfitId, clearCanvas, addItemToCanvas]);

  return (
    <div className="flex h-screen flex-col">
      <OutfitBuilderToolbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Wardrobe */}
        <div className="w-96 border-r">
          <WardrobeSidebar />
        </div>

        {/* Main Canvas */}
        <div className="flex-1 p-6 overflow-auto">
          <OutfitCanvas />
        </div>
      </div>
    </div>
  );
}

export default function OutfitBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <OutfitBuilderContent />
    </Suspense>
  );
}