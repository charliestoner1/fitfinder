// src/components/outfit-builder/OutfitCanvas.tsx

'use client';

import { useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { useOutfitBuilderStore, type OutfitItem } from '@/store/outfit-builder-store';
import { cn } from '@/lib/utils';
import { Trash2, RotateCw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableClothingItemProps {
  item: OutfitItem;
  isSelected: boolean;
  onSelect: () => void;
}

function DraggableClothingItem({ item, isSelected, onSelect }: DraggableClothingItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item,
  });

  const removeItem = useOutfitBuilderStore((state) => state.removeItemFromCanvas);
  const updateRotation = useOutfitBuilderStore((state) => state.updateItemRotation);
  const bringToFront = useOutfitBuilderStore((state) => state.bringToFront);

  // Calculate current position including drag delta
  const currentX = item.position.x + (transform?.x || 0);
  const currentY = item.position.y + (transform?.y || 0);

  const style = {
    position: 'absolute' as const,
    left: currentX,
    top: currentY,
    width: item.size.width,
    height: item.size.height,
    zIndex: item.zIndex,
    transform: `rotate(${item.rotation}deg)`,
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'transform 0.2s ease',
    opacity: isDragging ? 0.8 : 1,
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    updateRotation(item.id, (item.rotation + 15) % 360);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    removeItem(item.id);
  };

  const handleBringToFront = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    bringToFront(item.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border-2 transition-all',
        isSelected ? 'border-primary shadow-lg' : 'border-transparent hover:border-gray-300'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Drag handle - the image area */}
      <div 
        className="relative h-full w-full"
        {...listeners}
        {...attributes}
      >
        <img
          src={item.imageUrl}
          alt={item.category}
          className="h-full w-full object-contain pointer-events-none"
          draggable={false}
        />
        
        {/* Layer indicator */}
        <div className="absolute bottom-1 left-1 rounded bg-black/50 px-2 py-0.5 text-xs text-white pointer-events-none">
          {item.layer}
        </div>
      </div>

      {/* Control buttons - separate from drag area */}
      {isSelected && (
        <div className="absolute -right-2 -top-2 flex gap-1" style={{ pointerEvents: 'auto' }}>
          <Button
            size="icon"
            variant="destructive"
            className="h-6 w-6"
            onClick={handleDelete}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6"
            onClick={handleRotate}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6"
            onClick={handleBringToFront}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function OutfitCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { setNodeRef } = useDroppable({
    id: 'outfit-canvas',
  });

  const items = useOutfitBuilderStore((state) => state.currentOutfit.items);
  const selectedItemId = useOutfitBuilderStore((state) => state.selectedItemId);
  const setSelectedItem = useOutfitBuilderStore((state) => state.setSelectedItem);
  const updateItemPosition = useOutfitBuilderStore((state) => state.updateItemPosition);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const itemId = active.id as string;
    const item = items.find((i) => i.id === itemId);

    if (item && delta) {
      updateItemPosition(itemId, {
        x: item.position.x + delta.x,
        y: item.position.y + delta.y,
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas background
    // Check if the click target is the canvas container itself
    if (e.target === e.currentTarget) {
      setSelectedItem(null);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div
        ref={setNodeRef}
        className="relative h-[800px] w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
        onClick={handleCanvasClick}
      >
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="text-lg font-medium">Drag items here to build your outfit</p>
              <p className="text-sm">Select items from your wardrobe on the left</p>
            </div>
          </div>
        ) : (
          items
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((item) => (
              <DraggableClothingItem
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItem(item.id)}
              />
            ))
        )}
      </div>
    </DndContext>
  );
}