/**
 * File: src/components/outfit-builder/OutfitBuilderToolbar.tsx
 * Toolbar component with save, clear, and export controls for outfits
 * Updated to handle both CREATE and UPDATE operations
 */

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { Save, Trash2, Download, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { createOutfit, updateOutfit } from '@/lib/api/outfits';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/auth';


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

const SEASONS = [
  'spring',
  'summer',
  'fall',
  'winter',
  'all',
] as const;




export function OutfitBuilderToolbar() {
  const searchParams = useSearchParams();
  const editOutfitId = searchParams?.get('edit');
  const isEditMode = !!editOutfitId;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [season, setSeason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentOutfit = useOutfitBuilderStore((state) => state.currentOutfit);
  const clearCanvas = useOutfitBuilderStore((state) => state.clearCanvas);

  const router = useRouter();
    const logoutHandler = async () => {
      try{
        await authService.logout();
        router.push('/register');
      }
      catch(error: any){
        console.error('Logout failed', error);
      }
    }
  
  // Pre-fill form when editing
  const handleDialogOpen = (open: boolean) => {
    if (open && isEditMode) {
      setOutfitName(currentOutfit.name || '');
      setOccasion(currentOutfit.occasion || '');
      setSeason(currentOutfit.season || '');
    }
    setIsDialogOpen(open);
  };

  const handleSaveOutfit = async () => {
    console.log('=== SAVE OUTFIT CLICKED ===');
    console.log('Is Edit Mode:', isEditMode);
    console.log('Edit ID:', editOutfitId);
    console.log('Outfit name:', outfitName);
    console.log('Current outfit:', currentOutfit);
    console.log('Items count:', currentOutfit.items.length);

    if (!outfitName.trim()) {
      toast.error('Please enter an outfit name');
      return;
    }

    if (currentOutfit.items.length === 0) {
      toast.error('Please add at least one item to your outfit');
      return;
    }

    setIsSaving(true);

    try {
      // Prepare outfit data
      const outfitToSave = {
        ...currentOutfit,
        name: outfitName,
        occasion: occasion || undefined,
        season: season as any,
      };

      if (isEditMode && editOutfitId) {
        // UPDATE existing outfit
        console.log('Updating outfit:', editOutfitId);
        await updateOutfit(editOutfitId, outfitToSave);
        toast.success('Outfit updated successfully!');
      } else {
        // CREATE new outfit
        console.log('Creating new outfit');
        await createOutfit(outfitToSave);
        toast.success('Outfit saved successfully!');
      }
      
      setIsDialogOpen(false);
      setOutfitName('');
      setOccasion('');
      setSeason('');


    } catch (error: any) {
      console.error('=== ERROR SAVING OUTFIT ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'save'} outfit`);
    } finally {
      setIsSaving(false);
    }
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
    toast.info('Export feature coming soon!');
    console.log('Download outfit image');
  };

  return (
    <div className="flex items-center justify-between border-b bg-white p-4">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            {currentOutfit.name || (isEditMode ? 'Edit Outfit' : 'New Outfit')}
          </h1>
          {currentOutfit.occasion && (
            <p className="text-sm text-gray-500 capitalize">{currentOutfit.occasion}</p>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {currentOutfit.items.length} {currentOutfit.items.length === 1 ? 'item' : 'items'}
        </div>
        {isEditMode && (
          <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Edit Mode
          </div>
        )}
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
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={currentOutfit.items.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? 'Update Outfit' : 'Save Outfit'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Update Your Outfit' : 'Save Your Outfit'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? 'Update the details of your outfit.'
                  : 'Give your outfit a name and select details to help organize your wardrobe.'
                }
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
                  disabled={isSaving}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Select value={occasion} onValueChange={setOccasion} disabled={isSaving}>
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

              <div className="grid gap-2">
                <Label htmlFor="season">Season</Label>
                <Select value={season} onValueChange={setSeason} disabled={isSaving}>
                  <SelectTrigger id="season">
                    <SelectValue placeholder="Select a season" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveOutfit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>{isEditMode ? 'Update Outfit' : 'Save Outfit'}</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
            onClick={logoutHandler}
            size="default"
            className="bg-red-600 shadow-md hover:shadow-lg transition-shadow whitespace-nowrap"
          >
            Log Out
          </Button>
      </div>
    </div>
  );
}

export default OutfitBuilderToolbar;