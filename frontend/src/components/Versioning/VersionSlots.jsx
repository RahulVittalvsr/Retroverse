import React, { useMemo, useState } from 'react';

// Slot color themes — like different save file colors in old RPGs
const SLOT_COLORS = ['#00ffff', '#ff4dff', '#7cff00', '#ffb800', '#ff6b35'];

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

export default function VersionSlots({ versions, onSaveSlot, onLoadSlot }) {
  const [label, setLabel] = useState('');

  const slots = useMemo(() => {
    const map = new Map(Array.isArray(versions) ? versions.map((v) => [v.slotNumber, v]) : []);
    return [1, 2, 3, 4, 5].map((n) => ({ slotNumber: n, version: map.get(n) }));
  }, [versions]);

  return (
    <div className="rv-panel p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-bold" style={{ color: '#00ffff' }}>💾 SAVE SLOTS</div>
          <div className="text-[9px] text-white/50 mt-1">Like game checkpoints — save & restore</div>
        </div>
        <span className="text-lg" aria-hidden="true">🎮</span>
      </div>

      <div className="rv-divider" />

      {/* Label input */}
      <div className="mt-3 mb-3">
        <div className="text-[9px] text-white/50 mb-1.5 tracking-wider uppercase">Save label</div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rv-input-field text-[10px] py-2"
          placeholder="e.g. Boss fight layout"
          aria-label="Version slot label"
        />
      </div>

      {/* Slots grid */}
      <div className="space-y-2">
        {slots.map(({ slotNumber, version }) => {
          const color = SLOT_COLORS[slotNumber - 1];
          const isEmpty = !version;

          return (
            <div
              key={slotNumber}
              className="flex items-center gap-3 p-2.5 rounded-lg"
              style={{
                background: isEmpty ? 'rgba(255,255,255,0.03)' : `rgba(${hexToRgb(color)}, 0.07)`,
                border: isEmpty
                  ? '1px solid rgba(255,255,255,0.08)'
                  : `1px solid rgba(${hexToRgb(color)}, 0.3)`,
              }}
            >
              {/* Slot number badge */}
              <div
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded font-bold text-[11px]"
                style={{
                  background: isEmpty ? 'rgba(255,255,255,0.06)' : `rgba(${hexToRgb(color)}, 0.15)`,
                  border: `1px solid rgba(${hexToRgb(color)}, ${isEmpty ? 0.15 : 0.4})`,
                  color: isEmpty ? 'rgba(255,255,255,0.3)' : color,
                }}
                aria-hidden="true"
              >
                {slotNumber}
              </div>

              {/* Slot info */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold" style={{ color: isEmpty ? 'rgba(255,255,255,0.3)' : color }}>
                  {isEmpty ? 'EMPTY' : (version.label || `SLOT ${slotNumber}`)}
                </div>
                {!isEmpty && (
                  <div className="text-[8px] text-white/40 mt-0.5 truncate">
                    {formatDate(version.createdAt)}
                    {version.blocksSnapshot?.length != null && (
                      <span className="ml-1">• {version.blocksSnapshot.length} blocks</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onSaveSlot?.(slotNumber, label)}
                  className="text-[9px] px-2 py-1 rounded transition-all"
                  style={{
                    background: `rgba(${hexToRgb(color)}, 0.12)`,
                    border: `1px solid rgba(${hexToRgb(color)}, 0.35)`,
                    color,
                  }}
                  title={`Save to slot ${slotNumber}`}
                  aria-label={`Save to slot ${slotNumber}`}
                >
                  SAVE
                </button>
                <button
                  type="button"
                  disabled={isEmpty}
                  onClick={() => onLoadSlot?.(slotNumber)}
                  className="text-[9px] px-2 py-1 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: isEmpty ? 'rgba(255,255,255,0.04)' : `rgba(${hexToRgb(color)}, 0.08)`,
                    border: `1px solid rgba(${hexToRgb(color)}, ${isEmpty ? 0.1 : 0.25})`,
                    color: isEmpty ? 'rgba(255,255,255,0.3)' : color,
                  }}
                  title={isEmpty ? 'Slot is empty' : `Load slot ${slotNumber}`}
                  aria-label={`Load slot ${slotNumber}`}
                >
                  LOAD
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const h = (hex ?? '#00ffff').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
