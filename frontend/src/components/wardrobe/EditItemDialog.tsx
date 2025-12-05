// File: src/components/wardrobe/EditItemDialog.tsx
// Dialog for editing existing wardrobe items

'use client';

import { useState, useEffect } from 'react';
import { ClothingItem } from '@/types/wardrobe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { wardrobeService } from '@/lib/api/wardrobe';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EditItemDialogProps {
  item: ClothingItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Mid Layer',
  'Outer Layer',
  'Accessory',
  'Other',
];

const SEASONS = [
  'Spring',
  'Summer',
  'Fall',
  'Winter',
  'All Season',
];

export function EditItemDialog({ item, open, onOpenChange, onSuccess }: EditItemDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('');
  const [brand, setBrand] = useState('');
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState('');

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || '');
      setSeason(item.season || '');
      setBrand(item.brand || '');
      setMaterial(item.material || '');
      setPrice(item.price ? item.price.toString() : '');
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;
    
    if (!name.trim()) {
      toast.error('Please provide an item name');
      return;
    }

    try {
      setIsUpdating(true);

      const updateData: any = {
        name: name.trim(),
      };

      if (category) updateData.category = category;
      if (season) updateData.season = season;
      if (brand) updateData.brand = brand;
      if (material) updateData.material = material;
      if (price) updateData.price = parseFloat(price);

      console.log('Updating item:', item.id, updateData);

      await wardrobeService.updateItem(item.id, updateData);
      
      toast.success('Item updated successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to update item:', error);
      toast.error(error.response?.data?.message || 'Failed to update item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Edit Item Details</DialogTitle>
          <DialogDescription className="text-gray-600">
            Update the details of your wardrobe item
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
              <img
                src={item.itemImage?.startsWith('http') 
                  ? item.itemImage 
                  : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/media/${item.itemImage}`
                }
                alt={item.name || 'Item'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Item Name - Required */}
          <div>
            <Label htmlFor="edit-name" className="mb-2 block text-gray-700 font-semibold">
              Item Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="e.g., Blue Denim Jeans, Red T-Shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isUpdating}
              required
              className="bg-white text-gray-900 border-gray-300"
            />
          </div>

          {/* Optional Details */}
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Additional Details (Optional)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="edit-category" className="mb-2 block text-gray-700 font-semibold">Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={isUpdating}
                >
                  <SelectTrigger id="edit-category" className="bg-white text-gray-900 border-gray-300">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="cursor-pointer text-gray-900">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-season" className="mb-2 block text-gray-700 font-semibold">Season</Label>
                <Select
                  value={season}
                  onValueChange={setSeason}
                  disabled={isUpdating}
                >
                  <SelectTrigger id="edit-season" className="bg-white text-gray-900 border-gray-300">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {SEASONS.map((s) => (
                      <SelectItem key={s} value={s} className="cursor-pointer text-gray-900">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-brand" className="mb-2 block text-gray-700 font-semibold">Brand</Label>
                <Input
                  id="edit-brand"
                  placeholder="e.g., Nike, Zara"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={isUpdating}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="edit-material" className="mb-2 block text-gray-700 font-semibold">Material</Label>
                <Input
                  id="edit-material"
                  placeholder="e.g., Cotton, Denim"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  disabled={isUpdating}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="edit-price" className="mb-2 block text-gray-700 font-semibold">Price (USD)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isUpdating}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} variant="outline">
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdating ? 'Updating...' : 'Update Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
