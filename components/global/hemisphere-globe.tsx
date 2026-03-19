'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface HemisphereGlobeProps {
  className?: string;
  emphasis?: 'soft' | 'feature';
}

const routes = [
  'M 176 424 C 312 338 454 312 612 334 C 784 358 922 404 1134 286',
  'M 222 500 C 376 404 520 374 676 388 C 830 402 956 438 1104 360',
  'M 286 304 C 428 396 564 430 714 418 C 872 404 1002 338 1162 374',
  'M 334 554 C 456 452 596 422 752 430 C 900 438 1012 470 1122 424',
  'M 246 364 C 390 288 520 276 666 302 C 808 328 932 336 1088 262'
];

const nodes = [
  { cx: 382, cy: 436, core: 2, halo: 8 },
  { cx: 520, cy: 372, core: 2.4, halo: 11 },
  { cx: 654, cy: 338, core: 2.1, halo: 9 },
  { cx: 782, cy: 354, core: 2.8, halo: 12 },
  { cx: 904, cy: 392, core: 2.2, halo: 10 },
  { cx: 1016, cy: 444, core: 1.9, halo: 8 },
  { cx: 1116, cy: 322, core: 1.9, halo: 9 },
  { cx: 430, cy: 512, core: 2, halo: 10 }
];

export function HemisphereGlobe({ className = '', emphasis = 'soft' }: HemisphereGlobeProps) {
  const feature = emphasis === 'feature';
  const reduceMotion = useReducedMotion();
  const routeCount = feature ? 5 : 2;
  const visibleRoutes = routes.slice(0, routeCount);
  const visibleNodes = nodes.slice(0, feature ? nodes.length : 4);

  return (
    <svg viewBox="0 0 1400 760" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`hemisphere-glow-${emphasis}`} cx="50%" cy="58%" r="48%">
          <stop offset="0%" stopColor={feature ? 'rgba(184,228,255,0.2)' : 'rgba(255,255,255,0.09)'} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <linearGradient id={`route-line-${emphasis}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(77,163,255,0)" />
          <stop offset="44%" stopColor={feature ? 'rgba(77,163,255,0.42)' : 'rgba(77,163,255,0.24)'} />
          <stop offset="78%" stopColor={feature ? 'rgba(52,211,153,0.24)' : 'rgba(184,228,255,0.16)'} />
          <stop offset="100%" stopColor="rgba(52,211,153,0)" />
        </linearGradient>
      </defs>

      <g opacity={feature ? '0.9' : '0.75'}>
        <ellipse cx="700" cy="514" rx={feature ? '428' : '392'} ry={feature ? '208' : '188'} fill={`url(#hemisphere-glow-${emphasis})`} />
      </g>

      <g fill="none" stroke="rgba(201,206,214,0.18)" strokeWidth={feature ? '1.05' : '0.92'}>
        <path d="M304 514C304 399 482 306 700 306C918 306 1096 399 1096 514" />
        <path d="M350 514C350 418 504 342 700 342C896 342 1050 418 1050 514" />
        <path d="M410 514C410 434 538 370 700 370C862 370 990 434 990 514" />
        <path d="M470 514C470 452 572 404 700 404C828 404 930 452 930 514" />
        <path d="M540 514C540 470 608 438 700 438C792 438 860 470 860 514" />
      </g>

      <g fill="none" stroke="rgba(170,174,181,0.14)" strokeWidth="0.9">
        <path d="M700 514C700 424 700 352 700 306" />
        <path d="M582 514C566 434 566 370 582 320" />
        <path d="M818 514C834 434 834 370 818 320" />
        <path d="M480 514C456 444 450 386 462 338" />
        <path d="M920 514C944 444 950 386 938 338" />
      </g>

      {feature ? (
        <>
          <motion.ellipse
            cx="620"
            cy="446"
            rx="182"
            ry="118"
            fill="rgba(184,228,255,0.05)"
            initial={{ opacity: 0.01 }}
            animate={reduceMotion ? undefined : { cx: [520, 890, 520], opacity: [0.01, 0.1, 0.01] }}
            transition={reduceMotion ? undefined : { duration: 9.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="804"
            cy="366"
            r="84"
            fill="rgba(77,163,255,0.05)"
            initial={{ opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: [0, 0.14, 0.02, 0], scale: [0.88, 1.04, 1, 0.92] }}
            transition={reduceMotion ? undefined : { duration: 8.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="520"
            cy="372"
            r="72"
            fill="rgba(52,211,153,0.045)"
            initial={{ opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: [0, 0.11, 0.02, 0], scale: [0.9, 1.06, 1, 0.94] }}
            transition={reduceMotion ? undefined : { duration: 7.4, delay: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      ) : null}

      <g>
        {visibleNodes.map((node, index) => (
          <motion.circle
            key={`halo-${node.cx}-${node.cy}`}
            cx={node.cx}
            cy={node.cy}
            r={index === 1 || index === 3 || index === 4 ? node.halo : node.halo - 2}
            fill={
              index === 1 || index === 3
                ? feature
                  ? 'rgba(77,163,255,0.12)'
                  : 'rgba(77,163,255,0.08)'
                : feature
                  ? 'rgba(52,211,153,0.1)'
                  : 'rgba(184,228,255,0.06)'
            }
            animate={reduceMotion ? undefined : { opacity: [0.08, 0.2, 0.08], scale: [1, 1.16, 1] }}
            transition={reduceMotion ? undefined : { duration: feature ? 4.2 : 5.8, delay: index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </g>

      <g fill="rgba(210,238,255,0.44)">
        {visibleNodes.map((node, index) => (
          <motion.circle
            key={`core-${node.cx}-${node.cy}`}
            cx={node.cx}
            cy={node.cy}
            r={index === 3 && feature ? 2.8 : node.core}
            animate={reduceMotion ? undefined : { opacity: [0.42, 0.95, 0.42] }}
            transition={reduceMotion ? undefined : { duration: feature ? 3.4 : 4.8, delay: index * 0.25, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </g>

      <g>
        {visibleRoutes.map((d, index) => (
          <g key={d}>
            <motion.path
              d={d}
              fill="none"
              stroke={`url(#route-line-${emphasis})`}
              strokeWidth={feature ? '1.4' : '1.15'}
              strokeLinecap="round"
              initial={{ pathLength: 0.02, opacity: 0.02 }}
              animate={reduceMotion ? { pathLength: 1, opacity: 0.22 } : { pathLength: 1, opacity: [0.14, 0.46, 0.14] }}
              transition={
                reduceMotion
                  ? { duration: 0.8, ease: 'easeOut' }
                  : { duration: feature ? 5.6 : 7.8, delay: index * 0.42, repeat: Infinity, ease: 'easeInOut' }
              }
            />
            {feature ? (
              <motion.path
                d={d}
                fill="none"
                stroke="rgba(210,255,236,0.72)"
                strokeWidth="1.6"
                strokeLinecap="round"
                pathLength={0.16}
                initial={{ pathOffset: 1, opacity: 0 }}
                animate={reduceMotion ? { pathOffset: 0.16, opacity: 0.22 } : { pathOffset: [1, 0.18, 0], opacity: [0, 0.72, 0] }}
                transition={
                  reduceMotion
                    ? { duration: 0.8, ease: 'easeOut' }
                    : { duration: 4.8 + index * 0.55, delay: 0.4 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }
                }
              />
            ) : null}
          </g>
        ))}
      </g>
    </svg>
  );
}
