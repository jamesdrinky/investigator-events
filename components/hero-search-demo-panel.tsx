'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { useEffect, useMemo, useState } from 'react';
import landData from 'world-atlas/land-110m.json';
import { EventCoverMedia } from '@/components/event-cover-media';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

interface HeroSearchDemoPanelProps {
  demos: Array<{
    query: string;
    event: EventItem;
  }>;
}

const WIDTH = 1060;
const HEIGHT = 760;

const landFeature = feature((landData as any), (landData as any).objects.land) as any;
const projection = geoNaturalEarth1().fitExtent(
  [
    [66, 96],
    [WIDTH - 58, HEIGHT - 116]
  ],
  landFeature
);
const pathGenerator = geoPath(projection);
const landPath = pathGenerator(landFeature) ?? '';

const cityCoordinates: Record<string, [number, number]> = {
  'new york': [-74.006, 40.7128],
  london: [-0.1276, 51.5072],
  munich: [11.582, 48.1351],
  paris: [2.3522, 48.8566],
  dubai: [55.2708, 25.2048],
  singapore: [103.8198, 1.3521],
  sydney: [151.2093, -33.8688],
  prague: [14.4378, 50.0755],
  venice: [12.3155, 45.4408],
  cannes: [7.0174, 43.5528],
  orlando: [-81.3792, 28.5383],
  philadelphia: [-75.1652, 39.9526],
  'san jose': [-121.8863, 37.3382],
  'new delhi': [77.1025, 28.7041]
};

function projectPoint([lon, lat]: [number, number]) {
  const point = projection([lon, lat]);
  return point ? { x: point[0], y: point[1] } : { x: 0, y: 0 };
}

function getCityPoint(city: string, index: number) {
  const normalized = city.trim().toLowerCase();
  const direct = cityCoordinates[normalized];

  if (direct) {
    return projectPoint(direct);
  }

  const fallbackPoints = [
    projectPoint([-74.006, 40.7128]),
    projectPoint([-0.1276, 51.5072]),
    projectPoint([55.2708, 25.2048]),
    projectPoint([103.8198, 1.3521])
  ];

  return fallbackPoints[index % fallbackPoints.length];
}

