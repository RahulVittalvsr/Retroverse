// Block type definitions — each has a pixel icon, label, tagline, and color accent
export const BLOCK_TYPES = [
  {
    type: 'text',
    label: 'Text',
    tagline: 'Headings, paragraphs, callouts',
    icon: '📝',
    color: 'neon',
  },
  {
    type: 'image',
    label: 'Image',
    tagline: 'Neon hero visuals',
    icon: '🖼️',
    color: 'magenta',
  },
  {
    type: 'button',
    label: 'Button',
    tagline: 'Arcade links & CTAs',
    icon: '🕹️',
    color: 'lime',
  },
  {
    type: 'form',
    label: 'Form',
    tagline: 'Contact & message capture',
    icon: '📡',
    color: 'amber',
  },
];

export function createPaletteBlock(type) {
  const id = crypto.randomUUID();
  const align = 'left';

  if (type === 'text') {
    return {
      id,
      type,
      ui: { align },
      props: { variant: 'paragraph', title: 'NEW TEXT', body: 'Type your content in the inspector.' },
    };
  }
  if (type === 'image') {
    return {
      id,
      type,
      ui: { align },
      props: { imageUrl: '', altText: 'Retro image' },
    };
  }
  if (type === 'button') {
    return {
      id,
      type,
      ui: { align },
      props: { label: 'PRESS START', href: '#' },
    };
  }
  if (type === 'form') {
    return {
      id,
      type,
      ui: { align },
      props: { title: 'PLAYER INBOX', submitLabel: 'TRANSMIT', actionUrl: '', method: 'POST' },
    };
  }
  return null;
}
