function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function blockToHtml(block) {
  const align = block.ui?.align ?? 'left';
  const alignClass = `rv-align-${align}`;

  if (block.type === 'text') {
    const v = block.props?.variant ?? 'paragraph';
    const title = escapeHtml(block.props?.title ?? '');
    const body = escapeHtml(block.props?.body ?? '');

    if (v === 'heading') {
      return `<section class="rv-panel ${alignClass}">
  <h1 class="rv-h1">${title}</h1>
  <p class="rv-lead">${body}</p>
</section>`;
    }
    if (v === 'callout') {
      return `<section class="rv-panel rv-panel-callout ${alignClass}">
  <h2 class="rv-h2">${title}</h2>
  <p class="rv-callout">${body}</p>
</section>`;
    }
    return `<section class="rv-panel ${alignClass}">
  <h2 class="rv-h2">${title}</h2>
  <p class="rv-p">${body}</p>
</section>`;
  }

  if (block.type === 'image') {
    const src = escapeHtml(block.props?.imageUrl ?? '');
    const alt = escapeHtml(block.props?.altText ?? '');
    if (!src) {
      return `<section class="rv-panel ${alignClass} rv-panel-media">
  <div class="rv-img-placeholder" aria-label="${alt}">[IMAGE]</div>
</section>`;
    }
    return `<section class="rv-panel ${alignClass} rv-panel-media">
  <img class="rv-img" src="${src}" alt="${alt}" loading="lazy" />
</section>`;
  }

  if (block.type === 'button') {
    const label = escapeHtml(block.props?.label ?? 'Button');
    const href = escapeHtml(block.props?.href ?? '#');
    return `<section class="rv-panel ${alignClass}">
  <a class="rv-btn" href="${href}">${label}</a>
</section>`;
  }

  if (block.type === 'form') {
    const title = escapeHtml(block.props?.title ?? 'Contact');
    const submitLabel = escapeHtml(block.props?.submitLabel ?? 'Send');
    const actionUrl = escapeHtml(block.props?.actionUrl ?? '');
    const method = block.props?.method === 'GET' ? 'GET' : 'POST';
    // Note: method + action are safe because we sanitize to http(s) / data:image.
    return `<section class="rv-panel ${alignClass} rv-panel-form" id="rv-contact">
  <h2 class="rv-h2">${title}</h2>
  <form class="rv-form" data-action-url="${actionUrl}" data-method="${method}">
    <label class="rv-label">
      <span>Name</span>
      <input name="name" class="rv-input" type="text" autocomplete="name" required />
    </label>
    <label class="rv-label">
      <span>Email</span>
      <input name="email" class="rv-input" type="email" autocomplete="email" required />
    </label>
    <label class="rv-label">
      <span>Message</span>
      <textarea name="message" class="rv-textarea" rows="4" required></textarea>
    </label>
    <button class="rv-btn rv-btn-submit" type="submit">${submitLabel}</button>
    <p class="rv-form-status" role="status" aria-live="polite"></p>
  </form>
</section>`;
  }

  return '';
}

