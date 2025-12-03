// src/app/outfits/page.tsx
// Page to view all your saved outfits

'use client';

import { Navbar } from '@/components/navbar';
import { SavedOutfitsList } from '@/components/outfits/SavedOutfitsList';

export default function OutfitsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#FFAEDA' }}>My Saved Outfits</h1>
          <p className="text-slate-600 mt-2">
            View and manage all your created outfits
          </p>
        </div>

        <SavedOutfitsList />
      </div>
    </div>
  );
}