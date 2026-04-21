import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import SortableBlock from './SortableBlock.jsx';

export default function Canvas({ blocks, selectedBlockId, onSelect, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div
      ref={setNodeRef}
      className="min-h-[240px] rounded-lg transition-all duration-150 p-2"
      style={{
        border: isOver
          ? '2px dashed rgba(0,255,255,0.7)'
          : '2px dashed rgba(0,255,255,0.18)',
        background: isOver
          ? 'rgba(0,255,255,0.04)'
          : 'rgba(0,0,0,0.15)',
        boxShadow: isOver ? '0 0 28px rgba(0,255,255,0.18) inset' : 'none',
      }}
    >
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        {blocks.length === 0 ? (
          <EmptyState isOver={isOver} />
        ) : (
          <div className="space-y-2">
            {blocks.map((b) => (
              <SortableBlock
                key={b.id}
                block={b}
                selected={b.id === selectedBlockId}
                onSelect={() => onSelect?.(b.id)}
                onRemove={() => onRemove?.(b.id)}
              />
            ))}
          </div>
        )}
      </SortableContext>
    </div>
  );
}

function EmptyState({ isOver }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 select-none">
      <div
        className="text-4xl transition-transform duration-200"
        style={{
          filter: isOver ? 'drop-shadow(0 0 12px #00ffff)' : 'none',
          transform: isOver ? 'scale(1.2)' : 'scale(1)',
        }}
        aria-hidden="true"
      >
        {isOver ? '✨' : '🎮'}
      </div>
      <div className="text-[10px] text-center" style={{ color: isOver ? '#00ffff' : 'rgba(234,255,255,0.4)' }}>
        {isOver ? 'DROP IT HERE!' : 'DRAG A BLOCK HERE'}
      </div>
      <div className="text-[9px] text-white/30 text-center">
        Pick from the Blocks panel on the left
      </div>
    </div>
  );
}
