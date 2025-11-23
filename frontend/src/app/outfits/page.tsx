// src/app/outfits/page.tsx
// Page to view all your saved outfits

import { SavedOutfitsList } from '@/components/outfits/SavedOutfitsList';

export default function OutfitsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Saved Outfits</h1>
          <p className="text-gray-600 mt-2">
            View and manage all your created outfits
          </p>
        </div>

        <SavedOutfitsList />
      </div>
    </div>
  );
}