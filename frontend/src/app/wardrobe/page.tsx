// File: src/app/wardrobe/page.tsx
// Improved wardrobe page with better UX and empty state handling

'use client';

import { useState, useEffect } from 'react';
import { Plus, Upload, Search, Filter, Loader2, Package } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClothingUploader } from '@/components/wardrobe/ClothingUploader';
import { WardrobeCategoryGrid } from '@/components/wardrobe/WardrobeCategoryGrid';
import { wardrobeService } from '@/lib/api/wardrobe';
import { ClothingItem } from '@/types/wardrobe';
import { toast } from 'sonner';


export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWardrobeItems();
  }, []);

  useEffect(() => {
    // Filter items based on search query
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item => 
        item.category?.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.season?.toLowerCase().includes(query) ||
        item.material?.toLowerCase().includes(query)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  const loadWardrobeItems = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading wardrobe items...');
      const data = await wardrobeService.getItems();
      console.log('✅ Loaded items:', data);
      setItems(data);
      setFilteredItems(data);
    } catch (error: any) {
      console.error('❌ Failed to load wardrobe:', error);
      
      // More specific error messages
      if (error.response?.status === 401) {
        toast.error('Please log in to view your wardrobe');
      } else if (error.response?.status === 404) {
        toast.error('Wardrobe not found. Please try again.');
      } else {
        toast.error('Failed to load wardrobe items');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploader(false);
    loadWardrobeItems();
    toast.success('Item added to wardrobe!', {
      description: 'Your new item is now available',
    });
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

  const handleOpenUploader = () => {
    setShowUploader(true);
    // Scroll to top when uploader opens
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Empty state when no items
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-6 mb-6" style={{ backgroundColor: '#fce4ec' }}>
        <Package className="w-16 h-16" style={{ color: '#FFAEDA' }} />
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFAEDA' }}>
        Your wardrobe is empty
      </h2>
      <p className="text-slate-600 text-center max-w-md">
        Start building your digital wardrobe by uploading your first clothing item. 
        Upload a photo and let our AI help organize it!
      </p>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#86B4FA' }} />
          <p className="text-slate-600 text-lg">Loading your wardrobe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#FFAEDA' }}>My Wardrobe</h1>
              <p className="text-slate-600 mt-1">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your collection
                {searchQuery && filteredItems.length !== items.length && (
                  <span className="ml-2" style={{ color: '#86B4FA' }}>
                    ({filteredItems.length} {filteredItems.length === 1 ? 'match' : 'matches'})
                  </span>
                )}
              </p>
            </div>
            <div className = "flex  sm:items-center sm:justify-between gap-3"> 
              <Button
              onClick={handleOpenUploader}
              size="lg"
              className="shadow-md hover:shadow-lg transition-shadow whitespace-nowrap"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Clothing
            </Button>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {showUploader && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <ClothingUploader
              onSuccess={handleUploadSuccess}
              onCancel={() => setShowUploader(false)}
            />
          </div>
        )}

        {/* Search and Filter Bar */}
        {items.length > 0 && !showUploader && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by category, brand, season, or material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" size="lg" className="whitespace-nowrap">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        )}

        {/* Content Area */}
        {items.length === 0 ? (
          <EmptyState />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No items found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search terms
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <WardrobeCategoryGrid items={filteredItems} onDelete={handleDeleteItem} />
          </div>
        )}

        {/* Floating Action Button for Mobile */}
        {items.length > 0 && !showUploader && (
          <button
            onClick={handleOpenUploader}
            className="fixed bottom-6 right-6 sm:hidden bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-50"
            aria-label="Add clothing"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}