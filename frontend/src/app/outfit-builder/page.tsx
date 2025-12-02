// src/app/outfit-builder/page.tsx
// Updated to support editing existing outfits

'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
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
    <div className="flex h-screen flex-col bg-no-repeat bg-fixed" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cdefs%3E%3Cstyle%3E.bow-loop%7Bfill:%23FFAEDA;opacity:0.45%7D.bow-center%7Bfill:%23FFAEDA;opacity:0.6%7D%3C/style%3E%3C/defs%3E%3Cg transform=%22translate(30,20)%22%3E%3Cpath class=%22bow-loop%22 d=%22M -8 0 C -12 -4 -12 -8 -8 -10 C -4 -8 -4 -2 -8 0 Z%22/%3E%3Cpath class=%22bow-loop%22 d=%22M 8 0 C 12 -4 12 -8 8 -10 C 4 -8 4 -2 8 0 Z%22/%3E%3Crect class=%22bow-center%22 x=%22-1.5%22 y=%22-3%22 width=%223%22 height=%226%22 rx=%221%22/%3E%3C/g%3E%3Cg transform=%22translate(150,60)%22%3E%3Cpath class=%22bow-loop%22 d=%22M -8 0 C -12 -4 -12 -8 -8 -10 C -4 -8 -4 -2 -8 0 Z%22/%3E%3Cpath class=%22bow-loop%22 d=%22M 8 0 C 12 -4 12 -8 8 -10 C 4 -8 4 -2 8 0 Z%22/%3E%3Crect class=%22bow-center%22 x=%22-1.5%22 y=%22-3%22 width=%223%22 height=%226%22 rx=%221%22/%3E%3C/g%3E%3Cg transform=%22translate(60,140)%22%3E%3Cpath class=%22bow-loop%22 d=%22M -8 0 C -12 -4 -12 -8 -8 -10 C -4 -8 -4 -2 -8 0 Z%22/%3E%3Cpath class=%22bow-loop%22 d=%22M 8 0 C 12 -4 12 -8 8 -10 C 4 -8 4 -2 8 0 Z%22/%3E%3Crect class=%22bow-center%22 x=%22-1.5%22 y=%22-3%22 width=%223%22 height=%226%22 rx=%221%22/%3E%3C/g%3E%3Cg transform=%22translate(170,150)%22%3E%3Cpath class=%22bow-loop%22 d=%22M -8 0 C -12 -4 -12 -8 -8 -10 C -4 -8 -4 -2 -8 0 Z%22/%3E%3Cpath class=%22bow-loop%22 d=%22M 8 0 C 12 -4 12 -8 8 -10 C 4 -8 4 -2 8 0 Z%22/%3E%3Crect class=%22bow-center%22 x=%22-1.5%22 y=%22-3%22 width=%223%22 height=%226%22 rx=%221%22/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '200px 200px', backgroundColor: '#ffffff' }}>
      <Navbar />
      <OutfitBuilderToolbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Wardrobe */}
        <div className="w-[550px] border-r overflow-y-auto">
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
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#ffffff' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#86B4FA' }} />
      </div>
    }>
      <OutfitBuilderContent />
    </Suspense>
  );
}