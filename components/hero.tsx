'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { WorldNetworkHeroVisual } from '@/components/global/world-network-hero-visual';

interface HeroProps {
  stats: {
    totalEvents: number;
    totalCountries: number;
    activeRegions: number;
    totalAssociations: number;
  };
  regions: Array<{
    name: string;
    eventCount: number;
    countryCount: number;
  }>;
}

export function Hero(_props: HeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-[linear-gradient(180deg,#040913_0%,#07101a_56%,#060b14_100%)]">
      <div className="container-shell relative z-10 grid min-h-[92svh] items-center gap-10 py-24 sm:py-28 lg:grid-cols-[minmax(0,0.98fr)_minmax(22rem,0.82fr)] lg:gap-12 lg:py-32">
        <div className="relative max-w-[42rem]">
          <div className="pointer-events-none absolute left-[-4rem] top-1/2 h-[18rem] w-[26rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(42,155,255,0.16),rgba(42,155,255,0.05)_36%,transparent_70%)] opacity-90" />
          <motion.div
            className="relative inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-100 backdrop-blur-sm sm:text-[11px]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Global Event Intelligence
          </motion.div>
          <motion.h1
            className="relative mt-6 max-w-[11ch] font-[var(--font-serif)] text-5xl leading-[0.9] text-white [text-wrap:balance] sm:text-6xl lg:text-[5.8rem]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{ textShadow: '0 22px 54px rgba(0,0,0,0.44)' }}
          >
            Discover investigator events across the world
          </motion.h1>

          <motion.p
            className="relative mt-5 max-w-xl text-base text-slate-100 sm:text-lg"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
          >
            Conferences, training, and association events on one global platform.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14 }}
          >
            <Link href="/calendar" className="btn-primary min-w-[11rem] px-7 py-3.5">
              Explore Calendar
            </Link>
            <Link
              href="/submit-event"
              className="inline-flex min-w-[11rem] items-center justify-center rounded-full border border-white/16 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-white/[0.06] hover:text-cyan-100"
            >
              Submit an Event
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.6, delay: 0.12 }}
        >
          <WorldNetworkHeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
