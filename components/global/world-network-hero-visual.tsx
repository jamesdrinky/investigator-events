'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import landData from 'world-atlas/land-110m.json';

const WIDTH = 980;
const HEIGHT = 660;

type Node = {
  id: string;
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
  blue: '#49b2ff',
  violet: '#8073ff',
  teal: '#29d6c4',
  amber: '#ffbc62'
} as const;

const nodes = {
  newYork: { id: 'new-york', coordinates: [-74.006, 40.7128], color: colors.blue, halo: 'rgba(73,178,255,0.18)' },
  london: { id: 'london', coordinates: [-0.1276, 51.5072], color: colors.violet, halo: 'rgba(128,115,255,0.18)' },
  singapore: { id: 'singapore', coordinates: [103.8198, 1.3521], color: colors.teal, halo: 'rgba(41,214,196,0.18)' }
} satisfies Record<string, Node>;

const displayedNodes = [nodes.newYork, nodes.london, nodes.singapore];

const routes: Route[] = [
  { id: 'ny-london', from: nodes.newYork, to: nodes.london, lift: 112 },
  { id: 'london-singapore', from: nodes.london, to: nodes.singapore, lift: 126 }
];

const landFeature = feature((landData as any), (landData as any).objects.land) as any;
const projection = geoNaturalEarth1().fitExtent(
  [
    [96, 98],
    [WIDTH - 82, HEIGHT - 132]
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
  { id: 'na', center: projectPoint([-102, 42]), rx: 136, ry: 74, fill: 'rgba(73,178,255,0.16)' },
  { id: 'eu', center: projectPoint([10, 51]), rx: 104, ry: 58, fill: 'rgba(128,115,255,0.15)' },
  { id: 'apac', center: projectPoint([112, 20]), rx: 164, ry: 84, fill: 'rgba(41,214,196,0.14)' }
];

export function WorldNetworkHeroVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative h-[22rem] overflow-hidden rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,31,0.98),rgba(5,11,20,0.98))] shadow-[0_0_40px_rgba(50,150,255,0.15)] sm:h-[24rem] lg:h-[26rem]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0)_32%,rgba(26,215,241,0.03)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_30%,rgba(73,178,255,0.08),transparent_18%),radial-gradient(circle_at_56%_22%,rgba(128,115,255,0.08),transparent_14%)]" />

      <motion.div
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { x: [0, 4, 0] }}
        transition={reduceMotion ? undefined : { duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="hero-land-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(206,227,255,0.1)" />
              <stop offset="100%" stopColor="rgba(206,227,255,0.03)" />
            </linearGradient>
            <linearGradient id="hero-land-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(206,227,255,0.04)" />
              <stop offset="50%" stopColor="rgba(206,227,255,0.12)" />
              <stop offset="100%" stopColor="rgba(206,227,255,0.05)" />
            </linearGradient>
          </defs>

          <path d={landPath} fill="url(#hero-land-fill)" stroke="url(#hero-land-stroke)" strokeWidth="0.8" opacity="0.88" />

          {regionalZones.map((zone) => (
            <ellipse key={zone.id} cx={zone.center.x} cy={zone.center.y} rx={zone.rx} ry={zone.ry} fill={zone.fill} />
          ))}

          {routes.map((route, index) => {
            const path = createRoutePath(route);
            const gradientId = `hero-route-${route.id}`;
            const primaryRoute = index === 0;

            return (
              <g key={route.id}>
                <defs>
                  <linearGradient id={gradientId} x1={path.start.x} y1={path.start.y} x2={path.end.x} y2={path.end.y} gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={route.from.color} />
                    <stop offset="50%" stopColor="rgba(231,242,255,0.84)" />
                    <stop offset="100%" stopColor={route.to.color} />
                  </linearGradient>
                </defs>
                <path
                  d={path.d}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth={primaryRoute ? '2.2' : '1.35'}
                  strokeLinecap="round"
                  opacity={primaryRoute ? '0.94' : '0.42'}
                />
                <motion.path
                  d={path.d}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth={primaryRoute ? '3.1' : '1.8'}
                  strokeLinecap="round"
                  pathLength={primaryRoute ? 0.24 : 0.16}
                  initial={{ pathOffset: 1, opacity: 0 }}
                  animate={reduceMotion ? { pathOffset: 0.22, opacity: primaryRoute ? 0.3 : 0.18 } : { pathOffset: [1, 0.18, 0], opacity: [0, primaryRoute ? 0.95 : 0.62, 0] }}
                  transition={
                    reduceMotion
                      ? { duration: 1, ease: 'easeOut' }
                      : { duration: primaryRoute ? 5.6 : 4.6 + index * 0.3, delay: index * 0.45, repeat: Infinity, ease: 'easeInOut' }
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
                  r="10"
                  fill={node.halo}
                  animate={reduceMotion ? undefined : { opacity: [0.08, 0.2, 0.08], scale: [1, 1.28, 1] }}
                  transition={reduceMotion ? undefined : { duration: 4.6 + index * 0.24, repeat: Infinity, ease: 'easeInOut' }}
                />
                <circle cx={point.x} cy={point.y} r="3" fill="rgba(245,250,255,0.96)" />
                <circle cx={point.x} cy={point.y} r="1.8" fill={node.color} />
              </g>
            );
          })}
        </svg>
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,9,19,0.2)_0%,rgba(4,9,19,0.04)_30%,rgba(4,9,19,0.18)_100%),linear-gradient(180deg,rgba(4,9,19,0.03)_0%,rgba(4,9,19,0.22)_100%)]" />
    </div>
  );
}
