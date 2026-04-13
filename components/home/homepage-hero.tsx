'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShinyButton } from '@/components/ui/shiny-button';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { geoOrthographic, geoPath, geoGraticule } from 'd3-geo';
import { feature } from 'topojson-client';
import landData from 'world-atlas/land-110m.json';
import type { EventItem } from '@/lib/data/events';

/* ────────────────────────────────────────────── */
/*  Types                                         */
/* ────────────────────────────────────────────── */

interface HomepageHeroProps {
  events: EventItem[];
  stats: Array<{ label: string; value: string | number }>;
}

interface GlobePoint {
  lat: number;
  lon: number;
}

/* ────────────────────────────────────────────── */
/*  City / Country / Region coordinates           */
/* ────────────────────────────────────────────── */

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
  zurich: { lat: 47.3769, lon: 8.5417 },
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
  'United States': { lat: 39.8283, lon: -98.5795 },
};

const REGION_COORDINATES: Record<string, GlobePoint> = {
  'Asia-Pacific': { lat: 7, lon: 114 },
  Europe: { lat: 50, lon: 12 },
  'Middle East': { lat: 24, lon: 46 },
  'North America': { lat: 39, lon: -98 },
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function getEventCoordinate(event: EventItem): GlobePoint {
  const cityMatch = CITY_COORDINATES[normalizeKey(event.city)];
  if (cityMatch) return cityMatch;
  const countryMatch = COUNTRY_COORDINATES[event.country];
  if (countryMatch) return countryMatch;
  return REGION_COORDINATES[event.region] ?? { lat: 18, lon: 18 };
}

/* ────────────────────────────────────────────── */
/*  HomepageHero                                  */
/* ────────────────────────────────────────────── */

export function HomepageHero({ events, stats }: HomepageHeroProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  /* Poll for intro completion — checks if the overlay is gone */
  useEffect(() => {
    // If no intro overlay exists at all, animate immediately
    if (!document.querySelector('[data-site-intro]')) {
      setIntroComplete(true);
      return;
    }
    // Otherwise poll until it's removed
    const interval = setInterval(() => {
      if (!document.querySelector('[data-site-intro]')) {
        setIntroComplete(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);


  /* ── Scroll-driven iPad animation ── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const ipadRotate = useTransform(scrollYProgress, [0, 1], [35, 0]);
  const ipadScale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  /* ── Mobile detection ── */
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  /* ── Globe data ── */
  const globeNodes = useMemo(
    () =>
      events.slice(0, 6).map((e) => ({
        id: e.id,
        ...getEventCoordinate(e),
      })),
    [events],
  );

  const globeScale = isMobile ? 280 : 400;
  const landFeature = useMemo(
    () => feature(landData as any, (landData as any).objects.land) as any,
    [],
  );
  const graticuleData = useMemo(() => geoGraticule()(), []);

  /* ── Animated globe rotation (desktop only) ── */
  const rotationRef = useRef(25);
  const landRef = useRef<SVGPathElement>(null);
  const landWireRef = useRef<SVGPathElement>(null);
  const graticuleRef = useRef<SVGPathElement>(null);
  const dotsGroupRef = useRef<SVGGElement>(null);
  const arcsGroupRef = useRef<SVGGElement>(null);

  const shouldAnimate = !reducedMotion && !isMobile;

  // Build projection + pathGen for a given rotation
  const buildProjection = useCallback(
    (rot: number) => {
      const proj = geoOrthographic()
        .scale(globeScale)
        .translate([0, 0])
        .rotate([rot, -18, 0])
        .clipAngle(90);
      return { proj, gen: geoPath(proj) };
    },
    [globeScale],
  );

  // Initial static render
  const { proj: initProj, gen: initGen } = useMemo(
    () => buildProjection(25),
    [buildProjection],
  );
  const landPath = useMemo(() => initGen(landFeature) ?? '', [initGen, landFeature]);
  const graticulePath = useMemo(() => initGen(graticuleData) ?? '', [initGen, graticuleData]);
  const projectedDots = useMemo(
    () =>
      globeNodes
        .map((node) => {
          const coords = initProj([node.lon, node.lat]);
          return coords ? { x: coords[0], y: coords[1], id: node.id } : null;
        })
        .filter((d): d is NonNullable<typeof d> => d !== null),
    [globeNodes, initProj],
  );
  const arcPaths = useMemo(() => {
    if (globeNodes.length < 2) return [];
    return globeNodes.slice(0, -1).map((node, i) => {
      const next = globeNodes[i + 1];
      const arc = {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: [[node.lon, node.lat], [next.lon, next.lat]],
        },
      };
      return { id: `${node.id}-${next.id}`, d: initGen(arc as any) ?? '' };
    });
  }, [globeNodes, initGen]);

  // Animation loop — updates SVG attributes directly, no React re-renders
  useEffect(() => {
    if (!shouldAnimate) return;
    let frame: number;
    const tick = () => {
      rotationRef.current += 0.015; // ~0.9° per second → full rotation in ~6.5 min
      const { proj, gen } = buildProjection(rotationRef.current);

      // Update land paths
      if (landRef.current) landRef.current.setAttribute('d', gen(landFeature) ?? '');
      if (landWireRef.current) landWireRef.current.setAttribute('d', gen(landFeature) ?? '');
      if (graticuleRef.current) graticuleRef.current.setAttribute('d', gen(graticuleData) ?? '');

      // Update dots
      if (dotsGroupRef.current) {
        globeNodes.forEach((node, i) => {
          const coords = proj([node.lon, node.lat]);
          const group = dotsGroupRef.current?.children[i] as SVGGElement | undefined;
          if (!group) return;
          if (coords) {
            group.style.display = '';
            const cs = group.querySelectorAll('circle');
            cs.forEach((c) => { c.setAttribute('cx', String(coords[0])); c.setAttribute('cy', String(coords[1])); });
          } else {
            group.style.display = 'none';
          }
        });
      }

      // Update arcs
      if (arcsGroupRef.current) {
        const paths = arcsGroupRef.current.querySelectorAll('path');
        if (globeNodes.length >= 2) {
          globeNodes.slice(0, -1).forEach((node, i) => {
            const next = globeNodes[i + 1];
            const arc = {
              type: 'Feature' as const, properties: {},
              geometry: { type: 'LineString' as const, coordinates: [[node.lon, node.lat], [next.lon, next.lat]] },
            };
            if (paths[i]) paths[i].setAttribute('d', gen(arc as any) ?? '');
          });
        }
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shouldAnimate, buildProjection, landFeature, graticuleData, globeNodes]);

  const vb = globeScale + 60;

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* ── Dark background ── */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,#06091a_0%,#0a1228_35%,#0d1840_60%,#0a1228_100%)]" />

      {/* ── Ambient glow orbs (no blur filter, no animation — static gradient layers) ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-5%] top-[-5%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(ellipse,rgba(22,104,255,0.18),transparent_55%)] sm:h-[46rem] sm:w-[46rem]" />
        <div className="absolute right-[-4%] top-[-3%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(ellipse,rgba(236,72,153,0.12),transparent_55%)] sm:h-[38rem] sm:w-[38rem]" />
        <div className="absolute bottom-[15%] left-[25%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(ellipse,rgba(14,165,233,0.1),transparent_55%)] sm:h-[30rem] sm:w-[30rem]" />
      </div>

      {/* Noise texture removed — SVG feTurbulence filter in data URI is GPU-expensive */}

      {/* ── Main content wrapper ── */}
      <div className="relative" style={{ perspective: '1200px' }}>
        {/* ── Wireframe Globe ── */}
        <motion.div
          className="pointer-events-none absolute left-1/2 z-[1] -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={introComplete ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 2, delay: 0, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: isMobile ? '22rem' : '56rem',
            height: isMobile ? '22rem' : '56rem',
            top: isMobile ? '22%' : '10%',
          }}
        >
          {/* Globe glow — no blur filter, just a large soft gradient */}
          <div className="absolute inset-[-18%] rounded-full bg-[radial-gradient(ellipse,rgba(22,104,255,0.1),rgba(236,72,153,0.05)_40%,transparent_65%)]" />

          <svg
            viewBox={`${-vb} ${-vb} ${vb * 2} ${vb * 2}`}
            className="h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id="hero-land-wire" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1668ff" />
                <stop offset="35%" stopColor="#10b8ff" />
                <stop offset="70%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="hero-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              <radialGradient id="hero-globe-fill" cx="38%" cy="35%" r="65%">
                <stop offset="0%" stopColor="rgba(30,64,140,0.08)" />
                <stop offset="60%" stopColor="rgba(15,25,60,0.03)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Globe sphere */}
            <circle r={globeScale} fill="url(#hero-globe-fill)" stroke="rgba(59,130,246,0.15)" strokeWidth="1.2" />

            {/* Graticule grid */}
            <path ref={graticuleRef} d={graticulePath} fill="none" stroke="rgba(59,130,246,0.07)" strokeWidth="0.5" />

            {/* Land — wireframe dotted style */}
            <path ref={landRef} d={landPath} fill="rgba(59,130,246,0.03)" stroke="url(#hero-land-wire)" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.5" />
            <path ref={landWireRef} d={landPath} fill="none" stroke="url(#hero-land-wire)" strokeWidth="1.2" opacity="0.25" />

            {/* Route arcs between events */}
            <g ref={arcsGroupRef}>
              {arcPaths.map((arc) => (
                <path
                  key={arc.id}
                  d={arc.d}
                  fill="none"
                  stroke="url(#hero-arc-grad)"
                  strokeWidth="1.4"
                  strokeDasharray="6 8"
                  opacity="0.35"
                  style={{ animation: reducedMotion ? 'none' : 'hero-dash-flow 5s linear infinite' }}
                />
              ))}
            </g>

            {/* Event location dots */}
            <g ref={dotsGroupRef}>
              {projectedDots.map((dot, i) => (
                <g key={dot.id}>
                  <circle cx={dot.x} cy={dot.y} r="14" fill="rgba(236,72,153,0.22)" opacity="0.35" style={{ animation: `hero-pulse ${3 + i * 0.5}s ease-in-out infinite` }} />
                  <circle cx={dot.x} cy={dot.y} r="4" fill="#ec4899" />
                  <circle cx={dot.x} cy={dot.y} r="7" fill="none" stroke="rgba(236,72,153,0.5)" strokeWidth="1" />
                </g>
              ))}
            </g>
          </svg>
        </motion.div>

        {/* ── Header content (centered, above globe) ── */}
        <motion.div
          style={isMobile ? undefined : { translateY: headerY }}
          className="relative z-10 px-6 pb-10 pt-16 text-center sm:pb-8 sm:pt-12 lg:pt-16"
        >
          {/* Badge pill */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
            animate={introComplete ? { opacity: 1, y: 0, scale: 1 } : undefined}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-[0_20px_50px_-30px_rgba(0,0,60,0.5)]"
              style={{
                borderColor: 'rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.07)',
              }}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_0_6px_rgba(34,211,238,0.18)]"
                style={{ animation: 'hero-pulse 3s ease-in-out infinite' }}
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70 sm:text-[11px] sm:tracking-[0.26em]">
                Private Investigator Events Calendar
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="mx-auto mt-8 max-w-[10ch] text-5xl font-bold leading-[0.9] tracking-[-0.06em] text-white sm:mt-7 sm:text-[4.5rem] sm:leading-[0.86] lg:mt-8 lg:text-[7.5rem]"
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            animate={introComplete ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: 1.2,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span
              className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
              style={{
                animation: reducedMotion
                  ? 'none'
                  : 'gradient-text-cycle 5s ease-in-out infinite',
              }}
            >
              Never
            </span>{' '}
            Miss Another Investigator Event
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mx-auto mt-7 max-w-md text-base leading-[1.65] text-blue-100/55 sm:mt-6 sm:max-w-xl sm:text-lg"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={introComplete ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: 1,
              delay: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            Every confirmed conference, AGM, and training event for private
            investigators — free to browse, free to list.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="mt-10 flex flex-col items-center gap-3.5 sm:mt-8 sm:flex-row sm:justify-center sm:gap-3"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={introComplete ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: 1,
              delay: 0.85,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link href="/calendar">
              <ShinyButton className="min-h-[3.5rem] w-full px-8 py-3.5 text-[15px] sm:w-auto sm:px-10 sm:py-4 sm:text-base">Browse PI Events</ShinyButton>
            </Link>
            <Link
              href="/submit-event"
              className="inline-flex min-h-[3.5rem] w-full items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3.5 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto sm:px-10 sm:py-4 sm:text-base"
            >
              Submit Your Event
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-3 sm:mt-10 sm:max-w-md sm:gap-3"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={introComplete ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: 1,
              delay: 1.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {stats.map((item, index) => {
              const colors = [
                'from-cyan-400 to-blue-400',
                'from-violet-400 to-purple-400',
                'from-pink-400 to-rose-400',
              ];
              return (
                <div
                  key={item.label}
                  className="rounded-[1.2rem] border px-3 py-4 text-center sm:rounded-[1.4rem] sm:px-4 sm:py-4"
                  style={{
                    borderColor: 'rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <p className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-100/60 sm:text-[10px] sm:tracking-[0.2em]">
                    {item.label}
                  </p>
                  <p
                    className={`mt-1.5 bg-gradient-to-r ${colors[index % 3]} bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:mt-1.5 sm:text-[1.8rem]`}
                  >
                    {item.value}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* ── Mobile: skewed perspective dashboard ── */}
        <div className="pointer-events-none relative z-20 -mt-4 block overflow-hidden sm:hidden">
          <div
            className="mx-auto max-w-7xl pl-4"
            style={{
              maskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)',
            }}
          >
            <div style={{ perspective: '1200px' }}>
              <div
                style={{
                  maskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
                }}
              >
                <div style={{ transform: 'rotateX(20deg)' }}>
                  <div className="relative" style={{ transform: 'skewX(0.36rad)' }}>
                    <Image
                      src="/hero/ipad.png"
                      alt="Investigator Events Platform"
                      width={1536}
                      height={1024}
                      className="rounded-xl border border-white/10"
                      priority
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Desktop: iPad scroll-animated card ── */}
        <motion.div
          style={{
            rotateX: ipadRotate,
            scale: ipadScale,
            boxShadow:
              '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
          }}
          className="relative z-20 mx-auto hidden w-[calc(100%-3rem)] max-w-5xl sm:block"
        >
          <div className="overflow-hidden rounded-[1.8rem] border-4 border-[#2a2a3e] bg-[#12122a] p-3 shadow-[0_0_80px_rgba(99,102,241,0.12)] lg:rounded-[2.2rem] lg:p-4">
            {/* Shimmer top edge */}
            <div className="absolute inset-x-0 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.5),rgba(236,72,153,0.4),transparent)]" />
            <div className="overflow-hidden rounded-xl lg:rounded-2xl">
              <Image
                src="/hero/ipad.png"
                alt="Investigator Events Platform"
                width={1536}
                height={1024}
                className="h-auto w-full"
                priority
                unoptimized
              />
            </div>
          </div>
        </motion.div>

        {/* ── Bottom fade to page background ── */}
        <div className="pointer-events-none relative z-30 h-16 bg-gradient-to-b from-transparent via-[#0a1228]/60 to-[#f4f8fc] sm:-mt-12 sm:h-36" />
      </div>
    </div>
  );
}
