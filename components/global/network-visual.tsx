'use client';

import { motion } from 'framer-motion';
import type { RegionCoverage } from '@/lib/utils/coverage';

interface GlobalNetworkVisualProps {
  regions: RegionCoverage[];
}

const nodePosition: Record<RegionCoverage['name'], { x: number; y: number }> = {
  'North America': { x: 18, y: 42 },
  Europe: { x: 47, y: 31 },
  'Middle East': { x: 61, y: 42 },
  'Asia-Pacific': { x: 82, y: 56 }
};

const links: Array<{ from: RegionCoverage['name']; to: RegionCoverage['name']; curve: number }> = [
  { from: 'North America', to: 'Europe', curve: -10 },
  { from: 'Europe', to: 'Middle East', curve: -7 },
  { from: 'Middle East', to: 'Asia-Pacific', curve: 6 },
  { from: 'North America', to: 'Asia-Pacific', curve: -18 }
];

function pathForLink(from: { x: number; y: number }, to: { x: number; y: number }, curve: number): string {
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2 + curve;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

export function GlobalNetworkVisual({ regions }: GlobalNetworkVisualProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.1]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(77,163,255,0.1),transparent_24%),radial-gradient(circle_at_82%_20%,rgba(52,211,153,0.08),transparent_22%),radial-gradient(circle_at_50%_90%,rgba(184,228,255,0.05),transparent_40%)]" />
      <svg viewBox="0 0 100 68" className="relative h-32 w-full sm:h-36" aria-hidden="true">
        <defs>
          <linearGradient id="networkLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(77,163,255,0.12)" />
            <stop offset="50%" stopColor="rgba(184,228,255,0.56)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.2)" />
          </linearGradient>
          <radialGradient id="networkGlow" cx="50%" cy="42%" r="54%">
            <stop offset="0%" stopColor="rgba(184,228,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <ellipse cx="50" cy="38" rx="39" ry="20" fill="url(#networkGlow)" opacity="0.9" />
        <g fill="none" stroke="rgba(148,163,184,0.24)" strokeWidth="0.22">
          <ellipse cx="50" cy="38" rx="35" ry="18" />
          <path d="M15 38H85" />
          <path d="M21 32C31 35 40 36 50 36C60 36 69 35 79 32" />
          <path d="M21 44C31 41 40 40 50 40C60 40 69 41 79 44" />
          <path d="M33 22C30 29 28 34 28 38C28 42 30 47 33 54" />
          <path d="M50 20C50 27 50 33 50 38C50 43 50 49 50 56" />
          <path d="M67 22C70 29 72 34 72 38C72 42 70 47 67 54" />
        </g>

        <g>
          {links.map((link) => {
            const from = nodePosition[link.from];
            const to = nodePosition[link.to];
            return (
              <motion.path
                key={`${link.from}-${link.to}`}
                d={pathForLink(from, to, link.curve)}
                stroke="url(#networkLine)"
                strokeWidth="0.45"
                fill="none"
                initial={{ pathLength: 0, opacity: 0.25 }}
                animate={{ pathLength: 1, opacity: [0.24, 0.72, 0.24] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
              />
            );
          })}
        </g>

        {regions.map((region) => {
          const point = nodePosition[region.name];
          const intensity = 0.8 + region.share * 1.7;
          return (
            <g key={region.name}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={3.8 + region.share * 1.6}
                fill="rgba(77,163,255,0.14)"
                animate={{ opacity: [0.08, 0.22, 0.08], scale: [1, 1.2, 1] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={1.6 + region.share * 1.8}
                fill="rgba(5,150,105,0.9)"
                animate={{ opacity: [0.45, 0.95, 0.45], scale: [1, intensity, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <circle cx={point.x} cy={point.y} r="4.8" fill="rgba(52,211,153,0.14)" />
              <text
                x={point.x + 2}
                y={point.y - 2.5}
                fill="rgba(51,65,85,0.8)"
                fontSize="2.3"
                letterSpacing="0.4"
                className="uppercase"
              >
                {region.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
