'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface FeaturedEventMiniMapProps {
  city: string;
  country: string;
  region?: string;
  className?: string;
  style?: React.CSSProperties;
}

const CITY_CONFIGS: Record<string, { gridOffset: number; pinX: number; pinY: number }> = {
  philadelphia: { gridOffset: 0,  pinX: 58, pinY: 46 },
  newmarket:    { gridOffset: 12, pinX: 54, pinY: 42 },
  prague:       { gridOffset: 24, pinX: 62, pinY: 50 },
  london:       { gridOffset: 8,  pinX: 56, pinY: 44 },
  berlin:       { gridOffset: 16, pinX: 60, pinY: 48 },
  paris:        { gridOffset: 20, pinX: 58, pinY: 45 },
  chicago:      { gridOffset: 4,  pinX: 56, pinY: 48 },
  miami:        { gridOffset: 28, pinX: 60, pinY: 50 },
  amsterdam:    { gridOffset: 14, pinX: 57, pinY: 44 },
  rome:         { gridOffset: 22, pinX: 59, pinY: 47 },
};

function getCityConfig(city: string) {
  const key = city.toLowerCase().replace(/[^a-z]/g, '');
  return CITY_CONFIGS[key] ?? { gridOffset: (city.charCodeAt(0) * 7) % 30, pinX: 58, pinY: 46 };
}

export function FeaturedEventMiniMap({ city, className = '', style }: FeaturedEventMiniMapProps) {
  const reducedMotion = useReducedMotion();
  const { gridOffset: g, pinX: px, pinY: py } = getCityConfig(city);

  // Street grid — block dimensions vary per city
  const blockW = 15 + (g % 5);
  const blockH = 14 + (g % 4);
  const originX = g % blockW;
  const originY = g % blockH;

  const vLines: number[] = [];
  for (let x = originX; x <= 105; x += blockW) vLines.push(x);

  const hLines: number[] = [];
  for (let y = originY; y <= 105; y += blockH) hLines.push(y);

  // Pick the arterial roads closest to centre
  const mainH = hLines.reduce((c, y) => (Math.abs(y - 50) < Math.abs(c - 50) ? y : c), hLines[0] ?? 50);
  const mainV = vLines.reduce((c, x) => (Math.abs(x - 50) < Math.abs(c - 50) ? x : c), vLines[0] ?? 50);

  // Route: from bottom, curves along arterials up to pin
  const routeStart = { x: mainV, y: 96 };
  const routeEnd   = { x: px,    y: py  };
  const routeCtrl  = { x: mainV, y: mainH };
  const routeD  = `M ${routeStart.x} ${routeStart.y} Q ${routeCtrl.x} ${routeCtrl.y} ${routeEnd.x} ${routeEnd.y}`;
  const pathLen = 120;

  // Pin geometry
  const pinCy = py - 10;
  const pinR  = 6;

  return (
    <div
      className={`pointer-events-none relative overflow-hidden ${className}`}
      style={{ width: '100%', height: '100%', background: 'transparent', ...style }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="mm-route" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#60a5fa" />
            <stop offset="50%"  stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <linearGradient id="mm-pin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="mm-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="mm-pin-shadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="rgba(96,165,250,0.45)" />
          </filter>
          <clipPath id="mm-clip">
            <rect x="0" y="0" width="100" height="100" />
          </clipPath>
        </defs>

        <g clipPath="url(#mm-clip)">
          {/* Street grid — vertical, almost invisible */}
          {vLines.map((x, i) => (
            <line key={`v${i}`} x1={x} y1={0} x2={x} y2={100}
              stroke="rgba(100,116,139,0.12)" strokeWidth="1.2" />
          ))}

          {/* Street grid — horizontal */}
          {hLines.map((y, i) => (
            <line key={`h${i}`} x1={0} y1={y} x2={100} y2={y}
              stroke="rgba(100,116,139,0.12)" strokeWidth="1.2" />
          ))}

          {/* Arterial roads — barely there */}
          <line x1={0} y1={mainH} x2={100} y2={mainH}
            stroke="rgba(100,116,139,0.16)" strokeWidth="2" />
          <line x1={mainV} y1={0} x2={mainV} y2={100}
            stroke="rgba(100,116,139,0.16)" strokeWidth="2" />

          {/* Route glow underlay — dominant element, strong bloom */}
          <path
            d={routeD}
            fill="none"
            stroke="url(#mm-route)"
            strokeWidth="9"
            strokeLinecap="round"
            opacity="0.5"
            filter="url(#mm-glow)"
          />

          {/* Route line — draws on */}
          <motion.path
            d={routeD}
            fill="none"
            stroke="url(#mm-route)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={pathLen}
            strokeDashoffset={pathLen}
            animate={reducedMotion ? undefined : { strokeDashoffset: [pathLen, 0] }}
            transition={{ duration: 1.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Origin dot */}
          <circle cx={routeStart.x} cy={routeStart.y} r="3.2" fill="rgba(96,165,250,0.2)" />
          <circle cx={routeStart.x} cy={routeStart.y} r="1.8" fill="#60a5fa" opacity="0.8" />

          {/* Pin group — bobs gently */}
          <motion.g
            animate={reducedMotion ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Pulse ring */}
            <motion.circle
              cx={px} cy={pinCy}
              r={pinR}
              fill="none"
              stroke="#93c5fd"
              strokeWidth="1.2"
              animate={reducedMotion ? undefined : { r: [pinR + 1, pinR + 9], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.4 }}
            />

            {/* Teardrop circle head */}
            <circle
              cx={px} cy={pinCy}
              r={pinR}
              fill="url(#mm-pin)"
              stroke="white"
              strokeWidth="1.5"
              filter="url(#mm-pin-shadow)"
            />

            {/* Teardrop tip */}
            <path
              d={`M ${px - pinR * 0.52} ${pinCy + pinR * 0.86} Q ${px} ${py + 1.5} ${px + pinR * 0.52} ${pinCy + pinR * 0.86}`}
              fill="url(#mm-pin)"
            />

            {/* White inner dot */}
            <circle cx={px} cy={pinCy} r="2.2" fill="white" opacity="0.95" />
          </motion.g>

          {/* City label pill */}
          <rect
            x={px - 15} y={py + 4}
            width="30" height="8.5"
            rx="2.5"
            fill="rgba(255,255,255,0.88)"
            stroke="rgba(148,163,184,0.2)"
            strokeWidth="0.6"
          />
          <text
            x={px} y={py + 9.8}
            textAnchor="middle"
            fontSize="4.6"
            fontWeight="700"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="rgba(15,23,42,0.7)"
            letterSpacing="0.04em"
          >
            {city}
          </text>
        </g>
      </svg>
    </div>
  );
}
