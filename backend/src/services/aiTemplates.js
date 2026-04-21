import { randomUUID } from 'crypto';

function block(type, props, align = 'left') {
  return { id: randomUUID(), type, props, ui: { align } };
}

export const BUILTIN_TEMPLATES = {
  arcade: () => [
    block('text', { variant: 'heading', title: 'RETROVERSE ARCADE', body: 'Build your site like a classic arcade cabinet.' }, 'center'),
    block(
      'text',
      { variant: 'callout', title: 'POWER UP', body: 'Drag blocks into the canvas, save slots, and publish instantly.' },
      'left',
    ),
    block('button', { label: 'INSERT COIN (Demo)', href: '#' }, 'left'),
    block('image', { imageUrl: '', altText: 'Arcade background' }, 'center'),
    block(
      'form',
      { title: 'PLAYER SIGN-UP', submitLabel: 'JOIN THE HIGH SCORE', actionUrl: '', method: 'POST' },
      'left',
    ),
  ],
  'pixel-blog': () => [
    block('text', { variant: 'heading', title: 'PIXEL BLOG', body: 'Neon posts. Crisp vibes. Zero code.' }, 'center'),
    block(
      'text',
      {
        variant: 'paragraph',
        title: 'LATEST QUEST',
        body: 'Write updates with drag-and-drop blocks. Your content stays safe and clean.',
      },
      'left',
    ),
    block('button', { label: 'READ MORE', href: '#' }, 'left'),
    block('image', { imageUrl: '', altText: 'Pixel hero art' }, 'center'),
    block('text', { variant: 'callout', title: 'FEATURED', body: 'Try templates: Arcade, Pixel Blog, Vintage Portfolio.' }, 'left'),
  ],
  portfolio: () => [
    block('text', { variant: 'heading', title: 'VINTAGE PORTFOLIO', body: 'Projects that look classy and ship fast.' }, 'center'),
    block(
      'text',
      { variant: 'paragraph', title: 'HIGHLIGHT', body: 'Use the editor to reorder sections and adjust alignment for mobile-first layouts.' },
      'left',
    ),
    block('button', { label: 'CONTACT ME', href: '#contact' }, 'left'),
    block('image', { imageUrl: '', altText: 'Project showcase' }, 'center'),
    block('form', { title: 'SEND A MESSAGE', submitLabel: 'TRANSMIT', actionUrl: '', method: 'POST' }, 'left'),
  ],
};

function normalizeGenre(genre) {
  const g = String(genre ?? '').toLowerCase().trim();
  if (['arcade', 'classic-arcade', 'cabinet'].includes(g)) return 'arcade';
  if (['pixel blog', 'pixel-blog', 'blog'].includes(g)) return 'pixel-blog';
  if (['portfolio', 'vintage', 'work'].includes(g)) return 'portfolio';
  return 'arcade';
}

async function generateWithOpenAI(genre, promptText) {
  // Optional: only used if OPENAI_API_KEY is set.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const base = normalizeGenre(genre);
  const userPrompt = promptText ? `User notes: ${promptText}` : '';

  const system = `You are a helpful website designer. Output ONLY valid JSON.
Create an array of blocks for a retro-themed one-page website builder.
Each block must follow this schema:
{
  "id": "<string>",
  "type": "text"|"image"|"button"|"form",
  "ui": { "align": "left"|"center"|"right" },
  "props": { ... depends on type ... }
}
Text props: { "variant": "heading"|"paragraph"|"callout", "title": string, "body": string }
Image props: { "imageUrl": string, "altText": string }
Button props: { "label": string, "href": string }
Form props: { "title": string, "submitLabel": string, "actionUrl": string, "method": "GET"|"POST" }
Return 4 to 7 blocks. No HTML. Keep text concise.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Template genre: ${base}. ${userPrompt}` },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) return null;
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return null;
  // The model should return JSON directly; parse it.
  const blocks = JSON.parse(content);
  return blocks;
}

export async function getSuggestions({ genre, promptText } = {}) {
  const g = normalizeGenre(genre);
  const builtin = BUILTIN_TEMPLATES[g]?.() ?? BUILTIN_TEMPLATES.arcade();

  const withAI = await generateWithOpenAI(g, promptText);
  // If OpenAI fails (no key, bad response, etc), fall back to builtins.
  return Array.isArray(withAI) && withAI.length ? withAI : builtin;
}