export function createExportFiles({ blocks } = {}) {
  const safeBlocks = Array.isArray(blocks) ? blocks : [];
  const body = safeBlocks.map(blockToHtml).join('\n');

  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RetroVerse Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./style.css" />
</head>
<body>
  <div class="rv-bg" aria-hidden="true"></div>
  <main class="rv-page">
    <header class="rv-hero">
      <div class="rv-logo">
        <span class="rv-logo-mark">▶</span>
        <span class="rv-logo-text">RETROVERSE</span>
      </div>
      <p class="rv-hero-sub">Generated export • clean HTML/CSS/JS</p>
    </header>

    ${body}
  </main>

  <script src="./script.js" defer></script>
</body>
</html>`;

  const styleCss = `:root{
  --bg:#070714;
  --panel:rgba(20, 10, 40, .6);
  --border:rgba(0, 255, 255, .25);
  --text:#eaffff;
  --muted:rgba(234,255,255,.75);
  --neon:#00ffff;
  --neon2:#ff4dff;
  --neon3:#7cff00;
  --shadow: 0 0 18px rgba(0,255,255,.35);
}
*{ box-sizing:border-box; }
html,body{ height:100%; }
body{
  margin:0;
  font-family:"Press Start 2P", monospace;
  background: var(--bg);
  color: var(--text);
}
.rv-bg{
  position:fixed; inset:0; pointer-events:none;
  background:
    radial-gradient(900px 520px at 18% 12%, rgba(255,77,255,.22), transparent 60%),
    radial-gradient(700px 420px at 75% 18%, rgba(0,255,255,.18), transparent 55%),
    linear-gradient(180deg, rgba(124,255,0,.08), transparent 38%),
    repeating-linear-gradient(0deg, rgba(0,255,255,.07), rgba(0,255,255,.07) 1px, transparent 1px, transparent 6px);
  opacity:.9;
}
.rv-page{
  position:relative;
  width:min(980px, calc(100% - 24px));
  margin: 22px auto 48px;
}
.rv-hero{
  margin: 18px 0 20px;
  padding: 18px 18px;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(10,8,26,.6), rgba(10,8,26,.35));
  border-radius: 10px;
  box-shadow: var(--shadow);
}
.rv-logo{ display:flex; align-items:center; gap:12px; }
.rv-logo-mark{
  color: var(--neon2);
  text-shadow: 0 0 16px rgba(255,77,255,.55);
  font-size: 18px;
}
.rv-logo-text{
  letter-spacing: .08em;
  font-size: 18px;
}
.rv-hero-sub{
  margin: 10px 0 0;
  font-size: 10px;
  color: var(--muted);
}
.rv-panel{
  margin: 16px 0;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--panel);
  box-shadow: 0 0 0 rgba(0,255,255,0);
}
.rv-panel-callout{
  border-color: rgba(255,77,255,.35);
  box-shadow: 0 0 20px rgba(255,77,255,.18);
}
.rv-align-left{ text-align:left; }
.rv-align-center{ text-align:center; }
.rv-align-right{ text-align:right; }
.rv-h1{ font-size: 22px; margin:0 0 10px; color: var(--neon); text-shadow: var(--shadow); }
.rv-h2{ font-size: 14px; margin: 0 0 10px; color: var(--neon3); }
.rv-lead{ margin:0; color: var(--muted); font-size: 10px; line-height: 1.6; }
.rv-p{ margin:0; color: var(--muted); font-size: 10px; line-height: 1.7; }
.rv-callout{ margin:0; color: var(--muted); font-size: 10px; line-height: 1.7; }
.rv-panel-media{ padding: 12px; }
.rv-img{
  width:100%;
  max-height: 360px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(0,255,255,.25);
  box-shadow: 0 0 18px rgba(0,255,255,.2);
}
.rv-img-placeholder{
  padding: 22px 14px;
  border-radius: 8px;
  border: 1px dashed rgba(0,255,255,.35);
  color: rgba(234,255,255,.8);
  text-align:center;
}
.rv-btn{
  display:inline-block;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(0,255,255,.45);
  color: var(--text);
  text-decoration:none;
  background: linear-gradient(180deg, rgba(0,255,255,.18), rgba(0,255,255,.06));
  box-shadow: 0 0 20px rgba(0,255,255,.15);
  transition: transform .12s ease, box-shadow .12s ease;
  font-size: 10px;
}
.rv-btn:hover{
  transform: translateY(-1px);
  box-shadow: 0 0 30px rgba(0,255,255,.28);
}
.rv-btn-submit{
  margin-top: 12px;
  border-color: rgba(255,77,255,.45);
  background: linear-gradient(180deg, rgba(255,77,255,.2), rgba(255,77,255,.06));
  box-shadow: 0 0 22px rgba(255,77,255,.18);
}
.rv-panel-form .rv-label{ display:block; margin: 12px 0; }
.rv-label span{ display:block; margin: 0 0 6px; font-size: 10px; color: var(--muted); }
.rv-input, .rv-textarea{
  width:100%;
  padding: 10px 10px;
  border-radius: 8px;
  border: 1px solid rgba(0,255,255,.25);
  background: rgba(5,5,15,.7);
  color: var(--text);
  font-family:"Press Start 2P", monospace;
  font-size: 10px;
}
.rv-textarea{ resize: vertical; min-height: 96px; }
.rv-form-status{
  margin: 12px 0 0;
  color: rgba(124,255,0,.9);
  font-size: 10px;
}

@media (max-width: 520px){
  .rv-page{ width: calc(100% - 16px); margin-top: 14px; }
  .rv-panel{ padding: 14px; }
}
`;

  const scriptJs = `async function submitForm(form){
  const actionUrl = form.getAttribute('data-action-url') || '';
  const method = (form.getAttribute('data-method') || 'POST').toUpperCase();
  const statusEl = form.querySelector('.rv-form-status');
  if(!statusEl) return;

  const show = (msg) => { statusEl.textContent = msg; };
  if(!actionUrl){
    show('No action URL set (safe demo).');
    return;
  }

  try{
    const fd = new FormData(form);
    const opts = { method, body: fd };
    let url = actionUrl;
    if(method === 'GET'){
      const u = new URL(actionUrl, window.location.href);
      for(const [k,v] of fd.entries()) u.searchParams.set(k, String(v));
      url = u.toString();
      delete opts.body;
    }
    show('Sending...');
    const res = await fetch(url, opts);
    if(!res.ok) throw new Error('Request failed');
    show('Sent. Thanks!');
    form.reset();
  }catch(e){
    show('Submit failed (demo).');
  }
}

document.addEventListener('submit', (e) => {
  const form = e.target && e.target.classList && e.target.classList.contains('rv-form') ? e.target : null;
  if(!form) return;
  e.preventDefault();
  submitForm(form);
});`;

  return { 'index.html': indexHtml, 'style.css': styleCss, 'script.js': scriptJs };
}

