import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { apiClient } from './lib/api.js';
import { BLOCK_TYPES, createPaletteBlock } from './lib/blocks.js';

import Palette from './components/Builder/Palette.jsx';
import Canvas from './components/Builder/Canvas.jsx';
import Inspector from './components/Builder/Inspector.jsx';
import RetroPreview from './components/Preview/RetroPreview.jsx';
import SuggestionsPanel from './components/AiSuggestions/SuggestionsPanel.jsx';
import VersionSlots from './components/Versioning/VersionSlots.jsx';
import PublishBar from './components/Publish/PublishBar.jsx';

function makeAnonId() {
  try { return crypto.randomUUID(); }
  catch { return `anon_${Date.now()}_${Math.random().toString(16).slice(2)}`; }
}

function useToast() {
  const [toast, setToast] = useState('');
  const tRef = useRef(null);
  const show = (msg) => {
    setToast(msg);
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setToast(''), 3000);
  };
  return { toast, show };
}

// Pixel art coin icon for the header
function CoinIcon() {
  return (
    <span
      className="inline-block text-[18px] select-none"
      style={{ filter: 'drop-shadow(0 0 6px #ffb800)' }}
      aria-hidden="true"
    >
      🪙
    </span>
  );
}

export default function App() {
  const sensors = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const { toast, show } = useToast();

  const [anonUserId, setAnonUserId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('My Arcade Site');
  const [blocks, setBlocks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [creating, setCreating] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [activeTab, setActiveTab] = useState('build'); // 'build' | 'preview'

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );

  const ensureActiveProject = async (id) => {
    const data = await apiClient.listProjects(id);
    const list = data?.projects ?? [];
    setProjects(list);

    if (list.length) {
      setProjectId(list[0]._id?.toString?.() ?? list[0].projectId ?? '');
      return;
    }

    setCreating(true);
    const created = await apiClient.createProject({ anonUserId: id, title: 'My Arcade Site', blocks: [] });
    setProjectId(created.projectId);
    setBlocks(created.blocks ?? []);
    setVersions(created.versions ?? []);
    setTitle(created.title ?? 'My Arcade Site');
    setCreating(false);
  };

  // Init anon id + bootstrap project
  useEffect(() => {
    const key = 'retroverse_anon_user_id';
    let id = '';
    try { id = localStorage.getItem(key) || ''; } catch { id = ''; }
    if (!id) {
      id = makeAnonId();
      try { localStorage.setItem(key, id); } catch { /* ignore */ }
    }
    setAnonUserId(id);
    (async () => { await ensureActiveProject(id); })()
      .catch((e) => show(e.message || 'Backend not reachable. Start backend + MongoDB.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load project details when projectId changes
  useEffect(() => {
    if (!projectId || !anonUserId) return;
    (async () => {
      try {
        const data = await apiClient.getProject({ anonUserId, projectId });
        setTitle(data.title ?? 'My Arcade Site');
        setBlocks(data.blocks ?? []);
        setVersions(data.versions ?? []);
      } catch (e) { show(e.message || 'Failed to load project'); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, anonUserId]);

  // Debounced auto-save
  useEffect(() => {
    if (!projectId || !anonUserId) return;
    const t = setTimeout(async () => {
      try {
        setBusySave(true);
        await apiClient.saveProject({ anonUserId, projectId, title, blocks });
      } catch (e) { show(e.message || 'Auto-save failed'); }
      finally { setBusySave(false); }
    }, 900);
    return () => clearTimeout(t);
  }, [projectId, anonUserId, title, blocks]);

  const onDragEnd = (event) => {
    const { active, over } = event;
    const activeId = active?.id;
    const overId = over?.id;
    if (!activeId) return;

    const isPalette = String(activeId).startsWith('palette-');
    if (isPalette) {
      const type = active.data?.current?.type ?? String(activeId).replace('palette-', '');
      const newBlock = createPaletteBlock(type);
      if (!newBlock) return;
      setBlocks((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        let insertIndex = list.length;
        if (overId && overId !== 'canvas') {
          const idx = list.findIndex((b) => b.id === overId);
          if (idx >= 0) insertIndex = idx;
        }
        const next = [...list];
        next.splice(insertIndex, 0, newBlock);
        return next;
      });
      setSelectedBlockId(newBlock.id);
      return;
    }

    setBlocks((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const oldIndex = list.findIndex((b) => b.id === activeId);
      if (oldIndex < 0) return list;
      let newIndex = oldIndex;
      if (overId === 'canvas') newIndex = list.length - 1;
      else {
        const idx = list.findIndex((b) => b.id === overId);
        if (idx >= 0) newIndex = idx;
      }
      if (newIndex === oldIndex) return list;
      return arrayMove(list, oldIndex, newIndex);
    });
  };

  const updateBlock = (updated) => {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const removeBlock = (id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedBlockId((cur) => (cur === id ? null : cur));
  };

  const applySuggestedTemplate = (nextBlocks) => {
    setBlocks(nextBlocks);
    setSelectedBlockId(nextBlocks?.[0]?.id ?? null);
    show('Template applied!');
  };

  const onSaveSlot = async (slotNumber, label) => {
    try {
      await apiClient.saveVersionSlot({ anonUserId, projectId, slotNumber, label, blocks });
      const data = await apiClient.getProject({ anonUserId, projectId });
      setVersions(data.versions ?? []);
      show(`Slot ${slotNumber} saved!`);
    } catch (e) { show(e.message || 'Save slot failed'); }
  };

  const onLoadSlot = async (slotNumber) => {
    try {
      const data = await apiClient.restoreVersionSlot({ anonUserId, projectId, slotNumber });
      setBlocks(data.blocks ?? []);
      setSelectedBlockId(data.blocks?.[0]?.id ?? null);
      show(`Slot ${slotNumber} restored!`);
    } catch (e) { show(e.message || 'Restore slot failed'); }
  };

  const newProject = async () => {
    try {
      const created = await apiClient.createProject({ anonUserId, title: 'New Arcade Site', blocks: [] });
      setProjectId(created.projectId);
      setBlocks([]);
      setVersions([]);
      setTitle('New Arcade Site');
      setSelectedBlockId(null);
      const data = await apiClient.listProjects(anonUserId);
      setProjects(data?.projects ?? []);
      show('New project created!');
    } catch (e) { show(e.message || 'Failed to create project'); }
  };

  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>
      {/* Animated background */}
      <div className="rv-bg" aria-hidden="true" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-3 py-3">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="rv-panel p-0 overflow-hidden mb-4">
          {/* Top bar: logo + status */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-[22px]" style={{ filter: 'drop-shadow(0 0 8px #ff4dff)' }} aria-hidden="true">▶</span>
              <div>
                <div className="text-sm font-bold rv-title" style={{ color: '#00ffff' }}>
                  RETROVERSE
                </div>
                <div className="text-[9px] text-white/50 mt-0.5 tracking-widest">
                  NO-CODE WEBSITE BUILDER
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {/* Step hints */}
              {[
                { n: '1', label: 'Pick a block' },
                { n: '2', label: 'Drop on canvas' },
                { n: '3', label: 'Edit in inspector' },
                { n: '4', label: 'Publish!' },
              ].map((s) => (
                <div key={s.n} className="flex items-center gap-1.5">
                  <span className="rv-badge">{s.n}</span>
                  <span className="text-[9px] text-white/50">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[9px] ${busySave ? 'text-amber-400' : 'text-lime-400'}`}>
                {busySave ? '⟳ Saving...' : projectId ? '● Live' : creating ? '⟳ Creating...' : '—'}
              </span>
            </div>
          </div>

          {/* Bottom bar: project selector + title + new project */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[9px] text-white/50">PROJECT:</span>
              <select
                className="rv-input-field rv-select text-[10px] py-1.5 min-w-[140px]"
                value={projectId}
                onChange={(e) => { setProjectId(e.target.value); setSelectedBlockId(null); }}
              >
                {projects.map((p) => (
                  <option key={p._id ?? p.projectId} value={p._id?.toString?.() ?? p.projectId}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <input
              className="rv-input-field text-[10px] py-1.5 flex-1 min-w-0"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!projectId}
              placeholder="Site title..."
              aria-label="Project title"
            />

            <button
              type="button"
              onClick={newProject}
              className="rv-btn-ghost text-[9px] py-1.5 px-3 flex-shrink-0"
            >
              + NEW
            </button>

            {/* Mobile tab toggle */}
            <div className="flex sm:hidden gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setActiveTab('build')}
                className={`rv-btn-ghost text-[9px] py-1 px-2 ${activeTab === 'build' ? 'border-neon text-neon' : ''}`}
              >
                Build
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`rv-btn-ghost text-[9px] py-1 px-2 ${activeTab === 'preview' ? 'border-neon text-neon' : ''}`}
              >
                Preview
              </button>
            </div>
          </div>
        </header>

        {/* ── Main 3-column layout ────────────────────────────── */}
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={[sensors]}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

            {/* Left sidebar: Palette + AI Suggestions */}
            <aside className={`lg:col-span-3 space-y-3 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
              <Palette blockTypes={BLOCK_TYPES} />
              <SuggestionsPanel anonUserId={anonUserId} onApplyBlocks={applySuggestedTemplate} onToast={show} />
            </aside>

            {/* Center: Canvas + Version Slots + Publish */}
            <section className={`lg:col-span-5 space-y-3 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
              <div className="rv-panel p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="text-xs font-bold" style={{ color: '#00ffff' }}>
                      🎮 CANVAS
                    </div>
                    <div className="text-[9px] text-white/50 mt-1">
                      Drag blocks here • click to select • reorder freely
                    </div>
                  </div>
                  <span className="rv-badge-magenta rv-badge">
                    {blocks.length} block{blocks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Canvas
                  blocks={blocks}
                  selectedBlockId={selectedBlockId}
                  onSelect={(id) => setSelectedBlockId(id)}
                  onRemove={(id) => removeBlock(id)}
                />
              </div>

              <VersionSlots versions={versions} onSaveSlot={onSaveSlot} onLoadSlot={onLoadSlot} />
              <PublishBar anonUserId={anonUserId} projectId={projectId} blocks={blocks} onToast={show} />
            </section>

            {/* Right sidebar: Inspector + Preview */}
            <aside className={`lg:col-span-4 space-y-3 ${activeTab === 'build' ? 'hidden lg:block' : ''}`}>
              <Inspector block={selectedBlock} onChange={updateBlock} onRemove={(id) => removeBlock(id)} />
              <RetroPreview blocks={blocks} />
            </aside>

          </div>
        </DndContext>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="mt-6 text-center text-[9px] text-white/25 pb-4">
          RETROVERSE © 2025 — DRAG. DROP. PUBLISH. &nbsp;|&nbsp; INSERT COIN TO CONTINUE
          <span className="rv-blink ml-1">_</span>
        </footer>
      </div>

      {/* ── Toast notification ──────────────────────────────── */}
      {toast && (
        <div className="rv-toast" role="status" aria-live="polite">
          <span className="text-[10px]" style={{ color: '#00ffff' }}>▶ {toast}</span>
        </div>
      )}
    </div>
  );
}
