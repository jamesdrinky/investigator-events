'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import landData from 'world-atlas/land-110m.json';

interface FeaturedEventMiniMapProps {
  city: string;
  country: string;
  region?: string;
  className?: string;
}

interface HotspotVariant {
  primary: [number, number];
  secondary: Array<{ coordinates: [number, number]; color: 'blue' | 'violet' | 'pink' }>;
}

const HOTSPOT_VARIANTS: HotspotVariant[] = [
  {
    primary: [-74.006, 40.7128],
    secondary: [
      { coordinates: [-81.3792, 28.5383], color: 'blue' },
      { coordinates: [-0.1276, 51.5072], color: 'violet' },
      { coordinates: [14.4378, 50.0755], color: 'pink' }
    ]
  },
  {
    primary: [-0.1276, 51.5072],
    secondary: [
      { coordinates: [-74.006, 40.7128], color: 'blue' },
      { coordinates: [13.405, 52.52], color: 'violet' },
      { coordinates: [14.4378, 50.0755], color: 'pink' }
    ]
  },
  {
    primary: [13.405, 52.52],
    secondary: [
      { coordinates: [-81.3792, 28.5383], color: 'blue' },
      { coordinates: [-0.1276, 51.5072], color: 'violet' },
      { coordinates: [14.4378, 50.0755], color: 'pink' }
    ]
  },
  {
    primary: [14.4378, 50.0755],
    secondary: [
      { coordinates: [-74.006, 40.7128], color: 'blue' },
      { coordinates: [-0.1276, 51.5072], color: 'violet' },
      { coordinates: [-81.3792, 28.5383], color: 'pink' }
    ]
  }
];

const WIDTH = 1200;
const HEIGHT = 420;
const landFeature = feature((landData as any), (landData as any).objects.land) as any;
const projection = geoNaturalEarth1().fitExtent(
  [
    [32, 34],
    [WIDTH - 30, HEIGHT - 26]
  ],
  landFeature
);
const pathGenerator = geoPath(projection);
const landPath = pathGenerator(landFeature) ?? '';

function hashLabel(value: string) {
  return value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function projectPoint([lon, lat]: [number, number]) {
  const point = projection([lon, lat]);
  return point ? { x: point[0], y: point[1] } : { x: 0, y: 0 };
}

export function FeaturedEventMiniMap({ city, country, region, className = '' }: FeaturedEventMiniMapProps) {
  const reducedMotion = useReducedMotion();
  const variant = HOTSPOT_VARIANTS[hashLabel(`${city}-${country}`) % HOTSPOT_VARIANTS.length];
  const primary = projectPoint(variant.primary);
  const secondary = variant.secondary.map((point) => ({ ...point, projected: projectPoint(point.coordinates) }));

  return (
    <div
      className={`pointer-events-none relative overflow-hidden rounded-[1.2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,251,255,0.98),rgba(240,246,255,0.96))] shadow-[0_20px_44px_-30px_rgba(15,23,42,0.14)] ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_34%,rgba(37,99,235,0.14),transparent_24%),radial-gradient(circle_at_48%_62%,rgba(124,58,237,0.1),transparent_22%),radial-gradient(circle_at_82%_34%,rgba(255,45,166,0.08),transparent_20%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(180,160,255,0.08))]" />
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="absolute left-1/2 top-1/2 h-[144%] w-[144%] -translate-x-[50%] -translate-y-[50%] overflow-visible"
      >
        <defs>
          <radialGradient id="world-panel-glow" cx="50%" cy="50%" r="52%">
            <stop offset="0%" stopColor="rgba(37,99,235,0.1)" />
            <stop offset="55%" stopColor="rgba(124,58,237,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <radialGradient id="world-hotspot-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="32%" stopColor="rgba(37,99,235,0.34)" />
            <stop offset="68%" stopColor="rgba(124,58,237,0.16)" />
            <stop offset="100%" stopColor="rgba(255,45,166,0)" />
          </radialGradient>
          <linearGradient id="world-route-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(37,99,235,0.04)" />
            <stop offset="45%" stopColor="rgba(37,99,235,0.16)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0.1)" />
          </linearGradient>
        </defs>

        <ellipse cx="600" cy="224" rx="520" ry="162" fill="url(#world-panel-glow)" />

        <path d={landPath} fill="rgba(255,255,255,0.97)" stroke="rgba(191,219,254,0.7)" strokeWidth="1.1" />

        <g fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="1">
          <path d="M126 186Q356 210 578 188" />
          <path d="M598 184Q818 206 1058 190" />
          <path d="M706 292Q822 314 980 292" />
        </g>

        <g stroke="url(#world-route-stroke)" strokeWidth="1.35" fill="none" strokeLinecap="round">
          <path d={`M ${primary.x} ${primary.y} Q ${(primary.x + secondary[1].projected.x) / 2} ${Math.min(primary.y, secondary[1].projected.y) - 34} ${secondary[1].projected.x} ${secondary[1].projected.y}`} />
          <path d={`M ${secondary[1].projected.x} ${secondary[1].projected.y} Q ${(secondary[1].projected.x + secondary[2].projected.x) / 2} ${Math.min(secondary[1].projected.y, secondary[2].projected.y) - 20} ${secondary[2].projected.x} ${secondary[2].projected.y}`} />
          {region ? <path d={`M ${primary.x} ${primary.y} Q ${(primary.x + secondary[0].projected.x) / 2} ${Math.max(primary.y, secondary[0].projected.y) + 28} ${secondary[0].projected.x} ${secondary[0].projected.y}`} /> : null}
        </g>

        <motion.circle
          cx={primary.x}
          cy={primary.y}
          r="28"
          fill="url(#world-hotspot-glow)"
          animate={reducedMotion ? undefined : { scale: [0.92, 1.16, 0.92], opacity: [0.28, 0.6, 0.28] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx={primary.x} cy={primary.y} r="5.8" fill="#2563EB" />

        {secondary.map((point, index) => (
          <motion.g key={`${point.projected.x}-${point.projected.y}-${index}`}>
            <motion.circle
              cx={point.projected.x}
              cy={point.projected.y}
              r="18"
              fill="url(#world-hotspot-glow)"
              animate={reducedMotion ? undefined : { opacity: [0.18, 0.34, 0.18], scale: [0.96, 1.08, 0.96] }}
              transition={{ duration: 2.6 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx={point.projected.x}
              cy={point.projected.y}
              r="4.4"
              fill={point.color === 'blue' ? '#38BDF8' : point.color === 'violet' ? '#7C3AED' : '#FF2DA6'}
              animate={reducedMotion ? undefined : { opacity: [0.72, 1, 0.72], scale: [0.98, 1.08, 0.98] }}
              transition={{ duration: 2.4 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
