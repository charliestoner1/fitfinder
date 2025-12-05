'use client';

import { ClothingItem } from '@/types/wardrobe';
import { ClothingItemCard } from './ClothingItemCard';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface WardrobeCategoryGridProps {
  items: ClothingItem[];
  onDelete: (id: number) => void;
  onEdit?: (item: ClothingItem) => void;
}

const CATEGORY_ORDER = [
  'Tops',
  'Bottoms',
  'Mid Layer',
  'Outer Layer',
  'Accessory',
  'Other',
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  'Tops': { bg: 'bg-blue-50', text: 'text-blue-700', icon: '👕' },
  'Bottoms': { bg: 'bg-purple-50', text: 'text-purple-700', icon: '👖' },
  'Mid Layer': { bg: 'bg-amber-50', text: 'text-amber-700', icon: '🧥' },
  'Outer Layer': { bg: 'bg-slate-50', text: 'text-slate-700', icon: '🧤' },
  'Accessory': { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '👜' },
  'Other': { bg: 'bg-gray-50', text: 'text-gray-700', icon: '📦' },
};

export function WardrobeCategoryGrid({ items, onDelete, onEdit }: WardrobeCategoryGridProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORY_ORDER.slice(0, 3)) // Expand first 3 categories by default
  );

  // Group items by category
  const itemsByCategory = CATEGORY_ORDER.reduce(
    (acc, category) => {
      const categoryItems = items.filter(
        item => item.category === category || (item.category && item.category.includes(category))
      );
      if (categoryItems.length > 0) {
        acc[category] = categoryItems;
      }
      return acc;
    },
    {} as Record<string, ClothingItem[]>
  );

  // Add items without a category to "Other"
  const uncategorizedItems = items.filter(item => !item.category);
  if (uncategorizedItems.length > 0) {
    itemsByCategory['Other'] = (itemsByCategory['Other'] || []).concat(uncategorizedItems);
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map((category) => {
        const categoryItems = itemsByCategory[category];
        if (!categoryItems || categoryItems.length === 0) return null;

        const colors = CATEGORY_COLORS[category];
        const isExpanded = expandedCategories.has(category);

        return (
          <div key={category} className={`rounded-lg overflow-hidden ${colors.bg}`}>
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className={`w-full px-6 py-4 flex items-center justify-between hover:opacity-80 transition-opacity ${colors.text}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{CATEGORY_COLORS[category].icon}</span>
                <div className="flex flex-col items-start">
                  <h2 className="text-lg font-bold">{category}</h2>
                  <p className="text-sm opacity-75">{categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {/* Items Grid */}
            {isExpanded && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <ClothingItemCard
                        item={item}
                        onDelete={() => onDelete(item.id)}
                        onEdit={onEdit}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
