// File: src/components/wardrobe/ClothingUploader.tsx
// Updated to include required 'name' field for Django backend
// and an "Auto tags loading..." message while suggestions are fetched

'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { wardrobeService } from '@/lib/api/wardrobe';
import { toast } from 'sonner';

interface ClothingUploaderProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Match Django model choices exactly
const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Innerwear',
  'Outerwear',
  'Shoes',
  'Accessories',
  'One-pieces',
  'Etc.',
];

const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'None'];

export function ClothingUploader({ onSuccess, onCancel }: ClothingUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form fields - name is REQUIRED by Django
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('');
  const [brand, setBrand] = useState('');
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState('');

  // Track whether the user has manually edited these fields
  const [userEditedName, setUserEditedName] = useState(false);
  const [userEditedCategory, setUserEditedCategory] = useState(false);

  // Track auto-tag request
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPEG, PNG, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // If user hasn't typed a name yet, default to filename first
      if (!name.trim() && !userEditedName) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setName(fileName);
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast.success('Image selected successfully');

      // Ask backend for auto-tag suggestion
      try {
        setIsSuggesting(true);
        const suggestion = await wardrobeService.getAutoTagSuggestion(file);

        if (!userEditedName && suggestion.suggestedName) {
          setName(suggestion.suggestedName);
        }

        if (!userEditedCategory && suggestion.suggestedCategory) {
          setCategory(suggestion.suggestedCategory);
        }
      } catch (error: any) {
        console.error('Auto-tag suggestion failed:', error?.response?.data || error?.message);
        // Optional: toast.info('Could not auto-suggest name/category');
      } finally {
        setIsSuggesting(false);
      }
    },
    [name, userEditedName, userEditedCategory]
  );

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

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    toast.info('Image removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a name for this item');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress (since we don't have real progress tracking)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      await wardrobeService.uploadItem({
        image: selectedFile,
        name: name.trim(), // REQUIRED
        category: category || undefined,
        season: season || undefined,
        brand: brand || undefined,
        material: material || undefined,
        price: price ? parseFloat(price) : undefined,
      });

      setUploadProgress(100);
      clearInterval(progressInterval);
      
      toast.success('Item added to wardrobe!');
      
      // Small delay to show success before closing
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      const errorMessage = error.message || 'Failed to upload item';
      toast.error(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Add Clothing Item</CardTitle>
            <CardDescription>Upload a photo and name your clothing item</CardDescription>
          </div>
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
            <Label className="text-base font-semibold">Photo *</Label>
            {!previewUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-all duration-200
                  ${isDragging 
                    ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <div className={`
                    p-4 rounded-full mb-4 transition-colors
                    ${isDragging ? 'bg-indigo-100' : 'bg-gray-100'}
                  `}>
                    <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-base text-gray-700 mb-2 font-medium">
                    {isDragging ? 'Drop your image here' : 'Drag and drop your image'}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">or</div>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Browse Files
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleInputChange}
                      disabled={isUploading}
                    />
                  </label>
                  <div className="text-xs text-gray-500 mt-4">
                    Supported: PNG, JPG, WEBP (max 5MB)
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 relative group">
                <div className="relative rounded-lg border-2 border-gray-200 bg-gray-50 flex items-center justify-center p-4 min-h-[200px]">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-96 w-auto object-contain"
                  />
                </div>
                {!isUploading && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-3 right-3 shadow-lg z-10"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* REQUIRED: Item Name */}
          <div>
            <Label htmlFor="name" className="text-base font-semibold">
              Item Name *
            </Label>

            {isSuggesting && (
              <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Auto tags loading...
              </p>
            )}

            <Input
              id="name"
              placeholder="e.g., Blue Denim Jeans, Red T-Shirt"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setUserEditedName(true);
              }}
              disabled={isUploading}
              required
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Give your item a descriptive name
            </p>
          </div>

          {/* Optional Details */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Additional Details (Optional)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value);
                    setUserEditedCategory(true);
                  }}
                  disabled={isUploading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="season">Season</Label>
                <Select
                  value={season}
                  onValueChange={setSeason}
                  disabled={isUploading}
                >
                  <SelectTrigger id="season">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Nike, Zara"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              <div>
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  placeholder="e.g., Cotton, Denim"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="font-medium text-indigo-600">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || !selectedFile || !name.trim()}
              className="min-w-[140px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Add to Wardrobe
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
