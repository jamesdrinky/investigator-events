'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { EventCoverMedia } from '@/components/event-cover-media';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

interface HeroSearchDemoPanelProps {
  demos: Array<{
    query: string;
    event: EventItem;
  }>;
}

export function HeroSearchDemoPanel({ demos }: HeroSearchDemoPanelProps) {
  const reduceMotion = useReducedMotion();
  const [demoIndex, setDemoIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const activeDemo = demos.length > 0 ? demos[demoIndex % demos.length] : null;
  const typedQuery = activeDemo?.query.slice(0, typedLength) ?? '';

  useEffect(() => {
    if (!activeDemo || demos.length === 0) {
      return;
    }

    if (typedLength < activeDemo.query.length) {
      const timeout = window.setTimeout(() => setTypedLength((length) => length + 1), 40);
      return () => window.clearTimeout(timeout);
    }

    if (!showResult) {
      const timeout = window.setTimeout(() => setShowResult(true), 280);
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setShowResult(false);
      setTypedLength(0);
      setDemoIndex((index) => (index + 1) % demos.length);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [activeDemo, demos.length, showResult, typedLength]);

  const networkNodes = useMemo(
    () => [
      { left: '14%', top: '22%', color: 'bg-blue-500' },
      { left: '34%', top: '18%', color: 'bg-violet-500' },
      { left: '56%', top: '28%', color: 'bg-cyan-500' },
      { left: '78%', top: '24%', color: 'bg-pink-500' },
      { left: '68%', top: '58%', color: 'bg-emerald-500' },
      { left: '40%', top: '64%', color: 'bg-sky-500' },
      { left: '22%', top: '56%', color: 'bg-blue-500' }
    ],
    []
  );

  if (!activeDemo) {
    return null;
  }

  return (
    <div className="relative min-h-[34rem] rounded-[2.4rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(241,247,255,0.94)_48%,rgba(247,250,255,0.98))] p-5 shadow-[0_44px_110px_-56px_rgba(37,99,235,0.3)] backdrop-blur-sm sm:min-h-[38rem] sm:p-6">
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[2.4rem]"
        animate={
          reduceMotion
            ? undefined
            : {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }
        }
        transition={reduceMotion ? undefined : { duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          backgroundImage:
            'radial-gradient(circle at 16% 18%, rgba(37,99,235,0.14), transparent 20%), radial-gradient(circle at 82% 18%, rgba(124,58,237,0.12), transparent 18%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.12), transparent 18%), radial-gradient(circle at 50% 100%, rgba(236,72,153,0.1), transparent 18%)',
          backgroundSize: '160% 160%'
        }}
      />

      <div className="pointer-events-none absolute inset-5 rounded-[2rem] border border-white/70 bg-white/38" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.4rem]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-60" aria-hidden="true">
          <defs>
            <linearGradient id="demo-grid-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(37,99,235,0.12)" />
              <stop offset="100%" stopColor="rgba(6,182,212,0.12)" />
            </linearGradient>
          </defs>
          <path d="M12 24 Q34 8 56 28 T84 24" fill="none" stroke="url(#demo-grid-line)" strokeWidth="0.5" />
          <path d="M18 58 Q42 44 66 58 T88 52" fill="none" stroke="url(#demo-grid-line)" strokeWidth="0.5" />
          <path d="M22 28 Q32 54 42 66 T72 62" fill="none" stroke="url(#demo-grid-line)" strokeWidth="0.5" />
        </svg>

        {networkNodes.map((node, index) => (
          <motion.span
            key={`${node.left}-${node.top}`}
            className={`absolute h-3 w-3 rounded-full ${node.color} shadow-[0_0_26px_rgba(37,99,235,0.55)]`}
            style={{ left: node.left, top: node.top }}
            animate={reduceMotion ? undefined : { scale: [1, 1.35, 1], opacity: [0.45, 0.95, 0.45] }}
            transition={reduceMotion ? undefined : { duration: 2.8 + index * 0.16, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full min-h-[30rem] flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-white/80 bg-white/88 px-4 py-3 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.22)]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Live search</span>
            <span className="rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed,#06b6d4)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
              Interactive demo
            </span>
          </div>

          <div className="mt-4 rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-[0_24px_56px_-36px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-400">Search</span>
              <span className="min-h-[1.5rem] text-sm font-medium text-slate-700">
                {typedQuery}
                <motion.span
                  className="ml-0.5 inline-block h-4 w-px bg-slate-500 align-middle"
                  animate={reduceMotion ? undefined : { opacity: [1, 0, 1] }}
                  transition={reduceMotion ? undefined : { duration: 0.9, repeat: Infinity }}
                />
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showResult ? (
            <motion.div
              key={activeDemo.query}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 rounded-[1.9rem] border border-white/85 bg-white/92 p-4 shadow-[0_34px_80px_-44px_rgba(15,23,42,0.2)]"
            >
              <div className="grid gap-4 md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                <EventCoverMedia
                  title={activeDemo.event.title}
                  city={activeDemo.event.city}
                  country={activeDemo.event.country}
                  region={activeDemo.event.region}
                  category={activeDemo.event.category}
                  coverImage={activeDemo.event.coverImage}
                  coverImageAlt={activeDemo.event.coverImageAlt}
                  associationName={activeDemo.event.association ?? activeDemo.event.organiser}
                  featured={activeDemo.event.featured}
                  compact
                  className="h-[15rem]"
                />
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                        {activeDemo.event.category}
                      </span>
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-700">
                        {activeDemo.event.region}
                      </span>
                    </div>
                    <h3 className="mt-4 font-[var(--font-serif)] text-3xl leading-[0.96] text-slate-950">
                      {activeDemo.event.title}
                    </h3>
                    <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-blue-700">
                      {formatEventDate(activeDemo.event)}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {activeDemo.event.city}, {activeDemo.event.country}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      Association-led event discovery surfaced through one premium search interface.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/events/${getEventSlug(activeDemo.event)}`}
                      className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed,#06b6d4)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(37,99,235,0.48)]"
                    >
                      Open event
                    </Link>
                    <Link
                      href="/calendar"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
                    >
                      View all results
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 rounded-[1.8rem] border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500"
            >
              Typing search query and preparing a highlighted result...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
