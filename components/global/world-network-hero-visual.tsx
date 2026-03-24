'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import landData from 'world-atlas/land-110m.json';

const WIDTH = 980;
const HEIGHT = 700;

type Node = {
  id: string;
  label: string;
  coordinates: [number, number];
  color: string;
  halo: string;
};

type Route = {
  id: string;
  from: Node;
  to: Node;
  lift: number;
};

const colors = {
  blue: '#2f7df6',
  cyan: '#1fb6ff',
  teal: '#14b8a6',
  green: '#22c55e'
} as const;

const nodes = {
  newYork: { id: 'new-york', label: 'New York', coordinates: [-74.006, 40.7128], color: colors.blue, halo: 'rgba(47,125,246,0.16)' },
  london: { id: 'london', label: 'London', coordinates: [-0.1276, 51.5072], color: colors.cyan, halo: 'rgba(31,182,255,0.14)' },
  dubai: { id: 'dubai', label: 'Dubai', coordinates: [55.2708, 25.2048], color: colors.teal, halo: 'rgba(20,184,166,0.14)' },
  singapore: { id: 'singapore', label: 'Singapore', coordinates: [103.8198, 1.3521], color: colors.green, halo: 'rgba(34,197,94,0.14)' },
  sydney: { id: 'sydney', label: 'Sydney', coordinates: [151.2093, -33.8688], color: colors.cyan, halo: 'rgba(31,182,255,0.12)' }
} satisfies Record<string, Node>;

const displayedNodes = [nodes.newYork, nodes.london, nodes.dubai, nodes.singapore, nodes.sydney];

const routes: Route[] = [
  { id: 'ny-london', from: nodes.newYork, to: nodes.london, lift: 106 },
  { id: 'london-dubai', from: nodes.london, to: nodes.dubai, lift: 84 },
  { id: 'dubai-singapore', from: nodes.dubai, to: nodes.singapore, lift: 96 },
  { id: 'singapore-sydney', from: nodes.singapore, to: nodes.sydney, lift: 72 }
];

const landFeature = feature((landData as any), (landData as any).objects.land) as any;
const projection = geoNaturalEarth1().fitExtent(
  [
    [82, 102],
    [WIDTH - 76, HEIGHT - 128]
  ],
  landFeature
);
const pathGenerator = geoPath(projection);
const landPath = pathGenerator(landFeature) ?? '';

function projectPoint([lon, lat]: [number, number]) {
  const point = projection([lon, lat]);
  return point ? { x: point[0], y: point[1] } : { x: 0, y: 0 };
}

function createRoutePath(route: Route) {
  const start = projectPoint(route.from.coordinates);
  const end = projectPoint(route.to.coordinates);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return {
    start,
    end,
    d: `M ${start.x} ${start.y} Q ${midX} ${midY - route.lift} ${end.x} ${end.y}`
  };
}

const regionalZones = [
  { id: 'na', center: projectPoint([-102, 42]), rx: 128, ry: 68, fill: 'rgba(47,125,246,0.08)' },
  { id: 'eu', center: projectPoint([8, 51]), rx: 96, ry: 52, fill: 'rgba(31,182,255,0.08)' },
  { id: 'me', center: projectPoint([48, 27]), rx: 84, ry: 42, fill: 'rgba(20,184,166,0.08)' },
  { id: 'apac', center: projectPoint([114, 8]), rx: 164, ry: 78, fill: 'rgba(34,197,94,0.08)' }
];

export function WorldNetworkHeroVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative h-[27rem] overflow-hidden rounded-[2.3rem] border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#edf6ff_48%,#e8faf6_100%)] shadow-[0_42px_110px_-52px_rgba(37,99,235,0.34)] sm:h-[32rem] lg:h-[38rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(47,125,246,0.18),transparent_24%),radial-gradient(circle_at_78%_20%,rgba(31,182,255,0.16),transparent_18%),radial-gradient(circle_at_82%_76%,rgba(34,197,94,0.14),transparent_20%)]" />
      <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-x-8 top-8 flex items-center justify-between rounded-full border border-white/80 bg-white/92 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-slate-700 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.22)]">
        <span>Global event network</span>
        <span className="text-blue-700">Live activity</span>
      </div>

      <motion.div
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { x: [0, 5, 0], y: [0, -3, 0] }}
        transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="hero-land-fill-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
              <stop offset="100%" stopColor="rgba(219,234,254,0.42)" />
            </linearGradient>
            <linearGradient id="hero-land-stroke-light" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.05)" />
              <stop offset="50%" stopColor="rgba(59,130,246,0.18)" />
              <stop offset="100%" stopColor="rgba(16,185,129,0.08)" />
            </linearGradient>
          </defs>

          <path d={landPath} fill="url(#hero-land-fill-light)" stroke="url(#hero-land-stroke-light)" strokeWidth="0.85" opacity="0.95" />

          {regionalZones.map((zone) => (
            <motion.ellipse
              key={zone.id}
              cx={zone.center.x}
              cy={zone.center.y}
              rx={zone.rx}
              ry={zone.ry}
              fill={zone.fill}
              animate={reduceMotion ? undefined : { opacity: [0.55, 0.82, 0.55] }}
              transition={reduceMotion ? undefined : { duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          {routes.map((route, index) => {
            const path = createRoutePath(route);
            const gradientId = `hero-route-${route.id}`;

            return (
              <g key={route.id}>
                <defs>
                  <linearGradient id={gradientId} x1={path.start.x} y1={path.start.y} x2={path.end.x} y2={path.end.y} gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={route.from.color} />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
                    <stop offset="100%" stopColor={route.to.color} />
                  </linearGradient>
                </defs>
                <path
                  d={path.d}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                <motion.path
                  d={path.d}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  pathLength={0.24}
                  initial={{ pathOffset: 1, opacity: 0 }}
                  animate={
                    reduceMotion
                      ? { pathOffset: 0.24, opacity: 0.42 }
                      : { pathOffset: [1, 0.16, 0], opacity: [0, 1, 0] }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 1, ease: 'easeOut' }
                      : { duration: 5 + index * 0.4, delay: index * 0.5, repeat: Infinity, ease: 'easeInOut' }
                  }
                />
              </g>
            );
          })}

          {displayedNodes.map((node, index) => {
            const point = projectPoint(node.coordinates);

            return (
              <g key={node.id}>
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r="15"
                  fill={node.halo}
                  animate={reduceMotion ? undefined : { opacity: [0.22, 0.42, 0.22], scale: [1, 1.42, 1] }}
                  transition={reduceMotion ? undefined : { duration: 4.6 + index * 0.24, repeat: Infinity, ease: 'easeInOut' }}
                />
                <circle cx={point.x} cy={point.y} r="6" fill="rgba(255,255,255,0.98)" />
                <circle cx={point.x} cy={point.y} r="4" fill={node.color} />
                <circle cx={point.x} cy={point.y} r="8.5" fill="none" stroke={node.color} strokeOpacity="0.4" strokeWidth="1.4" />
              </g>
            );
          })}
        </svg>
      </motion.div>

      <div className="pointer-events-none absolute bottom-5 right-5 grid gap-2 rounded-[1.4rem] border border-white/80 bg-white/92 px-4 py-3 text-xs text-slate-700 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.28)]">
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Active routes</span>
        <span>New York → London</span>
        <span>London → Dubai</span>
        <span>Dubai → Singapore</span>
      </div>
    </div>
  );
}
