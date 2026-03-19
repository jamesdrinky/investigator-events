'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import landData from 'world-atlas/land-110m.json';

const WIDTH = 1600;
const HEIGHT = 980;

const regionColors = {
  northAmerica: '#36a8ff',
  europe: '#8e6dff',
  middleEast: '#ffb14a',
  asiaPacific: '#24d4c7',
  latinAmerica: '#ff68cb',
  africa: '#ffd166'
} as const;

type CityNode = {
  city: string;
  region: string;
  color: string;
  coordinates: [number, number];
};

type Route = {
  id: string;
  from: CityNode;
  to: CityNode;
};

const cities = {
  newYork: {
    city: 'New York',
    region: 'North America',
    color: regionColors.northAmerica,
    coordinates: [-74.006, 40.7128]
  },
  london: {
    city: 'London',
    region: 'Europe',
    color: regionColors.europe,
    coordinates: [-0.1276, 51.5072]
  },
  dubai: {
    city: 'Dubai',
    region: 'Middle East',
    color: regionColors.middleEast,
    coordinates: [55.2708, 25.2048]
  },
  singapore: {
    city: 'Singapore',
    region: 'Asia-Pacific',
    color: regionColors.asiaPacific,
    coordinates: [103.8198, 1.3521]
  },
  saoPaulo: {
    city: 'Sao Paulo',
    region: 'Latin America',
    color: regionColors.latinAmerica,
    coordinates: [-46.6333, -23.5505]
  },
  johannesburg: {
    city: 'Johannesburg',
    region: 'Africa',
    color: regionColors.africa,
    coordinates: [28.0473, -26.2041]
  }
} satisfies Record<string, CityNode>;

const displayedNodes: CityNode[] = [
  cities.newYork,
  cities.london,
  cities.dubai,
  cities.singapore,
  cities.saoPaulo,
  cities.johannesburg
];

const routes: Route[] = [
  { id: 'newyork-london', from: cities.newYork, to: cities.london },
  { id: 'london-dubai', from: cities.london, to: cities.dubai },
  { id: 'dubai-singapore', from: cities.dubai, to: cities.singapore },
  { id: 'newyork-sao-paulo', from: cities.newYork, to: cities.saoPaulo },
  { id: 'dubai-johannesburg', from: cities.dubai, to: cities.johannesburg }
];

const landFeature = feature((landData as any), (landData as any).objects.land) as any;
const projection = geoNaturalEarth1().fitExtent(
  [
    [120, 126],
    [WIDTH - 120, HEIGHT - 290]
  ],
  landFeature
);
const pathGenerator = geoPath(projection);
const landPath = pathGenerator(landFeature) ?? '';
const graticulePath = pathGenerator(geoGraticule10()) ?? '';

function projectPoint([lon, lat]: [number, number]) {
  const point = projection([lon, lat]);
  return point ? { x: point[0], y: point[1] } : { x: 0, y: 0 };
}

function routePath(route: Route) {
  const start = projectPoint(route.from.coordinates);
  const end = projectPoint(route.to.coordinates);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const lift = Math.min(150, Math.max(68, distance * 0.18));

  return {
    start,
    end,
    d: `M ${start.x} ${start.y} Q ${midX} ${midY - lift} ${end.x} ${end.y}`
  };
}

