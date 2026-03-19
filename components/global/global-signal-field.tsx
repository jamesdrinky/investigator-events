'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface GlobalSignalFieldProps {
  className?: string;
}

const routes = [
  'M 120 520 C 290 336 468 270 654 286 C 844 302 1020 370 1280 184',
  'M 84 642 C 276 446 466 360 664 364 C 860 368 1036 436 1288 290',
  'M 208 292 C 392 418 568 470 742 454 C 928 438 1086 346 1300 398',
  'M 246 696 C 398 560 568 492 760 494 C 944 496 1102 548 1294 456',
  'M 64 414 C 218 324 372 294 530 316 C 696 340 850 388 1028 368 C 1180 350 1284 270 1360 200'
];

const nodes = [
  { x: 120, y: 520, major: false },
  { x: 308, y: 372, major: true },
  { x: 520, y: 302, major: false },
  { x: 654, y: 286, major: true },
  { x: 760, y: 494, major: false },
  { x: 936, y: 374, major: true },
  { x: 1124, y: 272, major: false },
  { x: 1200, y: 446, major: true },
  { x: 1294, y: 456, major: false }
];

export function GlobalSignalField({ className = '' }: GlobalSignalFieldProps) {
  const reduceMotion = useReducedMotion();

  return (
    <svg viewBox="0 0 1400 760" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="signalRoute" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(79,143,190,0)" />
          <stop offset="35%" stopColor="rgba(79,143,190,0.46)" />
          <stop offset="68%" stopColor="rgba(82,183,136,0.38)" />
          <stop offset="100%" stopColor="rgba(82,183,136,0)" />
        </linearGradient>
        <radialGradient id="signalGlow" cx="50%" cy="72%" r="42%">
          <stop offset="0%" stopColor="rgba(185,221,247,0.14)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="700" cy="648" rx="760" ry="292" fill="url(#signalGlow)" opacity="1" />

      <g fill="none" stroke="rgba(185,221,247,0.2)" strokeWidth="1.2">
        <path d="M-12 648C-12 452 306 298 700 298C1094 298 1412 452 1412 648" />
        <path d="M70 648C70 488 348 360 700 360C1052 360 1330 488 1330 648" />
        <path d="M168 648C168 526 402 430 700 430C998 430 1232 526 1232 648" />
        <path d="M274 648C274 560 462 490 700 490C938 490 1126 560 1126 648" />
        <path d="M392 648C392 590 530 544 700 544C870 544 1008 590 1008 648" />
      </g>

      <g fill="none" stroke="rgba(139,195,164,0.16)" strokeWidth="1">
        <path d="M700 648C700 522 700 418 700 298" />
        <path d="M512 648C488 532 494 436 526 350" />
        <path d="M888 648C912 532 906 436 874 350" />
        <path d="M348 648C314 560 318 474 352 404" className="hidden sm:block" />
        <path d="M1052 648C1086 560 1082 474 1048 404" className="hidden sm:block" />
      </g>

      <motion.ellipse
        cx="520"
        cy="566"
        rx="258"
        ry="148"
        fill="rgba(79,143,190,0.06)"
        animate={reduceMotion ? undefined : { cx: [460, 980, 460], opacity: [0.03, 0.11, 0.03] }}
        transition={reduceMotion ? undefined : { duration: 10.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <g>
        {routes.map((d, index) => (
          <g key={d} className={index > 3 ? 'hidden sm:block' : ''}>
            <motion.path
              d={d}
              fill="none"
              stroke="url(#signalRoute)"
              strokeWidth={index < 2 ? 2.4 : 1.9}
              strokeLinecap="round"
              initial={{ pathLength: 0.04, opacity: 0.06 }}
              animate={reduceMotion ? { pathLength: 1, opacity: 0.34 } : { pathLength: 1, opacity: [0.18, 0.62, 0.18] }}
              transition={
                reduceMotion
                  ? { duration: 0.8, ease: 'easeOut' }
                  : { duration: 5.8 + index * 0.45, delay: index * 0.36, repeat: Infinity, ease: 'easeInOut' }
              }
            />
            <motion.path
              d={d}
              fill="none"
              stroke="rgba(210,255,236,0.82)"
              strokeWidth="2.35"
              strokeLinecap="round"
              pathLength={0.12}
              initial={{ pathOffset: 1, opacity: 0 }}
              animate={reduceMotion ? { pathOffset: 0.22, opacity: 0.26 } : { pathOffset: [1, 0.22, 0], opacity: [0, 1, 0] }}
              transition={
                reduceMotion
                  ? { duration: 0.8, ease: 'easeOut' }
                  : { duration: 4.4 + index * 0.35, delay: 0.3 + index * 0.28, repeat: Infinity, ease: 'easeInOut' }
              }
            />
          </g>
        ))}
      </g>

      <g>
        {nodes.map((node, index) => (
          <g key={`${node.x}-${node.y}`} className={index > 6 ? 'hidden sm:block' : ''}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.major ? 22 : 14}
              fill={node.major ? 'rgba(82,183,136,0.12)' : 'rgba(79,143,190,0.07)'}
              animate={reduceMotion ? undefined : { opacity: [0.06, node.major ? 0.24 : 0.14, 0.06], scale: [1, 1.22, 1] }}
              transition={reduceMotion ? undefined : { duration: node.major ? 3.6 : 4.8, delay: index * 0.22, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.major ? 3.8 : 2.6}
              fill={node.major ? 'rgba(203,238,219,0.92)' : 'rgba(185,221,247,0.78)'}
              animate={reduceMotion ? undefined : { opacity: [0.42, 1, 0.42] }}
              transition={reduceMotion ? undefined : { duration: node.major ? 2.8 : 4.2, delay: index * 0.18, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
