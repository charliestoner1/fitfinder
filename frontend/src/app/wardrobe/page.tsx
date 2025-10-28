// File: src/app/(dashboard)/wardrobe/page.tsx
// Main wardrobe page with upload and grid display

'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClothingUploader } from '@/components/wardrobe/ClothingUploader';
import { WardrobeGrid } from '@/components/wardrobe/WardrobeGrid';
import { wardrobeService } from '@/lib/api/wardrobe';
import { ClothingItem } from '@/types/wardrobe';
import { toast } from 'sonner';

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    loadWardrobeItems();
  }, []);

  const loadWardrobeItems = async () => {
    try {
      setIsLoading(true);
      const data = await wardrobeService.getItems();
      setItems(data);
    } catch (error) {
      toast.error('Failed to load wardrobe items');
      console.error('Error loading wardrobe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploader(false);
    loadWardrobeItems();
    toast.success('Item added to wardrobe!');
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await wardrobeService.deleteItem(id);
      setItems(items.filter(item => item.id !== id));
      toast.success('Item removed from wardrobe');
    } catch (error) {
      toast.error('Failed to delete item');
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wardrobe</h1>
              <p className="text-gray-600 mt-1">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your wardrobe
              </p>
            </div>
            <Button
              onClick={() => setShowUploader(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Clothing
            </Button>
          </div>
        </div>

        {/* Upload Modal/Section */}
        {showUploader && (
          <div className="mb-8">
            <ClothingUploader
              onSuccess={handleUploadSuccess}
              onCancel={() => setShowUploader(false)}
            />
          </div>
        )}

        {/* Wardrobe Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading your wardrobe...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              Your wardrobe is empty
            </div>
            <p className="text-gray-500 mb-6">
              Start by adding your first clothing item
            </p>
            <Button onClick={() => setShowUploader(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        ) : (
          <WardrobeGrid items={items} onDelete={handleDeleteItem} />
        )}
      </div>
    </div>
  );
}