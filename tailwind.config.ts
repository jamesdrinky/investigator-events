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
        // Brand primary — deep blue to clean blue
        brand: {
          950: '#0B1220',
          900: '#1E3A8A',
          800: '#1E40AF',
          700: '#2563EB',
          600: '#3B82F6',
          500: '#60A5FA',
          400: '#93C5FD',
          300: '#BFDBFE',
          200: '#DBEAFE',
          100: '#EFF6FF',
          50: '#F8FAFC',
        },
        // Cyan accent from logo
        cyan: {
          500: '#22D3EE',
          400: '#67E8F9',
          300: '#A5F3FC',
        },
        // Pink accent — very subtle, max 5-10% usage
        accent: '#EC4899',
        // Legacy — keep for backwards compat during transition
        surface: '#050913',
        panel: '#0c1424',
        stroke: '#22304d',
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
        atlas: '0 32px 120px -48px rgba(4, 11, 24, 0.95)',
        'brand-sm': '0 4px 16px -4px rgba(37, 99, 235, 0.15)',
        'brand-md': '0 12px 36px -8px rgba(37, 99, 235, 0.2)',
        'brand-lg': '0 24px 60px -16px rgba(37, 99, 235, 0.25)',
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
          'radial-gradient(circle at 12% 16%, rgba(37,99,235,0.16), transparent 34%), radial-gradient(circle at 82% 9%, rgba(34,211,238,0.12), transparent 26%), radial-gradient(circle at 50% 85%, rgba(236,72,153,0.06), transparent 34%)',
        // Brand gradients
        'brand-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #22D3EE 100%)',
        'brand-gradient-subtle': 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #F8FAFC 100%)',
      }
    }
  },
  plugins: []
};

export default config;
