// File: src/components/wardrobe/ClothingItemCard.tsx
// Individual clothing item card with image, metadata, and actions

'use client';

import { useState } from 'react';
import { MoreVertical, Trash2, Edit, Tag, Calendar } from 'lucide-react';
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
}

export function ClothingItemCard({ item, onDelete }: ClothingItemCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100">
          <img
            src={item.image}
            alt={item.category || 'Clothing item'}
            className="w-full h-full object-cover"
          />
          
          {/* Action Menu */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="h-8 w-8 bg-white/90 hover:bg-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
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
        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Category */}
            {item.category && (
              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {item.category}
                </span>
              </div>
            )}

            {/* Season */}
            {item.season && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">{item.season}</span>
              </div>
            )}

            {/* Colors */}
            {item.colors && item.colors.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {item.colors.slice(0, 3).map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  {item.colors.length > 3 && (
                    <span className="text-xs text-gray-500 ml-1">
                      +{item.colors.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Brand & Price */}
            <div className="flex items-center justify-between pt-2 border-t">
              {item.brand && (
                <span className="text-xs text-gray-500">{item.brand}</span>
              )}
              {item.price && (
                <span className="text-sm font-semibold text-gray-900">
                  ${item.price.toFixed(2)}
                </span>
              )}
            </div>

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
              Are you sure you want to remove this item from your wardrobe? This action cannot be undone.
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
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}