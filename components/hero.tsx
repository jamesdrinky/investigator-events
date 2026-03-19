'use client';

import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { WorldNetworkHeroVisual } from '@/components/global/world-network-hero-visual';
import type { RegionCoverage } from '@/lib/utils/coverage';

interface HeroProps {
  stats: {
    totalEvents: number;
    totalCountries: number;
    activeRegions: number;
  };
  regions: RegionCoverage[];
}

const regionStyles: Record<string, { border: string; background: string; text: string; dot: string }> = {
  'North America': {
    border: 'rgba(54,168,255,0.3)',
    background: 'rgba(54,168,255,0.12)',
    text: '#cfe9ff',
    dot: '#36a8ff'
  },
  Europe: {
    border: 'rgba(142,109,255,0.28)',
    background: 'rgba(142,109,255,0.12)',
    text: '#eadfff',
    dot: '#8e6dff'
  },
  'Middle East': {
    border: 'rgba(255,177,74,0.28)',
    background: 'rgba(255,177,74,0.12)',
    text: '#ffe2b8',
    dot: '#ffb14a'
  },
  'Asia-Pacific': {
    border: 'rgba(36,212,199,0.28)',
    background: 'rgba(36,212,199,0.12)',
    text: '#d6fff9',
    dot: '#24d4c7'
  },
  'Latin America': {
    border: 'rgba(255,104,203,0.28)',
    background: 'rgba(255,104,203,0.12)',
    text: '#ffd8f1',
    dot: '#ff68cb'
  },
  Africa: {
    border: 'rgba(255,209,102,0.28)',
    background: 'rgba(255,209,102,0.12)',
    text: '#fff0bf',
    dot: '#ffd166'
  }
};

export function Hero({ stats, regions }: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const activeRegions = regions.filter((region) => region.eventCount > 0).slice(0, 4);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 110, damping: 24, mass: 0.2 });
  const contentY = useTransform(smoothProgress, [0, 1], [0, reduceMotion ? 0 : -90]);
  const contentOpacity = useTransform(smoothProgress, [0, 0.9], [1, reduceMotion ? 1 : 0.82]);
  const visualY = useTransform(smoothProgress, [0, 1], [0, reduceMotion ? 0 : 48]);
  const visualScale = useTransform(smoothProgress, [0, 1], [1, reduceMotion ? 1 : 0.965]);
  const footerY = useTransform(smoothProgress, [0, 1], [0, reduceMotion ? 0 : -26]);
  const footerOpacity = useTransform(smoothProgress, [0, 1], [1, reduceMotion ? 1 : 0.9]);

  return (
    <section ref={sectionRef} className="relative min-h-[100svh] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: visualY, scale: visualScale }}>
        <WorldNetworkHeroVisual />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.2),rgba(4,7,11,0.06)_18%,rgba(4,7,11,0.22)_42%,rgba(4,7,11,0.78)_78%,rgba(4,7,11,0.96)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[34%] h-[24rem] w-[42rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(4,7,11,0.56),rgba(4,7,11,0.3)_42%,rgba(4,7,11,0)_74%)] blur-xl" />

      <div className="container-shell relative z-10 flex min-h-[100svh] flex-col justify-between pb-8 pt-24 sm:pb-10 sm:pt-28 lg:pt-32">
        <motion.div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center" style={{ y: contentY, opacity: contentOpacity }}>
          <motion.p
            className="eyebrow text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Investigator Events Worldwide
          </motion.p>

          <motion.h1
            className="mx-auto mt-5 max-w-5xl text-center font-[var(--font-serif)] text-5xl leading-[0.92] text-white sm:text-6xl lg:text-[6.5rem]"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            Discover investigator events across the world
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-slate-200 sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.14 }}
          >
            Follow conferences, training events, and association meetings by city and region, then submit new events into
            the global review queue.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.22 }}
          >
            <Link href="/calendar" className="btn-primary min-w-[11rem]">
              Explore Calendar
            </Link>
            <Link href="/submit-event" className="btn-secondary min-w-[11rem]">
              Submit an Event
            </Link>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: footerY, opacity: footerOpacity }}>
          <motion.div
            className="mt-2 grid gap-3 sm:grid-cols-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, delay: 0.34 }}
          >
            <article className="rounded-[1.2rem] border border-white/10 bg-black/18 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Countries</p>
            <p className="mt-2 text-lg font-semibold text-white">{stats.totalCountries}</p>
            </article>
            <article className="rounded-[1.2rem] border border-white/10 bg-black/18 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Regions</p>
            <p className="mt-2 text-lg font-semibold text-white">{stats.activeRegions}</p>
            </article>
            <article className="rounded-[1.2rem] border border-white/10 bg-black/18 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Live events</p>
            <p className="mt-2 text-lg font-semibold text-white">{stats.totalEvents}</p>
            </article>
          </motion.div>

          <motion.div
            className="mt-4 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.42 }}
          >
            {activeRegions.map((region) => (
              <div
                key={region.name}
                className="inline-flex items-center gap-3 rounded-full border px-3 py-2"
                style={{
                  borderColor: regionStyles[region.name]?.border ?? 'rgba(215,238,255,0.18)',
                  backgroundColor: regionStyles[region.name]?.background ?? 'rgba(255,255,255,0.06)',
                  color: regionStyles[region.name]?.text ?? '#f8fbff',
                  boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.03), 0 8px 22px -18px ${regionStyles[region.name]?.dot ?? '#36a8ff'}44`
                }}
              >
                <motion.span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: regionStyles[region.name]?.dot ?? '#36a8ff',
                    boxShadow: `0 0 0 0 ${regionStyles[region.name]?.dot ?? '#36a8ff'}00`
                  }}
                  animate={{
                    opacity: [0.65, 1, 0.65],
                    boxShadow: [
                      `0 0 0 0 ${regionStyles[region.name]?.dot ?? '#36a8ff'}00`,
                      `0 0 14px 2px ${regionStyles[region.name]?.dot ?? '#36a8ff'}55`,
                      `0 0 0 0 ${regionStyles[region.name]?.dot ?? '#36a8ff'}00`
                    ]
                  }}
                  transition={{ duration: 4.6, delay: region.eventCount * 0.08, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="flex flex-col leading-none">
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em]">{region.name}</span>
                  <span className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/58">Regional activity</span>
                </span>
                <span className="ml-1 h-8 w-px bg-white/10" />
                <span className="flex flex-col leading-none">
                  <span className="text-sm font-semibold text-white">{region.eventCount}</span>
                  <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/58">Live</span>
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
