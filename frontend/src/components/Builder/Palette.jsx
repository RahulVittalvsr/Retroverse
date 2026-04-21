import React from 'react';
import { useDraggable } from '@dnd-kit/core';

// Color map for block type accents
const COLOR_MAP = {
  neon:    { border: 'rgba(0,255,255,0.4)',   glow: 'rgba(0,255,255,0.18)',   text: '#00ffff' },
  magenta: { border: 'rgba(255,77,255,0.4)',  glow: 'rgba(255,77,255,0.18)',  text: '#ff4dff' },
  lime:    { border: 'rgba(124,255,0,0.4)',   glow: 'rgba(124,255,0,0.18)',   text: '#7cff00' },
  amber:   { border: 'rgba(255,184,0,0.4)',   glow: 'rgba(255,184,0,0.18)',   text: '#ffb800' },
};

export default function Palette({ blockTypes }) {
  return (
    <div className="rv-panel p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-bold" style={{ color: '#00ffff' }}>🧱 BLOCKS</div>
          <div className="text-[9px] text-white/50 mt-1">Drag onto the canvas</div>
        </div>
        <span className="rv-badge">{blockTypes.length}</span>
      </div>

      <div className="rv-divider" />

      {/* Beginner tip */}
      <div className="mb-3 p-2 rounded" style={{ background: 'rgba(0,255,255,0.05)', border: '1px dashed rgba(0,255,255,0.2)' }}>
        <div className="text-[9px] text-white/60 leading-relaxed">
          💡 <span style={{ color: '#00ffff' }}>Tip:</span> Drag any block to the canvas, then click it to edit in the Inspector.
        </div>
      </div>

      <div className="space-y-2">
        {blockTypes.map((bt) => (
          <PaletteItem key={bt.type} blockType={bt} />
        ))}
      </div>
    </div>
  );
}

function PaletteItem({ blockType }) {
  const { type, label, tagline, icon, color = 'neon' } = blockType;
  const c = COLOR_MAP[color] ?? COLOR_MAP.neon;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { source: 'palette', type },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.55 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: `1px solid ${c.border}`,
    boxShadow: isDragging ? `0 0 24px ${c.glow}` : `0 0 10px ${c.glow}`,
    transition: isDragging ? 'none' : 'box-shadow 0.2s',
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      className="w-full text-left rv-panel p-3 bg-transparent"
      style={style}
      aria-label={`Drag ${label} block`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className="w-9 h-9 flex items-center justify-center rounded flex-shrink-0 text-lg"
          style={{ background: `${c.glow}`, border: `1px solid ${c.border}` }}
          aria-hidden="true"
        >
          {icon}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold" style={{ color: c.text }}>{label}</div>
          <div className="text-[9px] text-white/55 mt-0.5 truncate">{tagline}</div>
        </div>

        {/* Drag hint */}
        <div className="text-[10px] text-white/30 flex-shrink-0" aria-hidden="true">⠿</div>
      </div>
    </button>
  );
}
