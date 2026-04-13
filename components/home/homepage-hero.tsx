'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShinyButton } from '@/components/ui/shiny-button';
import { useMemo, useState, useEffect, useCallback } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

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

  // Static globe projection — computed once, no animation
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

  const vb = globeScale + 60;

  return (
    <div className="relative overflow-clip">
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
      <div className="relative">
        {/* ── Wireframe Globe — static, positioned right on desktop ── */}
        <div
          className="pointer-events-none absolute z-[1]"
          style={{
            width: isMobile ? '22rem' : '56rem',
            height: isMobile ? '22rem' : '56rem',
            top: isMobile ? '22%' : '4%',
            left: isMobile ? '50%' : 'auto',
            right: isMobile ? 'auto' : '-12%',
            transform: isMobile ? 'translateX(-50%)' : 'none',
          }}
        >
          <div className="absolute inset-[-18%] rounded-full bg-[radial-gradient(ellipse,rgba(22,104,255,0.1),rgba(236,72,153,0.05)_40%,transparent_65%)]" />
          <svg viewBox={`${-vb} ${-vb} ${vb * 2} ${vb * 2}`} className="h-full w-full">
            <defs>
              <linearGradient id="hero-land-wire" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1668ff" />
                <stop offset="35%" stopColor="#10b8ff" />
                <stop offset="70%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <radialGradient id="hero-globe-fill" cx="38%" cy="35%" r="65%">
                <stop offset="0%" stopColor="rgba(30,64,140,0.08)" />
                <stop offset="60%" stopColor="rgba(15,25,60,0.03)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <circle r={globeScale} fill="url(#hero-globe-fill)" stroke="rgba(59,130,246,0.15)" strokeWidth="1.2" />
            <path d={graticulePath} fill="none" stroke="rgba(59,130,246,0.07)" strokeWidth="0.5" />
            <path d={landPath} fill="rgba(59,130,246,0.03)" stroke="url(#hero-land-wire)" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.5" />
            <path d={landPath} fill="none" stroke="url(#hero-land-wire)" strokeWidth="1.2" opacity="0.25" />
            {projectedDots.map((dot) => (
              <g key={dot.id}>
                <circle cx={dot.x} cy={dot.y} r="4" fill="#ec4899" />
                <circle cx={dot.x} cy={dot.y} r="7" fill="none" stroke="rgba(236,72,153,0.5)" strokeWidth="1" />
              </g>
            ))}
          </svg>
        </div>

        {/* ── Header content ── */}
        <div className="relative z-10 px-6 pb-10 pt-16 text-center sm:pb-8 sm:pt-12 lg:pt-16">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-[0_20px_50px_-30px_rgba(0,0,60,0.5)]"
            style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)' }}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_0_6px_rgba(34,211,238,0.18)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70 sm:text-[11px] sm:tracking-[0.26em]">
              Private Investigator Events Calendar
            </span>
          </div>

          <h1 className="mx-auto mt-8 max-w-[10ch] text-5xl font-bold leading-[0.9] tracking-[-0.06em] text-white sm:mt-7 sm:text-[4.5rem] sm:leading-[0.86] lg:mt-8 lg:text-[7.5rem]">
            <span
              className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
              style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
            >
              Never
            </span>{' '}
            Miss Another Investigator Event
          </h1>

          <p className="mx-auto mt-7 max-w-md text-base leading-[1.65] text-blue-100/55 sm:mt-6 sm:max-w-xl sm:text-lg">
            Every confirmed conference, AGM, and training event for private
            investigators — free to browse, free to list.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3.5 sm:mt-8 sm:flex-row sm:justify-center sm:gap-3">
            <Link href="/calendar">
              <ShinyButton className="min-h-[3.5rem] w-full px-8 py-3.5 text-[15px] sm:w-auto sm:px-10 sm:py-4 sm:text-base">Browse PI Events</ShinyButton>
            </Link>
            <Link
              href="/submit-event"
              className="inline-flex min-h-[3.5rem] w-full items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3.5 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto sm:px-10 sm:py-4 sm:text-base"
            >
              Submit Your Event
            </Link>
          </div>

          <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-3">
            {stats.map((item, index) => {
              const colors = ['from-cyan-400 to-blue-400', 'from-violet-400 to-purple-400', 'from-pink-400 to-rose-400'];
              return (
                <div
                  key={item.label}
                  className="rounded-[1.2rem] border px-3 py-4 text-center sm:rounded-[1.4rem] sm:px-4"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
                >
                  <p className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-100/60 sm:text-[10px] sm:tracking-[0.2em]">{item.label}</p>
                  <p className={`mt-1.5 bg-gradient-to-r ${colors[index % 3]} bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-[1.8rem]`}>{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── iPad device mockup — static, no scroll hooks ── */}
        <div className="relative z-20 mx-auto mt-4 w-[calc(100%-2rem)] max-w-5xl sm:mt-0">
          <div className="overflow-hidden rounded-[1.4rem] border-4 border-[#2a2a3e] bg-[#12122a] p-2 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6),0_0_80px_rgba(99,102,241,0.12)] sm:rounded-[1.8rem] sm:p-3 lg:rounded-[2.2rem] lg:p-4">
            <div className="absolute inset-x-0 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.5),rgba(236,72,153,0.4),transparent)]" />
            <div className="overflow-hidden rounded-xl lg:rounded-2xl">
              <Image
                src="/hero/ipad.png"
                alt="Investigator Events Platform"
                width={1536}
                height={1024}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>

        {/* ── Bottom fade to page background ── */}
        <div className="pointer-events-none relative z-30 -mt-8 h-20 bg-gradient-to-b from-transparent via-[#0a1228]/60 to-[#f4f8fc] sm:-mt-16 sm:h-40" />
      </div>
    </div>
  );
}
