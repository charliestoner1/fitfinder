/**
 * File: src/components/outfit-builder/OutfitBuilderToolbar.tsx
 * Toolbar component with save, clear, and export controls for outfits
 */

'use client';

import { useState } from 'react';
import { useOutfitBuilderStore } from '@/store/outfit-builder-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Trash2, Download } from 'lucide-react';
import { Label } from '@/components/ui/label';

const OCCASIONS = [
  'casual',
  'work',
  'formal',
  'party',
  'date',
  'gym',
  'outdoor',
  'beach',
] as const;

export function OutfitBuilderToolbar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [occasion, setOccasion] = useState('');

  const currentOutfit = useOutfitBuilderStore((state) => state.currentOutfit);
  const saveOutfit = useOutfitBuilderStore((state) => state.saveOutfit);
  const clearCanvas = useOutfitBuilderStore((state) => state.clearCanvas);

  const handleSaveOutfit = () => {
    if (!outfitName.trim()) {
      alert('Please enter an outfit name');
      return;
    }

    if (currentOutfit.items.length === 0) {
      alert('Please add at least one item to your outfit');
      return;
    }

    saveOutfit(outfitName, occasion || undefined);
    setIsDialogOpen(false);
    setOutfitName('');
    setOccasion('');
  };

  const handleClearCanvas = () => {
    if (currentOutfit.items.length > 0) {
      const confirmed = window.confirm(
        'Are you sure you want to clear the canvas? This will remove all items from your current outfit.'
      );
      if (confirmed) {
        clearCanvas();
      }
    }
  };

  const handleDownloadImage = async () => {
    // TODO: Implement canvas screenshot using html2canvas
    console.log('Download outfit image');
  };

  return (
    <div className="flex items-center justify-between border-b bg-white p-4">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold">{currentOutfit.name}</h1>
          {currentOutfit.occasion && (
            <p className="text-sm text-gray-500 capitalize">{currentOutfit.occasion}</p>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {currentOutfit.items.length} {currentOutfit.items.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCanvas}
          disabled={currentOutfit.items.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadImage}
          disabled={currentOutfit.items.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={currentOutfit.items.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              Save Outfit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Your Outfit</DialogTitle>
              <DialogDescription>
                Give your outfit a name and select an occasion to help organize your wardrobe.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="outfit-name">Outfit Name *</Label>
                <Input
                  id="outfit-name"
                  placeholder="e.g., Summer Work Outfit"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger id="occasion">
                    <SelectValue placeholder="Select an occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCASIONS.map((occ) => (
                      <SelectItem key={occ} value={occ} className="capitalize">
                        {occ}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                  Your outfit contains {currentOutfit.items.length}{' '}
                  {currentOutfit.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOutfit}>Save Outfit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Also export as default for flexibility
export default OutfitBuilderToolbar;