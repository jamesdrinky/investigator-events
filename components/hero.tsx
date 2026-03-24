'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { EventItem } from '@/lib/data/events';
import { HeroSearchDemoPanel } from '@/components/hero-search-demo-panel';

interface HeroProps {
  stats: {
    totalEvents: number;
    totalCountries: number;
    activeRegions: number;
    totalAssociations: number;
  };
  months: string[];
  regions: string[];
  associations: string[];
  demos: Array<{
    query: string;
    event: EventItem;
  }>;
}

export function Hero({ stats, months, regions, associations, demos }: HeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eef5ff_38%,#fbfcff_100%)]">
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={
          reduceMotion
            ? undefined
            : {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }
        }
        transition={reduceMotion ? undefined : { duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 16%, rgba(37,99,235,0.14), transparent 22%), radial-gradient(circle at 82% 18%, rgba(124,58,237,0.12), transparent 18%), radial-gradient(circle at 72% 80%, rgba(6,182,212,0.1), transparent 18%), radial-gradient(circle at 50% 100%, rgba(236,72,153,0.08), transparent 18%)',
          backgroundSize: '160% 160%'
        }}
      />

      <div className="pointer-events-none absolute left-[6%] top-[12%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.16),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[16%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.14),transparent_72%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] right-[14%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12),transparent_72%)] blur-3xl" />

      <div className="container-shell relative grid min-h-[100svh] gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.96fr)_minmax(24rem,1.04fr)] lg:items-center lg:py-24">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-700"
          >
            Investigator Events
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-[10ch] font-[var(--font-serif)] text-4xl leading-[0.92] text-slate-950 sm:text-5xl lg:text-[5rem]"
          >
            Discover the global investigator event network
          </motion.h1>

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 140, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 h-1 rounded-full bg-[linear-gradient(90deg,#2563eb,#7c3aed,#06b6d4)]"
          />

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
          >
            Search conferences, training, and association activity through a brighter product interface built to feel alive,
            global, and fast to explore.
          </motion.p>

          <motion.form
            action="/calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 rounded-[2rem] border border-white/80 bg-white/88 p-4 shadow-[0_34px_90px_-50px_rgba(37,99,235,0.28)] backdrop-blur-sm sm:p-5"
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.8fr))_auto]">
              <label className="sr-only" htmlFor="hero-search">
                Search events
              </label>
              <input
                id="hero-search"
                type="search"
                name="search"
                placeholder="Search events, cities, or associations"
                className="h-12 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />

              <label className="sr-only" htmlFor="hero-month">
                Month
              </label>
              <select
                id="hero-month"
                name="month"
                defaultValue=""
                className="h-12 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Any month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="hero-region">
                Region
              </label>
              <select
                id="hero-region"
                name="region"
                defaultValue=""
                className="h-12 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Any region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="hero-association">
                Association
              </label>
              <select
                id="hero-association"
                name="association"
                defaultValue=""
                className="h-12 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Any association</option>
                {associations.map((association) => (
                  <option key={association} value={association}>
                    {association}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed,#06b6d4)] px-6 text-sm font-semibold text-white shadow-[0_18px_30px_-18px_rgba(37,99,235,0.55)] transition hover:-translate-y-0.5"
              >
                Search
              </button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <Link href="/calendar" className="btn-primary px-6 py-3">
              Browse all events
            </Link>
            <Link href="/submit-event" className="btn-secondary px-6 py-3">
              Submit event
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 grid gap-3 sm:grid-cols-3 xl:max-w-2xl"
          >
            <div className="rounded-[1.35rem] border border-blue-100 bg-blue-50/80 px-4 py-4 shadow-[0_16px_32px_-24px_rgba(37,99,235,0.22)]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-blue-700">Live events</p>
              <p className="mt-2 font-[var(--font-serif)] text-3xl text-slate-950">{stats.totalEvents}</p>
            </div>
            <div className="rounded-[1.35rem] border border-violet-100 bg-violet-50/80 px-4 py-4 shadow-[0_16px_32px_-24px_rgba(124,58,237,0.18)]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-violet-700">Countries</p>
              <p className="mt-2 font-[var(--font-serif)] text-3xl text-slate-950">{stats.totalCountries}</p>
            </div>
            <div className="rounded-[1.35rem] border border-cyan-100 bg-cyan-50/80 px-4 py-4 shadow-[0_16px_32px_-24px_rgba(8,145,178,0.18)]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-700">Active regions</p>
              <p className="mt-2 font-[var(--font-serif)] text-3xl text-slate-950">{stats.activeRegions}</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <HeroSearchDemoPanel demos={demos} />
        </motion.div>
      </div>
    </section>
  );
}
