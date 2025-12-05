// src/components/outfit-builder/OutfitCanvas.tsx

'use client';

  // Ref for rotation interval
import { useRef, useEffect, useState } from 'react';
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
  const removeItem = useOutfitBuilderStore((state) => state.removeItemFromCanvas);
  const updateSize = useOutfitBuilderStore((state) => state.updateItemSize);
  const updateRotation = useOutfitBuilderStore((state) => state.updateItemRotation);
  const bringToFront = useOutfitBuilderStore((state) => state.bringToFront);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item,
  });

  // State for resize dragging
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ startY: number; startSize: { width: number; height: number } } | null>(null);

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    removeItem(item.id);
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    updateRotation(item.id, (item.rotation + 15) % 360);
  };

  // Start resize drag
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = {
      startY: e.clientY,
      startSize: { ...item.size },
    };
  };

  // Effect for resize dragging
  useEffect(() => {
    if (!isResizing || !resizeStartRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;
      
      const deltaY = resizeStartRef.current.startY - e.clientY;
      const scaleFactor = 1 + (deltaY / 200); // Adjust sensitivity
      
      const newWidth = Math.max(50, resizeStartRef.current.startSize.width * scaleFactor);
      const newHeight = Math.max(50, resizeStartRef.current.startSize.height * scaleFactor);
      
      updateSize(item.id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, item.id, updateSize]);

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
        console.log('Item clicked:', item.id);
        onSelect(); // This sets selectedItemId in store
        bringToFront(item.id);
      }}
    >
      {/* Drag handle - the image area */}
      <div 
        className="relative h-full w-full"
        {...listeners}
        {...attributes}
        onMouseDown={() => {
          // Bring to front when starting to interact (drag or click)
          bringToFront(item.id);
        }}
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

      {/* Control buttons - always visible, but smaller */}
      <div className="absolute right-1 top-1 flex gap-1" style={{ pointerEvents: 'auto' }}>
        <Button
          size="icon"
          variant="destructive"
          className="h-5 w-5 bg-red-600 hover:bg-red-700 shadow"
          onClick={handleDelete}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-3 w-3 text-white" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-5 w-5 bg-white hover:bg-gray-100 shadow border border-gray-400"
          onClick={handleRotate}
          title="Rotate 15°"
        >
          <RotateCw className="h-3 w-3 text-gray-700" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-5 w-5 bg-white hover:bg-gray-100 shadow border border-gray-400"
          onMouseDown={handleResizeStart}
          title="Click and drag to resize"
        >
          <Maximize2 className="h-3 w-3 text-gray-700" />
        </Button>
      </div>
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