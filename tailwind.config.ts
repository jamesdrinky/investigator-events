import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#050913',
        panel: '#0c1424',
        stroke: '#22304d',
        accent: '#ffbf66',
        accent2: '#ffe7b8',
        signal: '#36a8ff',
        signal2: '#d7eeff',
        globe: '#24d4c7',
        globe2: '#d7fff8',
        atlas: '#6c63ff',
        atlas2: '#f27cff',
        ember: '#ff8f3f'
      },
      boxShadow: {
        soft: '0 18px 40px -18px rgba(0, 0, 0, 0.72)',
        glass: '0 0 0 1px rgba(255,255,255,0.05), 0 28px 60px -28px rgba(0, 0, 0, 0.9)',
        atlas: '0 32px 120px -48px rgba(4, 11, 24, 0.95)'
      },
      animation: {
        ripple: 'ripple 2s ease calc(var(--i, 0) * 0.2s) infinite',
        orbit: 'orbit calc(var(--duration) * 1s) linear infinite',
        'star-btn': 'star-btn calc(var(--duration) * 1s) linear infinite',
      },
      keyframes: {
        ripple: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -50%) scale(0.9)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)' },
        },
        'star-btn': {
          '0%': { offsetDistance: '0%' },
          '100%': { offsetDistance: '100%' },
        },
      },
      backgroundImage: {
        grain:
          'radial-gradient(circle at 12% 16%, rgba(54,168,255,0.16), transparent 34%), radial-gradient(circle at 82% 9%, rgba(242,124,255,0.12), transparent 26%), radial-gradient(circle at 50% 85%, rgba(255,191,102,0.08), transparent 34%)'
      }
    }
  },
  plugins: []
};

export default config;
