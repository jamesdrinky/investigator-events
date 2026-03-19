'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { HemisphereGlobe } from '@/components/global/hemisphere-globe';
import { WorldMapMotif } from '@/components/global/world-map-motif';
import type { RegionCoverage } from '@/lib/utils/coverage';

interface HeroSignalStageProps {
  regions: RegionCoverage[];
  stats: {
    totalEvents: number;
    totalCountries: number;
    totalSubregions: number;
  };
}

const orbitalRoutes = [
  'M 132 442 C 280 316 438 268 612 280 C 804 294 966 358 1218 192',
  'M 104 556 C 304 386 500 332 704 342 C 908 352 1098 418 1310 286',
  'M 248 258 C 438 388 604 440 770 426 C 950 410 1104 324 1302 364',
  'M 202 666 C 366 530 554 470 760 474 C 968 478 1142 538 1320 452'
];

const pulseNodes = [
  { x: 146, y: 438, major: false },
  { x: 320, y: 336, major: true },
  { x: 488, y: 286, major: false },
  { x: 648, y: 292, major: true },
  { x: 792, y: 420, major: false },
  { x: 958, y: 356, major: true },
  { x: 1112, y: 270, major: false },
  { x: 1268, y: 312, major: true }
];

function metricCards(stats: HeroSignalStageProps['stats']) {
  return [
    { label: 'Countries', value: stats.totalCountries },
    { label: 'Subregions', value: stats.totalSubregions },
    { label: 'Events', value: stats.totalEvents }
  ];
}

export function HeroSignalStage({ regions, stats }: HeroSignalStageProps) {
  const reduceMotion = useReducedMotion();
  const activeRegions = regions.filter((region) => region.eventCount > 0).slice(0, 4);

  return (
    <div className="relative min-h-[30rem] sm:min-h-[36rem] lg:min-h-[42rem]">
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,14,24,0.14),rgba(5,14,24,0.64)_48%,rgba(3,9,15,0.92))]" />
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] geo-grid opacity-[0.06]" />
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_18%_18%,rgba(77,163,255,0.24),transparent_20%),radial-gradient(circle_at_76%_20%,rgba(52,211,153,0.14),transparent_18%),radial-gradient(circle_at_52%_62%,rgba(184,228,255,0.08),transparent_28%)]" />

      <motion.div
        className="pointer-events-none absolute inset-x-[-10%] top-[-6%] h-[68%] opacity-[0.22]"
        animate={reduceMotion ? undefined : { x: [0, 18, 0], opacity: [0.16, 0.26, 0.16] }}
        transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      >
        <WorldMapMotif />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute right-[-14%] top-[-10%] h-[112%] w-[92%] opacity-[0.86]"
        animate={reduceMotion ? undefined : { y: [0, -14, 0], x: [0, 10, 0] }}
        transition={reduceMotion ? undefined : { duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      >
        <HemisphereGlobe emphasis="feature" className="h-full w-full" />
      </motion.div>

      <svg viewBox="0 0 1400 760" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="hero-stage-route" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(77,163,255,0)" />
            <stop offset="38%" stopColor="rgba(77,163,255,0.5)" />
            <stop offset="72%" stopColor="rgba(184,228,255,0.52)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.16)" />
          </linearGradient>
          <radialGradient id="hero-stage-glow" cx="50%" cy="64%" r="44%">
            <stop offset="0%" stopColor="rgba(184,228,255,0.14)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <ellipse cx="820" cy="580" rx="540" ry="198" fill="url(#hero-stage-glow)" />

        <g fill="none" stroke="rgba(184,228,255,0.16)" strokeWidth="1">
          <path d="M242 598C242 446 498 326 820 326C1142 326 1398 446 1398 598" />
          <path d="M316 598C316 476 534 380 820 380C1106 380 1324 476 1324 598" />
          <path d="M404 598C404 502 586 426 820 426C1054 426 1236 502 1236 598" />
        </g>

        <g>
          {orbitalRoutes.map((route, index) => (
            <g key={route}>
              <motion.path
                d={route}
                fill="none"
                stroke="url(#hero-stage-route)"
                strokeWidth={index < 2 ? 2.1 : 1.6}
                strokeLinecap="round"
                initial={{ pathLength: 0.04, opacity: 0.08 }}
                animate={reduceMotion ? { pathLength: 1, opacity: 0.34 } : { pathLength: 1, opacity: [0.14, 0.62, 0.14] }}
                transition={
                  reduceMotion
                    ? { duration: 0.8, ease: 'easeOut' }
                    : { duration: 6 + index * 0.5, delay: index * 0.32, repeat: Infinity, ease: 'easeInOut' }
                }
              />
              <motion.path
                d={route}
                fill="none"
                stroke="rgba(210,255,236,0.82)"
                strokeWidth="2.2"
                strokeLinecap="round"
                pathLength={0.11}
                initial={{ pathOffset: 1, opacity: 0 }}
                animate={reduceMotion ? { pathOffset: 0.2, opacity: 0.22 } : { pathOffset: [1, 0.22, 0], opacity: [0, 1, 0] }}
                transition={
                  reduceMotion
                    ? { duration: 0.8, ease: 'easeOut' }
                    : { duration: 4.6 + index * 0.35, delay: 0.3 + index * 0.28, repeat: Infinity, ease: 'easeInOut' }
                }
              />
            </g>
          ))}
        </g>

        <g>
          {pulseNodes.map((node, index) => (
            <g key={`${node.x}-${node.y}`}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.major ? 20 : 12}
                fill={node.major ? 'rgba(77,163,255,0.14)' : 'rgba(52,211,153,0.08)'}
                animate={reduceMotion ? undefined : { opacity: [0.08, node.major ? 0.24 : 0.14, 0.08], scale: [1, 1.24, 1] }}
                transition={reduceMotion ? undefined : { duration: node.major ? 4 : 5.4, delay: index * 0.22, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.major ? 3.8 : 2.6}
                fill={node.major ? 'rgba(210,238,255,0.94)' : 'rgba(210,255,236,0.72)'}
                animate={reduceMotion ? undefined : { opacity: [0.42, 1, 0.42] }}
                transition={reduceMotion ? undefined : { duration: 3.2 + index * 0.18, repeat: Infinity, ease: 'easeInOut' }}
              />
            </g>
          ))}
        </g>
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-[44%] rounded-b-[2rem] bg-[linear-gradient(to_top,rgba(3,9,15,0.98),rgba(3,9,15,0.38),transparent)]" />

      <div className="relative flex h-full flex-col justify-between p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-200 backdrop-blur-md">
            Global Coordination Layer
          </div>
          <div className="rounded-full border border-signal/20 bg-signal/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-signal2 backdrop-blur-md">
            Live network
          </div>
        </div>

        <div className="ml-auto mt-auto flex w-full max-w-[30rem] flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {metricCards(stats).map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/28 px-4 py-4 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-2 font-[var(--font-serif)] text-2xl leading-none text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/26 p-4 backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Active regions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeRegions.map((region) => (
                <div key={region.name} className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white">
                  <span className="uppercase tracking-[0.14em] text-slate-300">{region.name}</span>
                  <span className="ml-2 text-signal2">{region.eventCount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
