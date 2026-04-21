import React from 'react';

function alignClass(align) {
  if (align === 'center') return 'rv-align-center';
  if (align === 'right') return 'rv-align-right';
  return 'rv-align-left';
}

export default function RetroPreview({ blocks }) {
  return (
    <div className="rv-panel p-4">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-bold" style={{ color: '#00ffff' }}>👁 LIVE PREVIEW</div>
          <div className="text-[9px] text-white/50 mt-1">Updates instantly as you build</div>
        </div>
        <span className="rv-badge-lime rv-badge text-[9px]">● LIVE</span>
      </div>

      <div className="rv-divider" />

      {/* Preview viewport — simulates a mini browser */}
      <div
        className="mt-3 rounded-lg overflow-hidden"
        style={{
          border: '1px solid rgba(0,255,255,0.15)',
          background: '#070714',
          maxHeight: '520px',
          overflowY: 'auto',
        }}
      >
        {/* Fake browser chrome */}
        <div
          className="flex items-center gap-1.5 px-3 py-2"
          style={{ background: 'rgba(14,8,32,0.9)', borderBottom: '1px solid rgba(0,255,255,0.1)' }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff4dff' }} aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffb800' }} aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#7cff00' }} aria-hidden="true" />
          <div
            className="flex-1 mx-2 px-2 py-0.5 rounded text-[8px] text-white/30"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            retroverse-preview
          </div>
        </div>

        {/* Actual preview content */}
        <div className="p-3">
          {/* Mini site header */}
          <header className="rv-hero" style={{ margin: '0 0 12px', padding: '12px 14px' }}>
            <div className="rv-logo">
              <span className="rv-logo-mark" style={{ fontSize: '14px' }}>▶</span>
              <span className="rv-logo-text" style={{ fontSize: '12px' }}>RETROVERSE</span>
            </div>
            <p className="rv-hero-sub" style={{ fontSize: '8px', marginTop: '6px' }}>
              Live preview • instant update
            </p>
          </header>

          {/* Rendered blocks */}
          {blocks.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-2xl mb-2 opacity-30" aria-hidden="true">🖥️</div>
              <div className="text-[9px] text-white/30">Your site will appear here</div>
            </div>
          ) : (
            blocks.map((b) => <PreviewBlock key={b.id} block={b} />)
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewBlock({ block }) {
  const a = alignClass(block.ui?.align);

  if (block.type === 'text') {
    const v = block.props?.variant ?? 'paragraph';
    if (v === 'heading') {
      return (
        <section className={`rv-panel ${a}`} style={{ margin: '8px 0', padding: '12px' }}>
          <h1 className="rv-h1" style={{ fontSize: '14px', marginBottom: '6px' }}>
            {block.props?.title ?? ''}
          </h1>
          <p className="rv-lead" style={{ fontSize: '9px' }}>{block.props?.body ?? ''}</p>
        </section>
      );
    }
    if (v === 'callout') {
      return (
        <section className={`rv-panel rv-panel-callout ${a}`} style={{ margin: '8px 0', padding: '12px' }}>
          <h2 className="rv-h2" style={{ fontSize: '11px', marginBottom: '6px' }}>
            {block.props?.title ?? ''}
          </h2>
          <p className="rv-callout" style={{ fontSize: '9px' }}>{block.props?.body ?? ''}</p>
        </section>
      );
    }
    return (
      <section className={`rv-panel ${a}`} style={{ margin: '8px 0', padding: '12px' }}>
        <h2 className="rv-h2" style={{ fontSize: '11px', marginBottom: '6px' }}>
          {block.props?.title ?? ''}
        </h2>
        <p className="rv-p" style={{ fontSize: '9px' }}>{block.props?.body ?? ''}</p>
      </section>
    );
  }

  if (block.type === 'image') {
    const src = block.props?.imageUrl ?? '';
    const alt = block.props?.altText ?? '';
    return (
      <section className={`rv-panel ${a} rv-panel-media`} style={{ margin: '8px 0', padding: '8px' }}>
        {src ? (
          <img className="rv-img" src={src} alt={alt} style={{ maxHeight: '160px' }} />
        ) : (
          <div className="rv-img-placeholder" style={{ padding: '16px', fontSize: '9px' }}>
            🖼️ IMAGE PLACEHOLDER
          </div>
        )}
      </section>
    );
  }

  if (block.type === 'button') {
    return (
      <section className={`rv-panel ${a}`} style={{ margin: '8px 0', padding: '12px' }}>
        <a
          className="rv-btn"
          href={block.props?.href ?? '#'}
          rel="noreferrer"
          style={{ fontSize: '9px', padding: '8px 14px' }}
        >
          {block.props?.label ?? 'Button'}
        </a>
      </section>
    );
  }

  if (block.type === 'form') {
    return (
      <section className={`rv-panel ${a} rv-panel-form`} style={{ margin: '8px 0', padding: '12px' }} id="rv-contact">
        <h2 className="rv-h2" style={{ fontSize: '11px', marginBottom: '8px' }}>
          {block.props?.title ?? 'Contact'}
        </h2>
        <div className="space-y-2">
          {['Name', 'Email', 'Message'].map((f) => (
            <div key={f}>
              <div className="text-[8px] text-white/50 mb-1">{f}</div>
              {f === 'Message' ? (
                <div
                  className="w-full rounded"
                  style={{
                    height: '40px',
                    background: 'rgba(4,4,16,0.8)',
                    border: '1px solid rgba(0,255,255,0.2)',
                  }}
                />
              ) : (
                <div
                  className="w-full rounded"
                  style={{
                    height: '22px',
                    background: 'rgba(4,4,16,0.8)',
                    border: '1px solid rgba(0,255,255,0.2)',
                  }}
                />
              )}
            </div>
          ))}
          <div
            className="inline-block px-3 py-1.5 rounded text-[8px] mt-1"
            style={{
              background: 'rgba(255,77,255,0.15)',
              border: '1px solid rgba(255,77,255,0.4)',
              color: '#ff4dff',
            }}
          >
            {block.props?.submitLabel ?? 'Send'}
          </div>
        </div>
        <p className="text-[8px] mt-2" style={{ color: 'rgba(124,255,0,0.7)' }}>
          Demo preview only.
        </p>
      </section>
    );
  }

  return null;
}
