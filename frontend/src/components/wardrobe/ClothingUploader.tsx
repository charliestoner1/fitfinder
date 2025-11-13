// File: src/components/wardrobe/ClothingUploader.tsx
// Clothing upload component with drag-and-drop and form fields

'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { wardrobeService } from '@/lib/api/wardrobe';
import { toast } from 'sonner';

interface ClothingUploaderProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClothingUploader({ onSuccess, onCancel }: ClothingUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Form fields
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('');
  const [brand, setBrand] = useState('');
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState('');

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    setIsUploading(true);

    try {
      await wardrobeService.uploadItem({
        image: selectedFile,
        category: category || undefined,
        season: season || undefined,
        brand: brand || undefined,
        material: material || undefined,
        price: price ? parseFloat(price) : undefined,
      });

      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload item');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add Clothing Item</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label>Photo</Label>
            {!previewUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors
                  ${isDragging 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <div className="text-sm text-gray-600 mb-2">
                  Drag and drop your image here, or
                </div>
                <label className="cursor-pointer">
                  <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                    browse files
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleInputChange}
                    disabled={isUploading}
                  />
                </label>
                <div className="text-xs text-gray-500 mt-2">
                  PNG, JPG, WEBP up to 5MB
                </div>
              </div>
            ) : (
              <div className="mt-2 relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  disabled={isUploading}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Optional Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Shirt, Pants"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="season">Season (Optional)</Label>
              <Input
                id="season"
                placeholder="e.g., Summer, Winter"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="brand">Brand (Optional)</Label>
              <Input
                id="brand"
                placeholder="e.g., Nike, Zara"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="material">Material (Optional)</Label>
              <Input
                id="material"
                placeholder="e.g., Cotton, Denim"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="price">Price (Optional)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !selectedFile}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Add to Wardrobe'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}