// File: src/components/wardrobe/ClothingItemCard.tsx
// Individual clothing item card with image, metadata, and actions
// Fixed to match Django backend model fields

'use client';

import { useState } from 'react';
import { MoreVertical, Trash2, Edit, Tag, Calendar, Package } from 'lucide-react';
import { ClothingItem } from '@/types/wardrobe';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ClothingItemCardProps {
  item: ClothingItem;
  onDelete: () => void;
  onEdit?: (item: ClothingItem) => void;
}

export function ClothingItemCard({ item, onDelete, onEdit }: ClothingItemCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(item);
    }
  };

  // Construct full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    // If already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, prepend the backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const baseUrl = backendUrl.replace('/api', ''); // Remove /api suffix if present
    return `${baseUrl}/media/${imagePath}`;
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col justify-between">
        {/* Image */}
        <div className="relative bg-gray-100 flex items-center justify-center" style={{ minHeight: '260px', maxHeight: '260px', height: '260px' }}>
          <img
            src={getImageUrl(item.itemImage)}
            alt={item.name || item.category || 'Clothing item'}
            className="w-full h-full object-cover object-center"
            style={{ maxHeight: '260px', minHeight: '260px', height: '260px' }}
          />
          {/* Action Menu */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="h-8 w-8 bg-white hover:bg-gray-100 shadow-md"
                >
                  <MoreVertical className="w-4 h-4 text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer focus:text-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Details */}
        <CardContent className="p-4 flex-1 flex flex-col justify-end">
          <div className="space-y-2">
            {/* Item Name */}
            {item.name && (
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {item.name}
                </span>
              </div>
            )}

            {/* Category */}
            {item.category && (
              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {item.category}
                </span>
              </div>
            )}

            {/* Season */}
            {item.season && item.season !== 'None' && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">{item.season}</span>
              </div>
            )}

            {/* Brand & Price */}
            {(item.brand || item.price) && (
              <div className="flex items-center justify-between pt-2 border-t">
                {item.brand && (
                  <span className="text-xs text-gray-500">{item.brand}</span>
                )}
                {item.price && (
                  <span className="text-sm font-semibold text-gray-900">
                    ${Number(item.price).toFixed(2)}
                  </span>
                )}
              </div>
            )}

            {/* Material */}
            {item.material && (
              <div className="text-xs text-gray-500">
                Material: {item.material}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{item.name}&quot; from your wardrobe? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="text-black border border-pink-200 hover:bg-pink-50"
              style={{ background: 'white' }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}