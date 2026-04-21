import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BLOCK_TYPES } from '../../lib/blocks.js';

const TYPE_META = {
  text:   { icon: '📝', color: '#00ffff',  label: 'Text'   },
  image:  { icon: '🖼️', color: '#ff4dff',  label: 'Image'  },
  button: { icon: '🕹️', color: '#7cff00',  label: 'Button' },
  form:   { icon: '📡', color: '#ffb800',  label: 'Form'   },
};

function getPreviewTitle(block) {
  switch (block.type) {
    case 'text':   return block.props?.title ?? 'Text Block';
    case 'image':  return block.props?.altText || 'Image Block';
    case 'button': return block.props?.label ?? 'Button';
    case 'form':   return block.props?.title ?? 'Form';
    default:       return block.type;
  }
}

export default function SortableBlock({ block, selected, onSelect, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const meta = TYPE_META[block.type] ?? { icon: '▪', color: '#00ffff', label: block.type };
  const previewTitle = getPreviewTitle(block);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg overflow-hidden"
    >
      <div
        className="flex items-center gap-2 p-2.5 rounded-lg transition-all duration-100"
        style={{
          background: selected
            ? `rgba(${hexToRgb(meta.color)}, 0.1)`
            : 'rgba(14, 8, 32, 0.7)',
          border: selected
            ? `1px solid ${meta.color}`
            : '1px solid rgba(255,255,255,0.1)',
          boxShadow: selected
            ? `0 0 16px rgba(${hexToRgb(meta.color)}, 0.2)`
            : 'none',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded cursor-grab text-white/30 hover:text-white/70 transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          {...attributes}
          {...listeners}
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <span className="text-[12px]" aria-hidden="true">⠿</span>
        </div>

        {/* Type icon */}
        <div
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded text-sm"
          style={{
            background: `rgba(${hexToRgb(meta.color)}, 0.12)`,
            border: `1px solid rgba(${hexToRgb(meta.color)}, 0.3)`,
          }}
          aria-hidden="true"
        >
          {meta.icon}
        </div>

        {/* Content */}
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 min-w-0 text-left"
          aria-label={`Select ${meta.label} block: ${previewTitle}`}
        >
          <div className="text-[9px] mb-0.5" style={{ color: meta.color }}>
            {meta.label}
          </div>
          <div className="text-[10px] font-bold text-white/80 truncate">
            {previewTitle}
          </div>
        </button>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-red-400 transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          title="Remove block"
          aria-label="Remove block"
        >
          <span className="text-[11px]" aria-hidden="true">✕</span>
        </button>
      </div>
    </div>
  );
}

// Helper: convert hex color to "r,g,b" string for rgba()
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
