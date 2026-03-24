'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { WorldMapMotif } from '@/components/global/world-map-motif';
import type { RegionCoverage } from '@/lib/utils/coverage';

interface WorldIntelligenceBoardProps {
  regions: RegionCoverage[];
}

const regionNodes: Record<RegionCoverage['name'], { x: number; y: number }> = {
  'North America': { x: 16, y: 38 },
  Europe: { x: 46, y: 27 },
  'Middle East': { x: 61, y: 38 },
  'Asia-Pacific': { x: 82, y: 52 }
};

const routes: Array<{ from: RegionCoverage['name']; to: RegionCoverage['name']; lift: number }> = [
  { from: 'North America', to: 'Europe', lift: -8 },
  { from: 'Europe', to: 'Middle East', lift: -5 },
  { from: 'Middle East', to: 'Asia-Pacific', lift: 4 },
  { from: 'North America', to: 'Asia-Pacific', lift: -15 }
];

const regionColors: Record<RegionCoverage['name'], string> = {
  'North America': '#36a8ff',
  Europe: '#8e6dff',
  'Middle East': '#ffb14a',
  'Asia-Pacific': '#24d4c7'
};

function createPath(from: { x: number; y: number }, to: { x: number; y: number }, lift: number) {
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2 + lift;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

export function WorldIntelligenceBoard({ regions }: WorldIntelligenceBoardProps) {
  const reduceMotion = useReducedMotion();
  const visibleRegions = regions.filter((region) => region.eventCount > 0).slice(0, 4);

  return (
    <div className="relative min-h-[34rem] overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white p-5 shadow-[0_34px_90px_-60px_rgba(37,99,235,0.22)] sm:min-h-[40rem] sm:p-7">
      <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(42,155,255,0.12),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(122,104,255,0.08),transparent_18%),radial-gradient(circle_at_52%_80%,rgba(26,215,241,0.06),transparent_26%)]" />
      <div className="pointer-events-none absolute left-[6%] top-[6%] h-[54%] w-[88%] opacity-[0.08]">
        <WorldMapMotif />
      </div>

      <svg viewBox="0 0 100 62" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="board-route" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(37,99,235,0.18)" />
            <stop offset="48%" stopColor="rgba(96,165,250,0.68)" />
            <stop offset="100%" stopColor="rgba(20,184,166,0.28)" />
          </linearGradient>
        </defs>

        <g fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="0.12">
          <path d="M8 31H92" />
          <path d="M16 22C28 25 39 26 50 26C61 26 72 25 84 22" />
          <path d="M16 40C28 37 39 36 50 36C61 36 72 37 84 40" />
        </g>

        {routes.map((route, index) => {
          const from = regionNodes[route.from];
          const to = regionNodes[route.to];
          const path = createPath(from, to, route.lift);

          return (
            <g key={`${route.from}-${route.to}`}>
              <motion.path
                d={path}
                fill="none"
                stroke="url(#board-route)"
                strokeWidth={index === 0 || index === 3 ? '0.62' : '0.46'}
                initial={{ pathLength: 0.04, opacity: 0.08 }}
                animate={reduceMotion ? { pathLength: 1, opacity: 0.36 } : { pathLength: 1, opacity: [0.2, 0.88, 0.2] }}
                transition={
                  reduceMotion
                    ? { duration: 0.8, ease: 'easeOut' }
                    : { duration: 4.8 + index * 0.35, delay: index * 0.24, repeat: Infinity, ease: 'easeInOut' }
                }
              />
              <motion.path
                d={path}
                fill="none"
                stroke="rgba(14,165,233,0.76)"
                strokeWidth={index === 0 || index === 3 ? '0.82' : '0.68'}
                pathLength={0.14}
                initial={{ pathOffset: 1, opacity: 0 }}
                animate={reduceMotion ? { pathOffset: 0.18, opacity: 0.2 } : { pathOffset: [1, 0.18, 0], opacity: [0, 1, 0] }}
                transition={
                  reduceMotion
                    ? { duration: 0.8, ease: 'easeOut' }
                    : { duration: 3.8 + index * 0.24, delay: 0.24 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }
                }
              />
            </g>
          );
        })}

        {visibleRegions.map((region, index) => {
          const point = regionNodes[region.name];
          const share = Math.max(region.share, 0.08);

          return (
            <g key={region.name}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={1.8 + share * 4.8}
                fill={regionColors[region.name]}
                animate={reduceMotion ? undefined : { opacity: [0.12, 0.28, 0.12], scale: [1, 1.25, 1] }}
                transition={reduceMotion ? undefined : { duration: 3.6 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={0.65 + share * 1.8}
                fill="rgba(15,23,42,0.9)"
                animate={reduceMotion ? undefined : { opacity: [0.42, 1, 0.42] }}
                transition={reduceMotion ? undefined : { duration: 2.8 + index * 0.22, repeat: Infinity, ease: 'easeInOut' }}
              />
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-[linear-gradient(to_top,rgba(248,250,252,0.98),rgba(248,250,252,0.55),transparent)]" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-sky-700">World Event Intelligence</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
              Cross-region visibility across flagship events, coverage density, and coordination windows.
            </p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-emerald-700">
            Live routing
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {visibleRegions.map((region) => (
              <div key={region.name} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{region.name}</p>
                    <p className="mt-2 font-[var(--font-serif)] text-3xl leading-none text-slate-950">{region.eventCount}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{region.countryCount} countries active</p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-600">
                    {Math.round(region.share * 100)}%
                  </div>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(8, Math.round(region.share * 100))}%`, backgroundColor: regionColors[region.name] }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
