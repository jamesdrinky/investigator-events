'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface FeaturedEventMiniMapProps {
  city: string;
  country: string;
  region?: string;
  className?: string;
}

// City-specific grid configs — offsets give each city a subtly unique layout
const CITY_CONFIGS: Record<string, { gridOffset: number; pinX: number; pinY: number }> = {
  philadelphia: { gridOffset: 0,    pinX: 62, pinY: 48 },
  newmarket:    { gridOffset: 12,   pinX: 58, pinY: 44 },
  prague:       { gridOffset: 24,   pinX: 66, pinY: 52 },
  london:       { gridOffset: 8,    pinX: 60, pinY: 46 },
  berlin:       { gridOffset: 16,   pinX: 64, pinY: 50 },
  paris:        { gridOffset: 20,   pinX: 62, pinY: 47 },
  chicago:      { gridOffset: 4,    pinX: 60, pinY: 50 },
  miami:        { gridOffset: 28,   pinX: 64, pinY: 52 },
  amsterdam:    { gridOffset: 14,   pinX: 61, pinY: 46 },
  rome:         { gridOffset: 22,   pinX: 63, pinY: 49 },
};

function getCityConfig(city: string) {
  const key = city.toLowerCase().replace(/[^a-z]/g, '');
  return CITY_CONFIGS[key] ?? { gridOffset: (city.charCodeAt(0) * 7) % 30, pinX: 62, pinY: 48 };
}

export function FeaturedEventMiniMap({ city, className = '' }: FeaturedEventMiniMapProps) {
  const reducedMotion = useReducedMotion();
  const config = getCityConfig(city);
  const { gridOffset: g, pinX: px, pinY: py } = config;

  // Route path: starts bottom-left, curves up to pin
  const routeStart = { x: 18, y: 88 };
  const routeEnd   = { x: px, y: py };
  const routeCtrl  = { x: 32, y: 38 };
  const routeD = `M ${routeStart.x} ${routeStart.y} Q ${routeCtrl.x} ${routeCtrl.y} ${routeEnd.x} ${routeEnd.y}`;

  // Approximate path length for dash animation
  const pathLen = 110;

  return (
    <div
      className={`pointer-events-none relative overflow-hidden rounded-[1.1rem] border border-white/60 bg-[linear-gradient(160deg,rgba(240,247,255,0.98),rgba(232,242,255,0.95))] shadow-[0_8px_28px_-12px_rgba(15,23,42,0.18)] ${className}`}
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Subtle background tint */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(96,165,250,0.12),transparent_60%),radial-gradient(circle_at_30%_70%,rgba(232,121,249,0.08),transparent_50%)]" />

      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="minimap-route" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#60a5fa" />
            <stop offset="55%"  stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <filter id="minimap-glow">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="minimap-pin-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
        </defs>

        {/* Street grid — horizontal lines */}
        {[22, 36, 50, 64, 78].map((y, i) => (
          <line
            key={`h${i}`}
            x1={0 + (g % 6)}
            y1={y}
            x2={100}
            y2={y + (g % 4) - 2}
            stroke="rgba(148,163,184,0.28)"
            strokeWidth="0.8"
          />
        ))}
        {/* Street grid — vertical lines */}
        {[18, 32, 46, 60, 74, 88].map((x, i) => (
          <line
            key={`v${i}`}
            x1={x + (g % 5) - 2}
            y1={0}
            x2={x + (g % 3)}
            y2={100}
            stroke="rgba(148,163,184,0.28)"
            strokeWidth="0.8"
          />
        ))}

        {/* A couple of slightly thicker main roads */}
        <line x1={0} y1={50 + (g % 8) - 4} x2={100} y2={50 + (g % 6) - 3} stroke="rgba(148,163,184,0.45)" strokeWidth="1.4" />
        <line x1={46 + (g % 6) - 3} y1={0} x2={48 + (g % 4) - 2} y2={100} stroke="rgba(148,163,184,0.45)" strokeWidth="1.4" />

        {/* Route glow (blurred underlay) */}
        <path
          d={routeD}
          fill="none"
          stroke="url(#minimap-route)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.35"
          filter="url(#minimap-glow)"
        />

        {/* Animated route line */}
        <motion.path
          d={routeD}
          fill="none"
          stroke="url(#minimap-route)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={`${pathLen}`}
          strokeDashoffset={pathLen}
          animate={reducedMotion ? undefined : { strokeDashoffset: [pathLen, 0] }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Pulsing dot travelling the route (looped) */}
        {!reducedMotion && (
          <motion.circle
            r="2.2"
            fill="#e879f9"
            filter="url(#minimap-glow)"
            animate={{
              offsetDistance: ['0%', '100%'],
              opacity: [0, 1, 1, 0]
            }}
            style={{
              offsetPath: `path("${routeD}")`,
              offsetRotate: '0deg',
            } as React.CSSProperties}
            transition={{ duration: 2.2, delay: 1.6, repeat: Infinity, repeatDelay: 2.8, ease: 'easeInOut' }}
          />
        )}

        {/* Origin dot — start of route */}
        <circle cx={routeStart.x} cy={routeStart.y} r="3" fill="rgba(96,165,250,0.5)" />
        <circle cx={routeStart.x} cy={routeStart.y} r="1.6" fill="#60a5fa" />

        {/* Pin drop shadow */}
        <ellipse cx={px} cy={py + 7.5} rx="3.5" ry="1.2" fill="rgba(0,0,0,0.12)" />

        {/* Pin body */}
        <motion.g
          animate={reducedMotion ? undefined : { y: [0, -2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Pin teardrop */}
          <path
            d={`M ${px} ${py - 10} 
                a 5.5 5.5 0 1 1 0.001 0 
                L ${px} ${py}`}
            fill="url(#minimap-pin-gradient)"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="0.8"
          />
          {/* Pin centre dot */}
          <circle cx={px} cy={py - 10} r="2" fill="white" opacity="0.9" />

          {/* Pulse ring around pin */}
          <motion.circle
            cx={px}
            cy={py - 10}
            r="8"
            fill="none"
            stroke="url(#minimap-route)"
            strokeWidth="1"
            animate={reducedMotion ? undefined : { r: [6, 11], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.6 }}
          />
        </motion.g>

        {/* City label */}
        <text
          x={px}
          y={py + 11}
          textAnchor="middle"
          fontSize="5.5"
          fontWeight="600"
          fontFamily="system-ui, sans-serif"
          fill="rgba(30,41,59,0.7)"
          letterSpacing="0.04em"
        >
          {city}
        </text>
      </svg>
    </div>
  );
}