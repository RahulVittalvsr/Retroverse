import React, { useState } from 'react';
import { apiClient } from '../../lib/api.js';

// ── Code viewer modal ──────────────────────────────────────────
function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="rv-panel w-full max-w-3xl p-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-3 flex-shrink-0">
          <div className="text-xs font-bold" style={{ color: '#00ffff' }}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] px-3 py-1 rounded transition-colors"
            style={{ color: '#ff4dff', border: '1px solid rgba(255,77,255,0.3)', background: 'rgba(255,77,255,0.08)' }}
          >
            ✕ Close
          </button>
        </div>
        <div className="rv-divider flex-shrink-0" />
        <div className="mt-3 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export default function PublishBar({ anonUserId, projectId, blocks, onToast }) {
  const [provider, setProvider] = useState('netlify');
  const [branch, setBranch] = useState('master');
  const [siteIdOverride, setSiteIdOverride] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFiles, setExportFiles] = useState(null);
  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState('');

  const withBusy = async (action, label, fn) => {
    try {
      setBusy(true);
      setBusyAction(label);
      await fn();
    } catch (e) {
      onToast?.(e.message || `${label} failed`);
    } finally {
      setBusy(false);
      setBusyAction('');
    }
  };

  const downloadZip = () => withBusy('zip', 'Exporting...', async () => {
    const blob = await apiClient.exportZipDownload({ anonUserId, projectId, blocks });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retroverse-export.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onToast?.('ZIP downloaded!');
  });

  const loadExportFiles = () => withBusy('files', 'Loading...', async () => {
    const data = await apiClient.exportFiles({ anonUserId, projectId, blocks });
    setExportFiles(data.files ?? {});
    setExportModalOpen(true);
  });

  const publish = () => withBusy('publish', 'Publishing...', async () => {
    if (provider !== 'netlify') {
      onToast?.('Firebase publish coming soon!');
      return;
    }
    const result = await apiClient.publishNetlify({
      anonUserId, projectId, blocks,
      siteId: siteIdOverride || undefined,
      branch,
    });
    onToast?.('Published to Netlify!');
    if (result?.deploy?.url) onToast?.(`Live at: ${result.deploy.url}`);
  });

  return (
    <div className="rv-panel p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-bold" style={{ color: '#00ffff' }}>🚀 EXPORT & PUBLISH</div>
          <div className="text-[9px] text-white/50 mt-1">
            Download code or go live in one click
          </div>
        </div>
        <span
          className="text-[9px] px-2 py-1 rounded"
          style={{
            color: busy ? '#ffb800' : '#7cff00',
            border: `1px solid ${busy ? 'rgba(255,184,0,0.3)' : 'rgba(124,255,0,0.3)'}`,
            background: busy ? 'rgba(255,184,0,0.08)' : 'rgba(124,255,0,0.08)',
          }}
        >
          {busy ? `⟳ ${busyAction}` : '● Ready'}
        </span>
      </div>

      <div className="rv-divider" />

      {/* Export buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={downloadZip}
          disabled={busy}
          className="rv-btn-ghost text-[9px] py-2.5 text-center disabled:opacity-40"
          aria-label="Download export ZIP"
        >
          📦 Download ZIP
        </button>
        <button
          type="button"
          onClick={loadExportFiles}
          disabled={busy}
          className="rv-btn-ghost text-[9px] py-2.5 text-center disabled:opacity-40"
          aria-label="View HTML, CSS, and JS files"
        >
          📄 View Code
        </button>
      </div>

      {/* Publish section */}
      <div
        className="mt-3 p-3 rounded-lg"
        style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,255,255,0.12)' }}
      >
        <div className="text-[9px] text-white/50 mb-2 tracking-wider uppercase">
          One-click hosting
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 mb-2">
          <select
            className="rv-input-field rv-select text-[9px] py-1.5"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            aria-label="Hosting provider"
          >
            <option value="netlify">Netlify</option>
            <option value="firebase" disabled>Firebase (soon)</option>
          </select>
          <input
            className="rv-input-field text-[9px] py-1.5"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="branch: master"
            aria-label="Git branch"
          />
          <input
            className="rv-input-field text-[9px] py-1.5"
            value={siteIdOverride}
            onChange={(e) => setSiteIdOverride(e.target.value)}
            placeholder="Netlify site ID"
            aria-label="Netlify site ID override"
          />
        </div>

        <button
          type="button"
          onClick={publish}
          disabled={busy}
          className="w-full rv-btn-arcade rv-btn-arcade-magenta text-[10px] py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Publish to Netlify"
        >
          {busy && busyAction === 'Publishing...' ? '⟳ PUBLISHING...' : '🚀 PUBLISH NOW'}
        </button>

        <div className="text-[8px] text-white/25 mt-2 text-center">
          Requires NETLIFY_SITE_ID + NETLIFY_TOKEN in backend/.env
        </div>
      </div>

      {/* Code viewer modal */}
      <Modal
        open={exportModalOpen}
        title="📄 EXPORTED CODE — HTML / CSS / JS"
        onClose={() => setExportModalOpen(false)}
      >
        {!exportFiles ? (
          <div className="text-[10px] text-white/50">No export loaded.</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(exportFiles).map(([name, content]) => (
              <div key={name}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rv-badge text-[9px]">{name}</span>
                  <span className="text-[8px] text-white/30">{content.length} chars</span>
                </div>
                <textarea
                  className="w-full rv-input-field text-[9px] py-2 font-mono min-h-[120px] resize-y"
                  readOnly
                  value={content}
                  aria-label={`${name} file content`}
                />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
