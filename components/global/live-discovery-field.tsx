'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import landData from 'world-atlas/land-110m.json';
import { EventCoverMedia } from '@/components/event-cover-media';
import type { EventItem } from '@/lib/data/events';
import type { RegionCoverage } from '@/lib/utils/coverage';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

interface LiveDiscoveryFieldProps {
  events: EventItem[];
  regions: RegionCoverage[];
}

const WIDTH = 1180;
const HEIGHT = 760;

const landFeature = feature((landData as any), (landData as any).objects.land) as any;
const projection = geoNaturalEarth1().fitExtent(
  [
    [74, 94],
    [WIDTH - 70, HEIGHT - 126]
  ],
  landFeature
);
const pathGenerator = geoPath(projection);
const landPath = pathGenerator(landFeature) ?? '';

const macroPositions = {
  'North America': { x: 272, y: 312 },
  Europe: { x: 562, y: 254 },
  'Middle East': { x: 666, y: 328 },
  'Asia-Pacific': { x: 874, y: 372 }
} as const;

function mapEventToMacroRegion(region: string) {
  const normalized = region.toLowerCase();

  if (normalized.includes('north america') || normalized.includes('usa') || normalized.includes('canada')) {
    return 'North America' as const;
  }

  if (normalized.includes('middle east')) {
    return 'Middle East' as const;
  }

  if (normalized.includes('asia') || normalized.includes('pacific')) {
    return 'Asia-Pacific' as const;
  }

  return 'Europe' as const;
}

export function LiveDiscoveryField({ events, regions }: LiveDiscoveryFieldProps) {
  const reduceMotion = useReducedMotion();

  const nodes = events.slice(0, 4).map((event, index) => {
    const macro = mapEventToMacroRegion(event.region);
    const base = macroPositions[macro];
    const offsetX = index % 2 === 0 ? -18 + index * 8 : 22 - index * 6;
    const offsetY = index % 2 === 0 ? -10 + index * 10 : 18 - index * 4;

    return {
      event,
      x: base.x + offsetX,
      y: base.y + offsetY,
      macro
    };
  });

  const regionBadges = regions.filter((region) => region.eventCount > 0);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="relative overflow-hidden rounded-[2.8rem] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_50%,#f6fbff_100%)] p-5 shadow-[0_44px_110px_-60px_rgba(22,104,255,0.2)] sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(22,104,255,0.12),transparent_22%),radial-gradient(circle_at_84%_18%,rgba(20,184,255,0.1),transparent_18%),radial-gradient(circle_at_76%_84%,rgba(100,91,255,0.08),transparent_18%)]" />
        <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.12]" />

        <div className="relative">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-700">Live global signal</p>
              <p className="mt-2 text-sm text-slate-600">Active regions and highlighted events moving across the network.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {regionBadges.map((region) => (
                <span key={region.name} className="global-chip">
                  {region.name}
                </span>
              ))}
            </div>
          </div>

          <div className="relative h-[25rem] overflow-hidden rounded-[2.2rem] border border-white/80 bg-white/55 sm:h-[28rem]">
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="discovery-land-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(22,104,255,0.04)" />
                  <stop offset="50%" stopColor="rgba(22,104,255,0.16)" />
                  <stop offset="100%" stopColor="rgba(20,184,255,0.1)" />
                </linearGradient>
              </defs>

              <path d={landPath} fill="rgba(255,255,255,0.46)" stroke="url(#discovery-land-stroke)" strokeWidth="0.85" opacity="0.94" />

              {regionBadges.map((region, index) => {
                const point = macroPositions[region.name];
                return (
                  <g key={region.name}>
                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r={34 + region.eventCount * 3}
                      fill="rgba(22,104,255,0.06)"
                      animate={reduceMotion ? undefined : { opacity: [0.18, 0.36, 0.18], scale: [1, 1.18, 1] }}
                      transition={reduceMotion ? undefined : { duration: 4.4 + index * 0.25, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <circle cx={point.x} cy={point.y} r="5" fill="rgba(22,104,255,0.95)" />
                  </g>
                );
              })}

              {nodes.map((node, index) => (
                <g key={node.event.id}>
                  <path
                    d={`M ${macroPositions.Europe.x} ${macroPositions.Europe.y} Q ${(macroPositions.Europe.x + node.x) / 2} ${((macroPositions.Europe.y + node.y) / 2) - 46} ${node.x} ${node.y}`}
                    fill="none"
                    stroke="rgba(20,184,255,0.28)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r="14"
                    fill="rgba(20,184,255,0.14)"
                    animate={reduceMotion ? undefined : { opacity: [0.12, 0.32, 0.12], scale: [1, 1.4, 1] }}
                    transition={reduceMotion ? undefined : { duration: 3.2 + index * 0.22, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <circle cx={node.x} cy={node.y} r="4.5" fill="rgba(20,184,255,0.92)" />
                </g>
              ))}
            </svg>

            {nodes.slice(0, 3).map((node, index) => (
              <motion.div
                key={node.event.id}
                className="absolute hidden w-[15rem] rounded-[1.5rem] border border-white/85 bg-white/92 p-3 shadow-[0_24px_54px_-34px_rgba(15,23,42,0.18)] backdrop-blur lg:block"
                style={{
                  left: `${18 + index * 24}%`,
                  top: `${index % 2 === 0 ? 14 + index * 12 : 44 - index * 6}%`
                }}
                animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={reduceMotion ? undefined : { duration: 5 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{node.event.city}</p>
                <p className="mt-2 text-sm font-semibold leading-tight text-slate-950">{node.event.title}</p>
                <p className="mt-2 text-xs text-slate-600">{formatEventDate(node.event)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {nodes.map((node, index) => (
          <motion.div
            key={node.event.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.42, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={`/events/${getEventSlug(node.event)}`}
              className="group relative overflow-hidden rounded-[2.1rem] border border-white/80 bg-white p-4 shadow-[0_28px_64px_-40px_rgba(15,23,42,0.16)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_38px_80px_-42px_rgba(22,104,255,0.18)] sm:p-5"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(22,104,255,0.07),transparent_22%),radial-gradient(circle_at_84%_18%,rgba(20,184,255,0.06),transparent_18%)]" />
              <div className="relative grid gap-4 sm:grid-cols-[8.8rem_minmax(0,1fr)]">
                <EventCoverMedia
                  title={node.event.title}
                  city={node.event.city}
                  country={node.event.country}
                  region={node.event.region}
                  category={node.event.category}
                  coverImage={node.event.coverImage}
                  coverImageAlt={node.event.coverImageAlt}
                  associationName={node.event.association ?? node.event.organiser}
                  featured={node.event.featured}
                  compact
                  className="h-[12rem]"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="city-chip">{node.macro}</span>
                    <span className="global-chip">{node.event.category}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold leading-tight text-slate-950 transition-colors duration-300 group-hover:text-blue-700">
                    {node.event.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-blue-700">{formatEventDate(node.event)}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {node.event.city}, {node.event.country}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
