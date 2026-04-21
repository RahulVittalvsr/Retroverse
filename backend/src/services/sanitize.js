import sanitizeHtml from 'sanitize-html';
import { randomUUID } from 'crypto';

function limitLen(s, max) {
  if (typeof s !== 'string') return '';
  const trimmed = s.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export function sanitizeText(input, { maxLen = 1000 } = {}) {
  const raw = limitLen(input, maxLen);
  // Remove tags + dangerous markup. We don't allow any HTML in block text.
  const noHtml = sanitizeHtml(raw, {
    allowedTags: [],
    allowedAttributes: {},
  });
  // Strip control characters (helps prevent weird rendering / smuggling).
  return noHtml.replace(/[\u0000-\u001F\u007F]/g, '');
}

export function sanitizeUrl(input) {
  if (typeof input !== 'string') return '';
  const url = input.trim();
  if (!url) return '';

  // Only allow safe protocols.
  if (/^https?:\/\//i.test(url)) return url;
  // Allow inline images (data URIs), but block everything else.
  if (/^data:image\/[a-zA-Z+]+;base64,/i.test(url)) return url;

  return '';
}

export function sanitizeMethod(input) {
  const m = String(input ?? '').toUpperCase();
  return m === 'GET' || m === 'POST' ? m : 'POST';
}

export function sanitizeAlign(input) {
  const a = String(input ?? '').toLowerCase();
  if (a === 'center' || a === 'right' || a === 'left') return a;
  return 'left';
}

function sanitizePropsByType(type, props) {
  const p = props && typeof props === 'object' ? props : {};
  if (type === 'text') {
    return {
      title: sanitizeText(p.title, { maxLen: 80 }),
      body: sanitizeText(p.body, { maxLen: 900 }),
      variant: ['heading', 'paragraph', 'callout'].includes(p.variant)
        ? p.variant
        : 'paragraph',
    };
  }

  if (type === 'image') {
    return {
      imageUrl: sanitizeUrl(p.imageUrl),
      altText: sanitizeText(p.altText ?? '', { maxLen: 120 }),
    };
  }

  if (type === 'button') {
    return {
      label: sanitizeText(p.label ?? 'Click', { maxLen: 32 }),
      href: sanitizeUrl(p.href),
    };
  }

  if (type === 'form') {
    return {
      title: sanitizeText(p.title ?? 'Contact', { maxLen: 60 }),
      submitLabel: sanitizeText(p.submitLabel ?? 'Send', { maxLen: 32 }),
      actionUrl: sanitizeUrl(p.actionUrl),
      method: sanitizeMethod(p.method),
    };
  }

  return {};
}

export function sanitizeBlock(block) {
  if (!block || typeof block !== 'object') return null;
  const type = String(block.type ?? '');
  if (!['text', 'image', 'button', 'form'].includes(type)) return null;

  return {
    id: sanitizeText(block.id ?? '', { maxLen: 64 }) || randomUUID(),
    type,
    ui: {
      align: sanitizeAlign(block.ui?.align),
    },
    props: sanitizePropsByType(type, block.props),
  };
}

export function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  const out = [];
  for (const b of blocks) {
    const cleaned = sanitizeBlock(b);
    if (cleaned) out.push(cleaned);
  }
  return out;
}

