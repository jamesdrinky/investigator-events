'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { motion, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import landData from 'world-atlas/land-110m.json';
import type { EventItem } from '@/lib/data/events';
import { AssociationLogoBadge } from '@/components/association-logo-badge';
import { getAssociationBrandLogoSrc, getAssociationDisplayName } from '@/lib/utils/association-branding';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

interface HomepageHeroProps {
  events: EventItem[];
  stats: Array<{ label: string; value: string | number }>;
}

interface GlobePoint {
  lat: number;
  lon: number;
}

interface GlobeEventNode extends GlobePoint {
  id: string;
  title: string;
  city: string;
  country: string;
  date: string;
  associationName?: string;
  coverImage?: string;
}

const CITY_COORDINATES: Record<string, GlobePoint> = {
  amsterdam: { lat: 52.3676, lon: 4.9041 },
  athens: { lat: 37.9838, lon: 23.7275 },
  bangkok: { lat: 13.7563, lon: 100.5018 },
  barcelona: { lat: 41.3874, lon: 2.1686 },
  berlin: { lat: 52.52, lon: 13.405 },
  birmingham: { lat: 52.4862, lon: -1.8904 },
  brussels: { lat: 50.8503, lon: 4.3517 },
  chicago: { lat: 41.8781, lon: -87.6298 },
  copenhagen: { lat: 55.6761, lon: 12.5683 },
  dallas: { lat: 32.7767, lon: -96.797 },
  denver: { lat: 39.7392, lon: -104.9903 },
  doha: { lat: 25.2854, lon: 51.531 },
  dubai: { lat: 25.2048, lon: 55.2708 },
  dublin: { lat: 53.3498, lon: -6.2603 },
  frankfurt: { lat: 50.1109, lon: 8.6821 },
  geneva: { lat: 46.2044, lon: 6.1432 },
  'hong kong': { lat: 22.3193, lon: 114.1694 },
  houston: { lat: 29.7604, lon: -95.3698 },
  'las vegas': { lat: 36.1699, lon: -115.1398 },
  lisbon: { lat: 38.7223, lon: -9.1393 },
  london: { lat: 51.5072, lon: -0.1276 },
  'los angeles': { lat: 34.0522, lon: -118.2437 },
  madrid: { lat: 40.4168, lon: -3.7038 },
  manchester: { lat: 53.4808, lon: -2.2426 },
  melbourne: { lat: -37.8136, lon: 144.9631 },
  'mexico city': { lat: 19.4326, lon: -99.1332 },
  miami: { lat: 25.7617, lon: -80.1918 },
  milan: { lat: 45.4642, lon: 9.19 },
  montreal: { lat: 45.5017, lon: -73.5673 },
  munich: { lat: 48.1351, lon: 11.582 },
  'new york': { lat: 40.7128, lon: -74.006 },
  paris: { lat: 48.8566, lon: 2.3522 },
  prague: { lat: 50.0755, lon: 14.4378 },
  rome: { lat: 41.9028, lon: 12.4964 },
  'san francisco': { lat: 37.7749, lon: -122.4194 },
  seattle: { lat: 47.6062, lon: -122.3321 },
  seoul: { lat: 37.5665, lon: 126.978 },
  singapore: { lat: 1.3521, lon: 103.8198 },
  stockholm: { lat: 59.3293, lon: 18.0686 },
  sydney: { lat: -33.8688, lon: 151.2093 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  toronto: { lat: 43.6532, lon: -79.3832 },
  vienna: { lat: 48.2082, lon: 16.3738 },
  warsaw: { lat: 52.2297, lon: 21.0122 },
  washington: { lat: 38.9072, lon: -77.0369 },
  zurich: { lat: 47.3769, lon: 8.5417 }
};

const COUNTRY_COORDINATES: Record<string, GlobePoint> = {
  Australia: { lat: -25.2744, lon: 133.7751 },
  Austria: { lat: 47.5162, lon: 14.5501 },
  Belgium: { lat: 50.5039, lon: 4.4699 },
  Canada: { lat: 56.1304, lon: -106.3468 },
  Denmark: { lat: 56.2639, lon: 9.5018 },
  France: { lat: 46.2276, lon: 2.2137 },
  Germany: { lat: 51.1657, lon: 10.4515 },
  Ireland: { lat: 53.1424, lon: -7.6921 },
  Italy: { lat: 41.8719, lon: 12.5674 },
  Japan: { lat: 36.2048, lon: 138.2529 },
  Mexico: { lat: 23.6345, lon: -102.5528 },
  Netherlands: { lat: 52.1326, lon: 5.2913 },
  Portugal: { lat: 39.3999, lon: -8.2245 },
  Qatar: { lat: 25.3548, lon: 51.1839 },
  'Saudi Arabia': { lat: 23.8859, lon: 45.0792 },
  Singapore: { lat: 1.3521, lon: 103.8198 },
  Spain: { lat: 40.4637, lon: -3.7492 },
  Sweden: { lat: 60.1282, lon: 18.6435 },
  Switzerland: { lat: 46.8182, lon: 8.2275 },
  'United Arab Emirates': { lat: 23.4241, lon: 53.8478 },
  'United Kingdom': { lat: 55.3781, lon: -3.436 },
  'United States': { lat: 39.8283, lon: -98.5795 }
};

const REGION_COORDINATES: Record<string, GlobePoint> = {
  'Asia-Pacific': { lat: 7, lon: 114 },
  Europe: { lat: 50, lon: 12 },
  'Middle East': { lat: 24, lon: 46 },
  'North America': { lat: 39, lon: -98 }
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function safeCoverImage(coverImage?: string) {
  return coverImage && /^(\/(cities|events|images|associations)\/|https?:\/\/)/.test(coverImage) ? coverImage : undefined;
}

function getEventCoordinate(event: EventItem): GlobePoint {
  const cityMatch = CITY_COORDINATES[normalizeKey(event.city)];
  if (cityMatch) {
    return cityMatch;
  }

  const countryMatch = COUNTRY_COORDINATES[event.country];
  if (countryMatch) {
    return countryMatch;
  }

  return REGION_COORDINATES[event.region] ?? { lat: 18, lon: 18 };
}


function projectPoint(point: GlobePoint, rotation: number, radiusX: number, radiusY: number) {
  const lat = (point.lat * Math.PI) / 180;
  const lon = (point.lon * Math.PI) / 180 + rotation;
  const x = Math.cos(lat) * Math.sin(lon);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.cos(lon);

  return {
    x: x * radiusX,
    y: y * radiusY,
    z
  };
}

function buildArcPath(from: ReturnType<typeof projectPoint>, to: ReturnType<typeof projectPoint>) {
  const curve = Math.max(24, 84 - Math.abs(from.x - to.x) * 0.12);
  const controlX = (from.x + to.x) / 2;
  const controlY = Math.min(from.y, to.y) - curve;
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

function HeroEventCard({
  event,
  className,
  delay,
  compact = false
}: {
  event: GlobeEventNode;
  className: string;
  delay: number;
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      className={`pointer-events-auto absolute overflow-hidden rounded-[1.8rem] border border-slate-200/70 bg-[linear-gradient(155deg,rgba(255,255,255,0.88),rgba(241,245,255,0.82))] shadow-[0_22px_56px_-38px_rgba(15,23,42,0.18)] backdrop-blur-xl will-change-transform ${className}`}
      initial={false}
      animate={
        reducedMotion ? undefined : { y: [0, compact ? -4 : -6, 0], rotateZ: [0, compact ? -0.45 : -0.6, 0, compact ? 0.35 : 0.45, 0] }
      }
      transition={reducedMotion ? undefined : { duration: 11 + delay * 4, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className={`relative ${compact ? 'min-h-[9.5rem] max-h-[12rem] overflow-hidden' : 'flex min-h-[12.5rem] flex-col'}`}>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(14,165,233,0.1),transparent_22%),radial-gradient(circle_at_84%_80%,rgba(99,102,241,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.9))]"
          style={{ backgroundSize: '140% 140%' }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0)_18%,rgba(255,255,255,0.22)_38%,rgba(255,255,255,0.06)_52%,rgba(255,255,255,0)_72%)] opacity-60"
          animate={reducedMotion ? undefined : { x: ['-16%', '84%'] }}
          transition={{ duration: 4.8, delay: 1.2 + delay, repeat: Infinity, repeatDelay: 7.5, ease: 'easeInOut' }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[1.8rem] ring-1 ring-white/55" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.2),rgba(255,255,255,0)_34%,rgba(255,255,255,0.08)_58%,rgba(255,255,255,0)_76%)] opacity-75" />

        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          <div className="min-w-0 rounded-full border border-slate-200/80 bg-white/78 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur-md">
            {compact ? 'Live event' : 'Featured event'}
          </div>
          <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
            {(() => {
              const logoSrc = event.associationName ? getAssociationBrandLogoSrc(event.associationName) : null;
              const isAbiAssociation =
                Boolean(event.associationName && /association of british investigators|\babi\b/i.test(event.associationName)) ||
                Boolean(logoSrc?.includes('/abi.png'));
              return logoSrc ? (
                <div className="flex items-center justify-center rounded-md border border-white/70 bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm">
                  {isAbiAssociation ? (
                    <span className="text-[11px] font-semibold tracking-[0.16em] text-slate-950">ABI</span>
                  ) : (
                    <img
                      src={logoSrc}
                      alt={event.associationName ?? ''}
                      className="h-6 sm:h-7 w-auto max-w-[4.5rem] object-contain"
                    />
                  )}
                </div>
              ) : (
                null
              );
            })()}
          </div>
        </div>

        <motion.div
          className={compact ? 'absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5' : 'mt-auto z-10 px-5 pb-5'}
          animate={reducedMotion ? undefined : { y: [0, -1.5, 0] }}
          transition={{ duration: 10 + delay * 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex min-w-0 flex-col gap-1.5 pt-3">
            <p
              className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {event.associationName ? getAssociationDisplayName(event.associationName) : 'Featured event'}
            </p>
            <p
              className={`min-w-0 font-semibold leading-[1.08] tracking-[-0.03em] text-slate-950 ${compact ? 'line-clamp-2 text-[0.96rem]' : 'max-w-[14rem] text-[1.04rem]'}`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {event.title}
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium text-slate-600">
              <p className="font-semibold uppercase tracking-[0.15em] text-blue-700">{event.date}</p>
              <span className="text-slate-300">•</span>
              <p
                className="min-w-0"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {event.city}, {event.country}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
}

export function HomepageHero({ events, stats }: HomepageHeroProps) {
  const reducedMotion = useReducedMotion();
  const [rotation, setRotation] = useState(0.45);
  const rotateX = useSpring(0, { stiffness: 90, damping: 22, mass: 0.9 });
  const rotateY = useSpring(0, { stiffness: 90, damping: 22, mass: 0.9 });

  const globeEvents = useMemo<GlobeEventNode[]>(
    () =>
      events.slice(0, 4).map((event) => {
        const coordinate = getEventCoordinate(event);

        return {
          id: event.id,
          title: event.title,
          city: event.city,
          country: event.country,
          date: formatEventDate(event),
          associationName: event.association ?? event.organiser,
          coverImage: event.coverImage,
          ...coordinate
        };
      }),
    [events]
  );

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    let frame = 0;
    let last = performance.now();

    const animate = (now: number) => {
      const delta = now - last;
      last = now;
      setRotation((current) => (current + delta * 0.00018) % (Math.PI * 2));
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const projectedNodes = useMemo(
    () =>
      globeEvents.map((event) => {
        const projection = projectPoint(event, rotation, 178, 204);
        return {
          ...event,
          ...projection
        };
      }),
    [globeEvents, rotation]
  );

  const routePaths = useMemo(() => {
    if (projectedNodes.length < 2) {
      return [];
    }

    return projectedNodes.slice(0, -1).map((node, index) => {
      const next = projectedNodes[index + 1];
      return {
        id: `${node.id}-${next.id}`,
        d: buildArcPath(node, next),
        opacity: Math.max(0.2, (node.z + next.z + 2) / 4)
      };
    });
  }, [projectedNodes]);

  const landFeature = useMemo(() => feature(landData as any, (landData as any).objects.land) as any, []);

  const projection = useMemo(
    () =>
      geoOrthographic()
        .scale(188)
        .translate([0, 0])
        .rotate([rotation * (180 / Math.PI), -15, 0])
        .clipAngle(90),
    [rotation]
  );

  const pathGen = useMemo(() => geoPath(projection), [projection]);
  const landPath = useMemo(() => pathGen(landFeature) ?? '', [pathGen, landFeature]);
  const graticulePath = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { geoGraticule } = require('d3-geo');
    return pathGen(geoGraticule()()) ?? '';
  }, [pathGen]);

  return (
    <section className="relative overflow-hidden pb-14 pt-2 sm:pb-24 sm:pt-10 lg:pb-28 lg:pt-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(33,118,255,0.26),transparent_22%),radial-gradient(circle_at_88%_14%,rgba(0,196,255,0.22),transparent_18%),radial-gradient(circle_at_56%_62%,rgba(111,86,255,0.18),transparent_30%),radial-gradient(circle_at_82%_42%,rgba(236,72,153,0.1),transparent_24%),linear-gradient(180deg,#fbfdff_0%,#f4f8ff_46%,#f8fbff_100%)]"
        style={{ backgroundSize: '140% 140%' }}
      />
      <div className="container-shell relative">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-14">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-[36rem]"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/86 px-3 py-1.5 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_0_8px_rgba(34,211,238,0.12)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-700">Private Investigator Events Calendar</span>
            </div>

            <motion.h1
              className="mt-5 max-w-[10ch] text-[2.9rem] font-semibold leading-[0.88] tracking-[-0.065em] text-slate-950 sm:mt-6 sm:text-6xl lg:mt-8 lg:text-[5.6rem]"
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="block">
                <motion.span
                  className="inline-block bg-[linear-gradient(92deg,#155eef_0%,#10b8ff_34%,#7c3aed_72%,#ec4899_100%)] bg-[length:180%_100%] bg-clip-text text-transparent will-change-transform"
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          y: [0, -2, 0]
                        }
                  }
                  transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Never
                </motion.span>{' '}
                <span className="text-slate-950">Miss Another</span>
              </span>
              <span className="mt-1.5 block max-w-[10ch] font-semibold leading-[0.88] tracking-[-0.065em] text-slate-950">
                Investigator
              </span>
              <span className="block font-semibold leading-[0.88] tracking-[-0.065em] text-slate-950">
                Event
              </span>
            </motion.h1>

            <motion.p
              className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-slate-600 sm:mt-6 sm:text-lg"
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            >
              Every confirmed conference, AGM, and training event for private investigators — free to browse, free to list.
            </motion.p>

            <motion.div
              className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row"
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/calendar" className="btn-primary min-h-[3.5rem] px-7 text-[15px]">
                Browse PI Events
              </Link>
              <Link href={"/list-your-event" as Route} className="btn-secondary min-h-[3.5rem] px-7 text-[15px]">
                List Your Event Free
              </Link>
            </motion.div>

            <motion.div
              className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3"
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              {stats.map((item) => (
                <motion.div
                  key={item.label}
                  className="rounded-[1.35rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(244,248,255,0.72))] px-3.5 py-3 shadow-[0_26px_72px_-44px_rgba(15,23,42,0.18)] backdrop-blur-xl last:col-span-2 sm:rounded-[1.7rem] sm:px-4 sm:py-4 sm:last:col-span-1"
                  whileHover={{ boxShadow: '0 34px 84px -46px rgba(76,90,255,0.22)' }}
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-[10px] sm:tracking-[0.2em]">{item.label}</p>
                  <p className="mt-1.5 text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-950 sm:mt-2 sm:text-2xl">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-[24rem] lg:max-w-none"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="relative mx-auto aspect-[1/1.02] w-full max-w-[24rem] sm:aspect-[1.05/1] sm:max-w-[46rem]"
              onPointerMove={(event) => {
                if (reducedMotion) return;
                const bounds = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width;
                const y = (event.clientY - bounds.top) / bounds.height;
                rotateY.set((x - 0.5) * 4.25);
                rotateX.set((0.5 - y) * 3.5);
              }}
              onPointerLeave={() => {
                rotateX.set(0);
                rotateY.set(0);
              }}
              style={{
                perspective: 1600,
                rotateX: reducedMotion ? 0 : rotateX,
                rotateY: reducedMotion ? 0 : rotateY,
                transformStyle: 'preserve-3d'
              }}
            >
              <motion.div
                className="absolute inset-[10%] rounded-[3rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.84),rgba(241,247,255,0.36))] shadow-[0_52px_162px_-64px_rgba(49,66,180,0.46)] backdrop-blur-2xl"
                animate={reducedMotion ? undefined : { y: [0, -4, 0, 2, 0], rotateZ: [0, 0.2, 0, -0.12, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              />

              <svg viewBox="-300 -270 600 540" className="absolute inset-0 h-full w-full overflow-visible">
                <defs>
                  <radialGradient id="hero-globe-shell" cx="50%" cy="42%" r="70%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.96)" />
                    <stop offset="58%" stopColor="rgba(226,240,255,0.86)" />
                    <stop offset="100%" stopColor="rgba(199,223,255,0.26)" />
                  </radialGradient>
                  <radialGradient id="hero-node-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f0abfc" />
                    <stop offset="45%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="rgba(129,140,248,0)" />
                  </radialGradient>
                  <linearGradient id="hero-route-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="45%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#e879f9" />
                  </linearGradient>
                  <linearGradient id="continent-gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#155eef" />
                    <stop offset="25%" stopColor="#10b8ff" />
                    <stop offset="50%" stopColor="#7c3aed" />
                    <stop offset="75%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#155eef" />
                    <animateTransform attributeName="gradientTransform" type="translate" from="-600 0" to="600 0" dur="5.4s" repeatCount="indefinite" />
                  </linearGradient>
                </defs>

                <ellipse cx="0" cy="204" rx="164" ry="28" fill="rgba(76,127,255,0.12)" />
                <ellipse cx="0" cy="204" rx="132" ry="18" fill="rgba(125,211,252,0.12)" />
                <circle cx="0" cy="0" r="190" fill="url(#hero-globe-shell)" opacity="0.82" />
                <circle cx="0" cy="0" r="190" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.6" />

                <path d={landPath} fill="url(#continent-gradient)" opacity="0.15" />
                <path d={landPath} fill="url(#continent-gradient)" opacity="0.9" />
                <path d={graticulePath} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />

                {routePaths.map((route) => (
                  <g key={route.id} opacity={route.opacity}>
                    <path d={route.d} fill="none" stroke="rgba(95,135,255,0.16)" strokeWidth="4.4" strokeLinecap="round" />
                    <motion.path
                      d={route.d}
                      fill="none"
                      stroke="url(#hero-route-stroke)"
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeDasharray="10 14"
                      animate={reducedMotion ? undefined : { strokeDashoffset: [0, -96] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    />
                  </g>
                ))}

                {projectedNodes.map((node, index) => (
                  <g key={node.id} opacity={node.z > -0.22 ? 1 : 0.34}>
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r="18"
                      fill="url(#hero-node-glow)"
                      opacity="0.88"
                      animate={reducedMotion ? undefined : { scale: [0.9, 1.1, 0.9], opacity: [0.28, 0.62, 0.28] }}
                      transition={{ duration: 4.4, delay: index * 0.45, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <circle cx={node.x} cy={node.y} r="5.8" fill="#f8fdff" />
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r="9"
                      fill="none"
                      stroke="rgba(125,211,252,0.8)"
                      strokeWidth="1.4"
                      animate={reducedMotion ? undefined : { scale: [0.96, 1.1, 0.96], opacity: [0.42, 0.82, 0.42] }}
                      transition={{ duration: 3.4, delay: index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </g>
                ))}
              </svg>

              {globeEvents[0] ? (
                <HeroEventCard event={globeEvents[0]} delay={0.24} className="left-[6%] top-[12%] w-[58%] max-w-[14rem] sm:left-[2%] sm:top-[9%] sm:w-[42%] sm:max-w-[15rem]" />
              ) : null}
              {globeEvents[1] ? (
                <HeroEventCard event={globeEvents[1]} delay={0.34} compact className="right-[4%] top-[14%] hidden w-[34%] min-w-[12rem] sm:block" />
              ) : null}
              {globeEvents[2] ? (
                <HeroEventCard event={globeEvents[2]} delay={0.42} compact className="right-[10%] bottom-[8%] hidden w-[38%] min-w-[13rem] sm:block" />
              ) : null}

              {globeEvents[0] ? (
                <Link
                  href={`/events/${getEventSlug(events[0])}`}
                  className="absolute bottom-[8%] left-[6%] inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/88 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_26px_70px_-42px_rgba(15,23,42,0.26)] backdrop-blur-xl transition duration-300 hover:shadow-[0_34px_78px_-42px_rgba(36,76,170,0.22)] sm:bottom-[13%]"
                >
                  Open featured event
                </Link>
              ) : null}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
