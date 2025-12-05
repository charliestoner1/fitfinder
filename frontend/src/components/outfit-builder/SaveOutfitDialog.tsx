'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Save, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface SaveOutfitDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (outfitData: SaveOutfitData) => Promise<void>;
  isSaving?: boolean;
}

export interface SaveOutfitData {
  name: string;
  occasion?: string;
  season?: string;
  isFavorite: boolean;
  scheduledDate?: string;
}

const OCCASIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'work', label: 'Work' },
  { value: 'formal', label: 'Formal' },
  { value: 'party', label: 'Party' },
  { value: 'date', label: 'Date' },
  { value: 'gym', label: 'Gym' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'beach', label: 'Beach' },
];

const SEASONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
  { value: 'all', label: 'All Seasons' },
];

export function SaveOutfitDialog({
  isOpen,
  onOpenChange,
  onSave,
  isSaving = false,
}: SaveOutfitDialogProps) {
  const [formData, setFormData] = useState<SaveOutfitData>({
    name: '',
    occasion: '',
    season: '',
    isFavorite: false,
    scheduledDate: '',
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter an outfit name');
      return;
    }

    try {
      await onSave(formData);
      // Reset form
      setFormData({
        name: '',
        occasion: '',
        season: '',
        isFavorite: false,
        scheduledDate: '',
      });
      onOpenChange(false);
      toast.success('Outfit saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save outfit');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Outfit</DialogTitle>
          <DialogDescription>
            Give your outfit a name and customize it with occasion, season, and scheduling options.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Outfit Name */}
          <div className="grid gap-2">
            <Label htmlFor="outfit-name">Outfit Name *</Label>
            <Input
              id="outfit-name"
              placeholder="e.g., Summer Beach Vibes, Office Monday..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSaving}
              autoFocus
            />
          </div>

          {/* Occasion */}
          <div className="grid gap-2">
            <Label htmlFor="occasion">Occasion</Label>
            <Select
              value={formData.occasion}
              onValueChange={(value) => setFormData({ ...formData, occasion: value })}
              disabled={isSaving}
            >
              <SelectTrigger id="occasion">
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent className="bg-white !bg-white bg-opacity-100 z-[100]" style={{ backgroundColor: '#fff', zIndex: 1000 }}>
                {OCCASIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Season */}
          <div className="grid gap-2">
            <Label htmlFor="season">Season</Label>
            <Select
              value={formData.season}
              onValueChange={(value) => setFormData({ ...formData, season: value })}
              disabled={isSaving}
            >
              <SelectTrigger id="season">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent className="bg-white !bg-white bg-opacity-100 z-[100]" style={{ backgroundColor: '#fff', zIndex: 1000 }}>
                {SEASONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scheduled Date */}
          <div className="grid gap-2">
            <Label htmlFor="scheduled-date">Schedule for Later (Optional)</Label>
            <Input
              id="scheduled-date"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              disabled={isSaving}
            />
          </div>

          {/* Favorite Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            <button
              onClick={() => setFormData({ ...formData, isFavorite: !formData.isFavorite })}
              disabled={isSaving}
              className={`p-2 rounded-lg transition-colors ${
                formData.isFavorite
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Heart className="w-5 h-5" fill={formData.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <label className="text-sm font-medium text-gray-700">
              Add to Favorites
            </label>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center gap-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="border-pink-300"
          >
            {isSaving ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Outfit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
