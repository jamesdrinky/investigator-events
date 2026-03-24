'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface FeaturedEventMiniMapProps {
  city: string;
  country: string;
  className?: string;
}

interface MapVariant {
  route: string;
  pin: { x: number; y: number };
}

const MAP_VARIANTS: MapVariant[] = [
  {
    route: 'M 14 58 C 36 52 50 36 68 26 C 82 18 95 16 108 18',
    pin: { x: 108, y: 18 }
  },
  {
    route: 'M 16 18 C 34 22 44 34 56 44 C 68 54 82 60 98 58',
    pin: { x: 98, y: 58 }
  },
  {
    route: 'M 16 54 C 34 48 46 24 64 16 C 78 10 92 12 106 20',
    pin: { x: 106, y: 20 }
  },
  {
    route: 'M 14 34 C 28 28 42 28 58 36 C 72 44 84 48 98 46',
    pin: { x: 98, y: 46 }
  }
];

function hashLabel(value: string) {
  return value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function FeaturedEventMiniMap({ city, country, className = '' }: FeaturedEventMiniMapProps) {
  const reducedMotion = useReducedMotion();
  const variant = MAP_VARIANTS[hashLabel(`${city}-${country}`) % MAP_VARIANTS.length];

  return (
    <div className={`pointer-events-none relative h-[4.75rem] w-[7.5rem] ${className}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-[1.2rem] bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.34),transparent_42%),linear-gradient(180deg,rgba(248,251,255,0.16),rgba(241,245,249,0.05))]" />
      <div className="absolute inset-0 rounded-[1.2rem] border border-white/22" />
      <svg viewBox="0 0 120 76" className="absolute inset-0 h-full w-full overflow-visible opacity-50">
        <g fill="none" strokeLinecap="round">
          <path d="M 10 18 C 26 20 38 18 52 26 C 64 32 76 34 94 30" stroke="rgba(226,232,240,0.22)" strokeWidth="1" />
          <path d="M 12 54 C 28 48 42 50 58 56 C 70 60 84 60 104 52" stroke="rgba(226,232,240,0.16)" strokeWidth="1" />
          <path d="M 34 10 C 32 22 36 30 46 38 C 54 46 58 54 58 66" stroke="rgba(191,219,254,0.14)" strokeWidth="0.9" />
          <path d="M 82 10 C 78 22 80 30 88 40 C 96 48 100 56 102 66" stroke="rgba(191,219,254,0.12)" strokeWidth="0.9" />
        </g>
      </svg>

      <svg viewBox="0 0 120 76" className="relative h-full w-full overflow-visible">
        <defs>
          <linearGradient id="hero-mini-route-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(37,99,235,0.82)" />
            <stop offset="42%" stopColor="rgba(34,211,238,0.9)" />
            <stop offset="74%" stopColor="rgba(99,102,241,0.9)" />
            <stop offset="100%" stopColor="rgba(236,72,153,0.76)" />
          </linearGradient>
          <radialGradient id="hero-mini-pin-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.96)" />
            <stop offset="34%" stopColor="rgba(103,232,249,0.72)" />
            <stop offset="70%" stopColor="rgba(99,102,241,0.42)" />
            <stop offset="100%" stopColor="rgba(236,72,153,0)" />
          </radialGradient>
        </defs>

        <path d={variant.route} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6" strokeLinecap="round" />
        <motion.path
          d={variant.route}
          fill="none"
          stroke="url(#hero-mini-route-stroke)"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={reducedMotion ? undefined : { opacity: [0.68, 0.88, 0.7] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d={variant.route}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="9 62"
          animate={reducedMotion ? undefined : { strokeDashoffset: [0, -71], opacity: [0, 0.9, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.circle
          cx={variant.pin.x}
          cy={variant.pin.y}
          r="8.5"
          fill="url(#hero-mini-pin-glow)"
          animate={reducedMotion ? undefined : { scale: [0.92, 1.18, 0.92], opacity: [0.32, 0.62, 0.32] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx={variant.pin.x}
          cy={variant.pin.y}
          r="2.8"
          fill="#ffffff"
          animate={reducedMotion ? undefined : { scale: [0.98, 1.05, 0.98] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}