export function HeroSearchDemoPanel({ demos }: HeroSearchDemoPanelProps) {
  const reduceMotion = useReducedMotion();
  const [demoIndex, setDemoIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const rotateX = useSpring(0, { stiffness: 150, damping: 18, mass: 0.45 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 18, mass: 0.45 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const reflectiveGlow = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.72), rgba(255,255,255,0) 34%)`;

  const activeDemo = demos.length > 0 ? demos[demoIndex % demos.length] : null;
  const typedQuery = activeDemo?.query.slice(0, typedLength) ?? '';

  useEffect(() => {
    if (!activeDemo || demos.length === 0) {
      return;
    }

    if (typedLength < activeDemo.query.length) {
      const timeout = window.setTimeout(() => setTypedLength((length) => length + 1), 34);
      return () => window.clearTimeout(timeout);
    }

    if (!showResult) {
      const timeout = window.setTimeout(() => setShowResult(true), 180);
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setShowResult(false);
      setTypedLength(0);
      setDemoIndex((index) => (index + 1) % demos.length);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [activeDemo, demos.length, showResult, typedLength]);

  const networkPoints = useMemo(
    () =>
      demos.map((demo, index) => ({
        ...getCityPoint(demo.event.city, index),
        label: demo.event.city
      })),
    [demos]
  );

  const routePairs = useMemo(
    () =>
      networkPoints.slice(0, -1).map((point, index) => {
        const next = networkPoints[index + 1];
        const midX = (point.x + next.x) / 2;
        const midY = (point.y + next.y) / 2;

        return {
          id: `${point.label}-${next.label}`,
          d: `M ${point.x} ${point.y} Q ${midX} ${midY - 76 + index * 10} ${next.x} ${next.y}`
        };
      }),
    [networkPoints]
  );

  if (!activeDemo) {
    return null;
  }

  return (
    <div className="relative min-h-[34rem] sm:min-h-[38rem]">
      <motion.div
        className="absolute inset-0 rounded-[2.6rem]"
        animate={
          reduceMotion
            ? undefined
            : {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }
        }
        transition={reduceMotion ? undefined : { duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle at 18% 20%, rgba(22,104,255,0.16), transparent 26%), radial-gradient(circle at 82% 18%, rgba(20,184,255,0.14), transparent 24%), radial-gradient(circle at 76% 78%, rgba(100,91,255,0.12), transparent 22%), linear-gradient(180deg, #ffffff 0%, #f3f8ff 46%, #eef7ff 100%)',
          backgroundSize: '160% 160%'
        }}
      />

      <div className="absolute inset-0 overflow-hidden rounded-[2.6rem] border border-[#d9e7fb] shadow-[0_44px_110px_-62px_rgba(22,104,255,0.28)]">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="hero-land-stroke-crisp" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(22,104,255,0.12)" />
              <stop offset="50%" stopColor="rgba(22,104,255,0.3)" />
              <stop offset="100%" stopColor="rgba(20,184,255,0.18)" />
            </linearGradient>
            <linearGradient id="hero-route-crisp" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(22,104,255,0.2)" />
              <stop offset="50%" stopColor="rgba(20,184,255,0.74)" />
              <stop offset="100%" stopColor="rgba(100,91,255,0.28)" />
            </linearGradient>
          </defs>

          <path d={landPath} fill="rgba(255,255,255,0.76)" stroke="url(#hero-land-stroke-crisp)" strokeWidth="1" opacity="1" />

          <g fill="none" stroke="rgba(191,219,254,0.55)" strokeWidth="0.55">
            <ellipse cx="530" cy="382" rx="378" ry="160" />
            <ellipse cx="530" cy="382" rx="324" ry="132" />
            <path d="M152 382H908" />
          </g>

          {Array.from({ length: 160 }).map((_, index) => {
            const x = 80 + ((index * 61) % 900);
            const y = 108 + ((index * 43) % 520);

            return <circle key={index} cx={x} cy={y} r="1.2" fill="rgba(148,163,184,0.36)" />;
          })}

          {routePairs.map((route, index) => (
            <g key={route.id}>
              <path d={route.d} fill="none" stroke="url(#hero-route-crisp)" strokeWidth="2.3" opacity="0.72" strokeLinecap="round" />
              <motion.path
                d={route.d}
                fill="none"
                stroke="rgba(255,255,255,0.98)"
                strokeWidth="4.6"
                strokeLinecap="round"
                pathLength={0.16}
                initial={{ pathOffset: 1, opacity: 0 }}
                animate={
                  reduceMotion ? { pathOffset: 0.2, opacity: 0.34 } : { pathOffset: [1, 0.2, 0], opacity: [0, 0.95, 0] }
                }
                transition={
                  reduceMotion
                    ? { duration: 1, ease: 'easeOut' }
                    : { duration: 4 + index * 0.45, delay: index * 0.22, repeat: Infinity, ease: 'easeInOut' }
                }
              />
            </g>
          ))}

          {networkPoints.map((point, index) => (
            <g key={`${point.label}-${index}`}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="16"
                fill="rgba(22,104,255,0.16)"
                animate={reduceMotion ? undefined : { opacity: [0.22, 0.46, 0.22], scale: [1, 1.32, 1] }}
                transition={reduceMotion ? undefined : { duration: 3.2 + index * 0.18, repeat: Infinity, ease: 'easeInOut' }}
              />
              <circle cx={point.x} cy={point.y} r="5.2" fill="rgba(22,104,255,0.98)" />
              <circle cx={point.x} cy={point.y} r="9.2" fill="none" stroke="rgba(20,184,255,0.72)" strokeWidth="1.4" />
            </g>
          ))}
        </svg>
      </div>

      <div className="relative z-10 flex h-full min-h-[34rem] flex-col justify-between p-4 sm:min-h-[38rem] sm:p-6">
        <div className="max-w-[21rem] rounded-[1.8rem] border border-[#d7e4f7] bg-white px-4 py-4 shadow-[0_24px_54px_-38px_rgba(15,23,42,0.16)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-700">Search demo</p>
          <div className="mt-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.85)]">
            <span className="text-sm text-slate-400">Search</span>
            <span className="ml-3 min-h-[1.5rem] text-sm font-medium text-slate-800">
              {typedQuery}
              <motion.span
                className="ml-0.5 inline-block h-4 w-px bg-slate-500 align-middle"
                animate={reduceMotion ? undefined : { opacity: [1, 0, 1] }}
                transition={reduceMotion ? undefined : { duration: 0.9, repeat: Infinity }}
              />
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <AnimatePresence mode="wait">
            {showResult ? (
              <motion.div
                key={activeDemo.query}
                initial={{ opacity: 0, y: 36, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.985 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[31rem]"
                onMouseMove={(event) => {
                  if (reduceMotion) {
                    return;
                  }

                  const rect = event.currentTarget.getBoundingClientRect();
                  const x = (event.clientX - rect.left) / rect.width;
                  const y = (event.clientY - rect.top) / rect.height;

                  rotateY.set((x - 0.5) * 8);
                  rotateX.set((0.5 - y) * 8);
                  glowX.set(x * 100);
                  glowY.set(y * 100);
                }}
                onMouseLeave={() => {
                  rotateX.set(0);
                  rotateY.set(0);
                  glowX.set(50);
                  glowY.set(50);
                }}
              >
                <motion.div
                  style={{
                    rotateX: reduceMotion ? 0 : rotateX,
                    rotateY: reduceMotion ? 0 : rotateY,
                    transformStyle: 'preserve-3d'
                  }}
                  animate={reduceMotion ? { y: [0, -6, 0] } : { y: [0, -8, 0] }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative rounded-[2.3rem] border border-[#dbe7f7] bg-white p-4 shadow-[0_42px_96px_-50px_rgba(15,23,42,0.28)] sm:p-5"
                >
                  <motion.div className="pointer-events-none absolute inset-0 rounded-[2.3rem]" style={{ background: reflectiveGlow, opacity: 0.34 }} />

                  <div className="relative space-y-4">
                    <div style={{ transform: 'translateZ(16px)' }}>
                      <EventCoverMedia
                        title={activeDemo.event.title}
                        city={activeDemo.event.city}
                        country={activeDemo.event.country}
                        region={activeDemo.event.region}
                        category={activeDemo.event.category}
                        coverImage={activeDemo.event.coverImage}
                        coverImageAlt={activeDemo.event.coverImageAlt}
                        associationName={activeDemo.event.association ?? activeDemo.event.organiser}
                        featured={activeDemo.event.featured}
                        compact
                        className="h-[16.5rem]"
                      />
                    </div>

                    <div className="space-y-3" style={{ transform: 'translateZ(24px)' }}>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                          {activeDemo.event.category}
                        </span>
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                          {activeDemo.event.region}
                        </span>
                      </div>
                      <h3 className="font-[var(--font-serif)] text-[2rem] leading-[0.94] text-slate-950 sm:text-[2.35rem]">
                        {activeDemo.event.title}
                      </h3>
                      <p className="text-sm font-medium uppercase tracking-[0.16em] text-blue-700">
                        {formatEventDate(activeDemo.event)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {activeDemo.event.city}, {activeDemo.event.country}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3" style={{ transform: 'translateZ(30px)' }}>
                      <Link href={`/events/${getEventSlug(activeDemo.event)}`} className="btn-primary px-5 py-2.5">
                        Open event
                      </Link>
                      <Link href="/calendar" className="btn-secondary px-5 py-2.5">
                        View all results
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 12, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-[31rem] rounded-[2rem] border border-dashed border-[#dbe7f7] bg-white px-8 py-10 text-center text-sm text-slate-500"
              >
                Preparing next event result...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
