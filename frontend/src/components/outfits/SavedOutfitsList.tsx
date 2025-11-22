// src/components/outfits/SavedOutfitsList.tsx
// Simple component to view saved outfits

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import  apiClient  from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, Calendar, Tag, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Backend response interfaces (using snake_case)
interface BackendClothingItem {
  id: number;
  item_image: string;
  category: string;
  season?: string;
  brand?: string;
  material?: string;
  price?: number;
  name?: string;
}

interface BackendOutfitItem {
  id: number;
  clothing_item: BackendClothingItem;
  layer: string;
  position_x: number;
  position_y: number;
  size_width: number;
  size_height: number;
  rotation: number;
  z_index: number;
}

interface BackendOutfit {
  id: number;
  name: string;
  occasion?: string;
  season?: string;
  preview_image_url?: string;
  created_at: string;
  updated_at: string;
  likes: number;
  tags: string[];
  items: BackendOutfitItem[];
}

export function SavedOutfitsList() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<BackendOutfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState<BackendOutfit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOutfits = async () => {
    try {
      const response = await apiClient.get<BackendOutfit[]>('/outfits/');
      console.log('Fetched outfits:', response.data);
      setOutfits(response.data);
    } catch (error: any) {
      console.error('Error fetching outfits:', error);
      toast.error('Failed to load outfits');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  const handleEdit = (outfitId: number) => {
    // Navigate to outfit builder with outfit ID to load and edit
    router.push(`/outfit-builder?edit=${outfitId}`);
  };

  const handleDeleteClick = (outfit: BackendOutfit) => {
    setOutfitToDelete(outfit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!outfitToDelete) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/outfits/${outfitToDelete.id}/`);
      toast.success(`"${outfitToDelete.name}" deleted successfully`);
      
      // Remove from local state
      setOutfits(outfits.filter(o => o.id !== outfitToDelete.id));
      
      setDeleteDialogOpen(false);
      setOutfitToDelete(null);
    } catch (error: any) {
      console.error('Error deleting outfit:', error);
      toast.error('Failed to delete outfit');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg text-gray-500">No saved outfits yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Create your first outfit in the Outfit Builder!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {outfits.map((outfit) => (
        <Card key={outfit.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{outfit.name}</CardTitle>
                
                <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-2">
                  {outfit.occasion && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span className="capitalize">{outfit.occasion}</span>
                    </div>
                  )}
                  {outfit.season && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="capitalize">{outfit.season}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(outfit.id)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Outfit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => handleDeleteClick(outfit)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            {/* Preview image if available */}
            {outfit.preview_image_url && (
              <img
                src={outfit.preview_image_url}
                alt={outfit.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            {/* Item count and details */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {outfit.items.length} {outfit.items.length === 1 ? 'item' : 'items'}
              </p>
              
              <div className="text-xs text-gray-500 space-y-1">
                {outfit.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="capitalize">{item.layer}:</span>
                    <span>{item.clothing_item?.name || item.clothing_item?.category || 'Item'}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-400 pt-2 border-t">
                Created: {new Date(outfit.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Outfit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{outfitToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}