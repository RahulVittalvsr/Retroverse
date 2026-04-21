/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        neon:    '#00ffff',
        magenta: '#ff4dff',
        lime:    '#7cff00',
        amber:   '#ffb800',
        retro: {
          bg:    '#070714',
          panel: 'rgba(14,8,32,0.82)',
        },
      },
      boxShadow: {
        neon:    '0 0 18px rgba(0,255,255,.38)',
        magenta: '0 0 18px rgba(255,77,255,.32)',
        lime:    '0 0 18px rgba(124,255,0,.28)',
        amber:   '0 0 18px rgba(255,184,0,.28)',
      },
      animation: {
        'neon-pulse': 'neonPulse 2.8s ease-in-out infinite',
        'blink':      'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
};
