import React from 'react';

function safeUrl(input) {
  const s = String(input ?? '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (/^data:image\/[a-zA-Z+]+;base64,/i.test(s)) return s;
  return '';
}

// Shared field wrapper
function Field({ label, children }) {
  return (
    <div>
      <div className="text-[9px] text-white/50 mb-1.5 tracking-wider uppercase">{label}</div>
      {children}
    </div>
  );
}

// Shared input style
const inputCls = 'w-full rv-input-field text-[10px] py-2';
const textareaCls = 'w-full rv-input-field text-[10px] py-2 min-h-[80px] resize-y';
const selectCls = 'w-full rv-input-field rv-select text-[10px] py-2';

export default function Inspector({ block, onChange, onRemove }) {
  if (!block) {
    return (
      <div className="rv-panel p-4">
        <div className="text-xs font-bold mb-2" style={{ color: '#00ffff' }}>🔧 INSPECTOR</div>
        <div className="rv-divider" />
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="text-3xl opacity-40" aria-hidden="true">🖱️</div>
          <div className="text-[10px] text-white/40 text-center">
            Click a block on the canvas to edit it here
          </div>
        </div>
      </div>
    );
  }

  const update = (patch) => onChange({ ...block, ...patch });
  const updateProps = (propPatch) => update({ props: { ...(block.props ?? {}), ...propPatch } });
  const updateUi = (uiPatch) => update({ ui: { ...(block.ui ?? {}), ...uiPatch } });

  const align = block.ui?.align ?? 'left';

  return (
    <div className="rv-panel p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-xs font-bold" style={{ color: '#00ffff' }}>🔧 INSPECTOR</div>
          <div className="text-[9px] text-white/50 mt-1">
            Editing: <span style={{ color: '#ff4dff' }}>{block.type.toUpperCase()}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove?.(block.id)}
          className="text-[9px] px-2 py-1 rounded transition-colors"
          style={{
            color: '#ff4dff',
            border: '1px solid rgba(255,77,255,0.3)',
            background: 'rgba(255,77,255,0.08)',
          }}
          aria-label="Remove this block"
        >
          ✕ Remove
        </button>
      </div>

      <div className="rv-divider" />

      <div className="space-y-3 mt-3">
        {/* Alignment — all block types */}
        <Field label="Alignment">
          <div className="flex gap-2">
            {['left', 'center', 'right'].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => updateUi({ align: a })}
                className="flex-1 py-1.5 rounded text-[9px] transition-all"
                style={{
                  background: align === a ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: align === a ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: align === a ? '#00ffff' : 'rgba(255,255,255,0.5)',
                }}
                aria-pressed={align === a}
              >
                {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
              </button>
            ))}
          </div>
        </Field>

        {/* ── TEXT block ─────────────────────────────────── */}
        {block.type === 'text' && (
          <>
            <Field label="Style">
              <select
                className={selectCls}
                value={block.props?.variant ?? 'paragraph'}
                onChange={(e) => updateProps({ variant: e.target.value })}
              >
                <option value="heading">Heading (H1)</option>
                <option value="paragraph">Paragraph</option>
                <option value="callout">Callout</option>
              </select>
            </Field>

            <Field label="Title">
              <input
                className={inputCls}
                value={block.props?.title ?? ''}
                onChange={(e) => updateProps({ title: e.target.value })}
                placeholder="Enter title..."
              />
            </Field>

            <Field label="Body text">
              <textarea
                className={textareaCls}
                value={block.props?.body ?? ''}
                onChange={(e) => updateProps({ body: e.target.value })}
                placeholder="Enter body text..."
              />
            </Field>
          </>
        )}

        {/* ── IMAGE block ────────────────────────────────── */}
        {block.type === 'image' && (
          <>
            <Field label="Image URL">
              <input
                className={inputCls}
                value={block.props?.imageUrl ?? ''}
                onChange={(e) => updateProps({ imageUrl: safeUrl(e.target.value) })}
                placeholder="https://example.com/image.jpg"
              />
              <div className="text-[9px] text-white/30 mt-1">
                Paste any https:// image URL
              </div>
            </Field>

            <Field label="Alt text (accessibility)">
              <input
                className={inputCls}
                value={block.props?.altText ?? ''}
                onChange={(e) => updateProps({ altText: e.target.value })}
                placeholder="Describe the image..."
              />
            </Field>
          </>
        )}

        {/* ── BUTTON block ───────────────────────────────── */}
        {block.type === 'button' && (
          <>
            <Field label="Button label">
              <input
                className={inputCls}
                value={block.props?.label ?? ''}
                onChange={(e) => updateProps({ label: e.target.value })}
                placeholder="PRESS START"
              />
            </Field>

            <Field label="Link URL">
              <input
                className={inputCls}
                value={block.props?.href ?? ''}
                onChange={(e) => updateProps({ href: safeUrl(e.target.value) || '#' })}
                placeholder="https://your-site.com"
              />
            </Field>
          </>
        )}

        {/* ── FORM block ─────────────────────────────────── */}
        {block.type === 'form' && (
          <>
            <Field label="Form title">
              <input
                className={inputCls}
                value={block.props?.title ?? ''}
                onChange={(e) => updateProps({ title: e.target.value })}
                placeholder="PLAYER INBOX"
              />
            </Field>

            <Field label="Submit button label">
              <input
                className={inputCls}
                value={block.props?.submitLabel ?? ''}
                onChange={(e) => updateProps({ submitLabel: e.target.value })}
                placeholder="TRANSMIT"
              />
            </Field>

            <Field label="Action URL (optional)">
              <input
                className={inputCls}
                value={block.props?.actionUrl ?? ''}
                onChange={(e) => updateProps({ actionUrl: safeUrl(e.target.value) })}
                placeholder="https://example.com/api/contact"
              />
              <div className="text-[9px] text-white/30 mt-1">
                Leave blank for demo mode
              </div>
            </Field>

            <Field label="Method">
              <select
                className={selectCls}
                value={block.props?.method ?? 'POST'}
                onChange={(e) => updateProps({ method: e.target.value })}
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
            </Field>
          </>
        )}
      </div>
    </div>
  );
}