export function WorldNetworkHeroVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_72%,rgba(14,45,86,0.78),transparent_34%),radial-gradient(circle_at_22%_18%,rgba(54,168,255,0.16),transparent_20%),radial-gradient(circle_at_42%_14%,rgba(142,109,255,0.1),transparent_16%),radial-gradient(circle_at_78%_18%,rgba(36,212,199,0.1),transparent_18%),radial-gradient(circle_at_66%_24%,rgba(255,177,74,0.08),transparent_14%),linear-gradient(180deg,#04070b_0%,#07111e_36%,#04070b_100%)]" />
      <div className="absolute inset-[-4%] bg-[radial-gradient(circle_at_48%_36%,rgba(54,168,255,0.08),transparent_24%),radial-gradient(circle_at_58%_28%,rgba(36,212,199,0.06),transparent_16%),radial-gradient(circle_at_64%_30%,rgba(255,177,74,0.04),transparent_14%),radial-gradient(circle_at_36%_22%,rgba(142,109,255,0.05),transparent_15%)]" />

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <filter id="hero-land-glow" x="-20%" y="-20%" width="140%" height="160%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="hero-route-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          <radialGradient id="hero-atmosphere" cx="50%" cy="66%" r="42%">
            <stop offset="0%" stopColor="rgba(54,168,255,0.2)" />
            <stop offset="50%" stopColor="rgba(36,212,199,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="hero-land-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(20,30,48,0.94)" />
            <stop offset="100%" stopColor="rgba(7,12,20,0.98)" />
          </linearGradient>
          <linearGradient id="hero-land-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(118,211,255,0.18)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(36,212,199,0.12)" />
          </linearGradient>
        </defs>

        <ellipse cx={WIDTH / 2} cy={HEIGHT * 0.82} rx="880" ry="288" fill="url(#hero-atmosphere)" />
        <ellipse cx={WIDTH / 2} cy={HEIGHT * 0.83} rx="940" ry="306" fill="none" stroke="rgba(118,211,255,0.18)" strokeWidth="1.4" />
        <ellipse cx={WIDTH / 2} cy={HEIGHT * 0.83} rx="1006" ry="332" fill="none" stroke="rgba(118,211,255,0.08)" strokeWidth="1" />

        <path d="M 64 816 C 310 724 514 694 800 694 C 1086 694 1290 724 1536 816" fill="none" stroke="rgba(118,211,255,0.1)" strokeWidth="1.2" />
        <path d="M 180 870 C 396 786 570 756 800 756 C 1030 756 1204 786 1420 870" fill="none" stroke="rgba(118,211,255,0.08)" strokeWidth="1" />

        <path d={landPath} fill="rgba(54,168,255,0.28)" filter="url(#hero-land-glow)" opacity="0.16" />
        <path d={graticulePath} fill="none" stroke="rgba(201,228,255,0.06)" strokeWidth="0.9" />
        <path d={landPath} fill="url(#hero-land-fill)" stroke="url(#hero-land-stroke)" strokeWidth="1.15" />

        {routes.map((route, index) => {
          const path = routePath(route);
          const gradientId = `hero-route-${route.id}`;

          return (
            <g key={route.id}>
              <defs>
                <linearGradient id={gradientId} x1={path.start.x} y1={path.start.y} x2={path.end.x} y2={path.end.y} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={route.from.color} />
                  <stop offset="50%" stopColor="#f4fbff" />
                  <stop offset="100%" stopColor={route.to.color} />
                </linearGradient>
              </defs>

              <motion.path
                d={path.d}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="4.5"
                strokeLinecap="round"
                opacity="0.16"
                filter="url(#hero-route-glow)"
                animate={reduceMotion ? undefined : { opacity: [0.08, 0.2, 0.08] }}
                transition={reduceMotion ? undefined : { duration: 7.5 + index * 0.45, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.path
                d={path.d}
                fill="none"
                stroke="rgba(54,168,255,0.28)"
                strokeWidth="1.7"
                strokeLinecap="round"
                filter="url(#hero-route-glow)"
                initial={{ pathLength: 0.08, opacity: 0.14 }}
                animate={reduceMotion ? { pathLength: 1, opacity: 0.24 } : { pathLength: 1, opacity: [0.14, 0.28, 0.14] }}
                transition={
                  reduceMotion
                    ? { duration: 1, ease: 'easeOut' }
                    : { duration: 8.8 + index * 0.5, delay: index * 0.3, repeat: Infinity, ease: 'easeInOut' }
                }
              />
              <motion.path
                d={path.d}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="2.2"
                strokeLinecap="round"
                pathLength={0.1}
                initial={{ pathOffset: 1, opacity: 0 }}
                filter="url(#hero-route-glow)"
                animate={reduceMotion ? { pathOffset: 0.22, opacity: 0.14 } : { pathOffset: [1, 0.18, 0], opacity: [0, 0.52, 0] }}
                transition={
                  reduceMotion
                    ? { duration: 1, ease: 'easeOut' }
                    : { duration: 6 + index * 0.4, delay: 1.2 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }
                }
              />
            </g>
          );
        })}

        {displayedNodes.map((node, index) => {
          const point = projectPoint(node.coordinates);

          return (
            <g key={node.city}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="15"
                fill={node.color}
                opacity="0.08"
                animate={reduceMotion ? undefined : { opacity: [0.05, 0.12, 0.05], scale: [1, 1.16, 1] }}
                transition={reduceMotion ? undefined : { duration: 6.2 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="4.5"
                fill="#ffffff"
                animate={reduceMotion ? undefined : { opacity: [0.38, 0.62, 0.38] }}
                transition={reduceMotion ? undefined : { duration: 5 + index * 0.28, repeat: Infinity, ease: 'easeInOut' }}
              />
              <circle cx={point.x} cy={point.y} r="3" fill={node.color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
