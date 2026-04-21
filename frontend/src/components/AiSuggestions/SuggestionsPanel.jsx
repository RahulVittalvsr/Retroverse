import React, { useState } from 'react';
import { apiClient } from '../../lib/api.js';

const GENRES = [
  {
    key: 'arcade',
    icon: '🕹️',
    title: 'Arcade Cabinet',
    desc: 'Neon headers, CTA button, classic arcade layout.',
    color: '#00ffff',
  },
  {
    key: 'pixel-blog',
    icon: '📺',
    title: 'Pixel Blog',
    desc: 'Tutorial-style sections with a retro hero.',
    color: '#ff4dff',
  },
  {
    key: 'portfolio',
    icon: '🏆',
    title: 'Vintage Portfolio',
    desc: 'Classy sections with a contact form.',
    color: '#7cff00',
  },
];

export default function SuggestionsPanel({ anonUserId, onApplyBlocks, onToast }) {
  const [genre, setGenre] = useState('arcade');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const suggest = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSuggestions({ anonUserId, genre, prompt });
      if (!data?.blocks) throw new Error('No suggestions returned');
      onApplyBlocks?.(data.blocks);
    } catch (e) {
      onToast?.(e?.message || 'Suggestions failed');
    } finally {
      setLoading(false);
    }
  };

  const selected = GENRES.find((g) => g.key === genre);

  return (
    <div className="rv-panel p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-bold" style={{ color: '#00ffff' }}>🤖 AI TEMPLATES</div>
          <div className="text-[9px] text-white/50 mt-1">
            One-click retro layouts
          </div>
        </div>
        <span className="rv-badge-magenta rv-badge">1-click</span>
      </div>

      <div className="rv-divider" />

      {/* Genre cards */}
      <div className="mt-3 space-y-2">
        {GENRES.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => setGenre(g.key)}
            className="w-full text-left rounded-lg p-3 transition-all duration-150"
            style={{
              background: genre === g.key
                ? `rgba(${hexToRgb(g.color)}, 0.1)`
                : 'rgba(255,255,255,0.03)',
              border: genre === g.key
                ? `1px solid ${g.color}`
                : '1px solid rgba(255,255,255,0.1)',
              boxShadow: genre === g.key
                ? `0 0 16px rgba(${hexToRgb(g.color)}, 0.15)`
                : 'none',
            }}
            aria-pressed={genre === g.key}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">{g.icon}</span>
              <div>
                <div className="text-[10px] font-bold" style={{ color: genre === g.key ? g.color : 'rgba(234,255,255,0.8)' }}>
                  {g.title}
                </div>
                <div className="text-[9px] text-white/50 mt-0.5">{g.desc}</div>
              </div>
              {genre === g.key && (
                <span className="ml-auto text-[10px]" style={{ color: g.color }} aria-hidden="true">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Optional prompt */}
      <div className="mt-3">
        <div className="text-[9px] text-white/50 mb-1.5 tracking-wider uppercase">
          Custom prompt (optional)
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rv-input-field text-[9px] py-2 min-h-[72px] resize-none"
          placeholder="e.g. make it look like a 90s gaming lounge with a contact section"
          aria-label="Custom AI prompt"
        />
        <div className="text-[9px] text-white/30 mt-1">
          Works without OpenAI key — built-in templates always available
        </div>
      </div>

      {/* Apply button */}
      <button
        type="button"
        disabled={loading}
        onClick={suggest}
        className="mt-3 w-full rv-btn-arcade text-[10px] py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: selected?.color ?? '#00ffff',
          boxShadow: `0 4px 0 rgba(0,0,0,0.5), 0 0 20px rgba(${hexToRgb(selected?.color ?? '#00ffff')}, 0.35)`,
        }}
      >
        {loading ? '⟳ GENERATING...' : `▶ APPLY ${selected?.title?.toUpperCase() ?? 'TEMPLATE'}`}
      </button>
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
