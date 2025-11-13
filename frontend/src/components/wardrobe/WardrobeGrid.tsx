// File: src/components/wardrobe/WardrobeGrid.tsx
// Responsive grid layout for displaying clothing items

'use client';

import { ClothingItem } from '@/types/wardrobe';
import { ClothingItemCard } from './ClothingItemCard';

interface WardrobeGridProps {
  items: ClothingItem[];
  onDelete: (id: number) => void;
}

export function WardrobeGrid({ items, onDelete }: WardrobeGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <ClothingItemCard
          key={item.id}
          item={item}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </div>
  );
}