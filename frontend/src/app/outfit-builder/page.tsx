/**
 * File: src/app/outfit-builder/page.tsx
 * Main outfit builder page that combines all outfit builder components
 */

'use client';

import { OutfitCanvas } from '@/components/outfit-builder/OutfitCanvas';
import { WardrobeSidebar } from '@/components/outfit-builder/WardrobeSidebar';
import OutfitBuilderToolbar from '@/components/outfit-builder/OutfitBuilderToolbar';

export default function OutfitBuilderPage() {
  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <OutfitBuilderToolbar />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Wardrobe - 700px wide for 3 columns */}
        <aside className="w-[700px] overflow-y-auto border-r">
          <WardrobeSidebar />
        </aside>

        {/* Center - Canvas - Takes remaining space */}
        <main className="flex-1 overflow-auto p-4">
          <OutfitCanvas />
          
          {/* Instructions - Compact */}
          <div className="mt-4 rounded-lg border bg-blue-50 p-3">
            <h3 className="mb-1 text-sm font-medium text-blue-900">How to use:</h3>
            <ul className="space-y-0.5 text-xs text-blue-800">
              <li>• Click items to add to your outfit</li>
              <li>• Drag items to position them</li>
              <li>• Use controls to rotate or delete</li>
              <li>• Save when ready!</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}