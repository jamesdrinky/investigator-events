'use client';

import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

interface HomeWeeklyBriefProps {
  newlyAdded: EventItem[];
  upcoming: EventItem[];
  featured: EventItem[];
}

function buildTimelineItems(newlyAdded: EventItem[], upcoming: EventItem[], featured: EventItem[]) {
  return [
    {
      step: '01',
      label: 'Newly added',
      title: 'Fresh event intake',
      body: 'The latest approved events move into the live network and become discoverable immediately.',
      events: newlyAdded.slice(0, 2)
    },
    {
      step: '02',
      label: 'Upcoming',
      title: 'Approaching date windows',
      body: 'Use the timeline to scan which conferences and training events are getting close.',
      events: upcoming.slice(0, 2)
    },
    {
      step: '03',
      label: 'Featured',
      title: 'Priority network signals',
      body: 'Featured events stand out with stronger placement, clearer host branding, and faster access.',
      events: featured.slice(0, 2)
    }
  ];
}

export function HomeWeeklyBrief({ newlyAdded, upcoming, featured }: HomeWeeklyBriefProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'end 0.3']
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const items = buildTimelineItems(newlyAdded, upcoming, featured);

  return (
    <section
      ref={sectionRef}
      className="section-pad relative min-h-[100svh] overflow-hidden bg-[linear-gradient(180deg,#f5f9ff_0%,#fbfcff_46%,#f2fbff_100%)]"
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={
          reduceMotion
            ? undefined
            : {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }
        }
        transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          backgroundImage:
            'radial-gradient(circle at 16% 18%, rgba(37,99,235,0.08), transparent 18%), radial-gradient(circle at 84% 18%, rgba(124,58,237,0.06), transparent 16%), radial-gradient(circle at 72% 82%, rgba(6,182,212,0.06), transparent 18%)',
          backgroundSize: '160% 160%'
        }}
      />

      <div className="container-shell relative">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700">Weekly / Timeline</p>
          <h2 className="mt-3 max-w-3xl font-[var(--font-serif)] text-3xl leading-[1.02] text-slate-950 sm:text-4xl">
            Follow the event network as it updates, fills, and activates
          </h2>
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 132, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.58, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 h-1 rounded-full bg-[linear-gradient(90deg,#2563eb,#7c3aed,#06b6d4)]"
          />
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            This section turns weekly updates into a product moment: the line fills as you scroll, nodes activate, and each
            stage opens into live event detail.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[7rem_minmax(0,1fr)]">
          <div className="relative hidden lg:block">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-200" />
            <motion.div
              style={{ scaleY: lineScale }}
              className="absolute left-1/2 top-0 h-full w-[3px] origin-top -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#2563eb,#7c3aed,#06b6d4)] shadow-[0_0_24px_rgba(37,99,235,0.3)]"
            />
          </div>

          <div className="space-y-8">
            {items.map((item, index) => (
              <motion.article
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.56, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-[2rem] border border-white/80 bg-white/88 p-6 shadow-[0_30px_70px_-42px_rgba(37,99,235,0.18)] backdrop-blur-sm sm:p-7"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.08),transparent_22%),radial-gradient(circle_at_84%_18%,rgba(6,182,212,0.08),transparent_20%)]" />
                <div className="absolute -left-[3.7rem] top-8 hidden lg:flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white shadow-[0_24px_50px_-30px_rgba(37,99,235,0.22)]">
                  <motion.div
                    animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
                    transition={reduceMotion ? undefined : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed,#06b6d4)] text-xs font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.32)]"
                  >
                    {item.step}
                  </motion.div>
                </div>

                <div className="relative">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                      {item.label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Stage {item.step}
                    </span>
                  </div>
                  <h3 className="mt-4 font-[var(--font-serif)] text-3xl leading-[0.98] text-slate-950">{item.title}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{item.body}</p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {item.events.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${getEventSlug(event)}`}
                        className="group rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_-34px_rgba(37,99,235,0.18)]"
                      >
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-700">
                            {event.category}
                          </span>
                          <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                            {event.region}
                          </span>
                        </div>
                        <h4 className="mt-4 text-xl font-semibold leading-tight text-slate-950">{event.title}</h4>
                        <p className="mt-2 text-sm font-medium uppercase tracking-[0.16em] text-blue-700">
                          {formatEventDate(event)}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {event.city}, {event.country}
                        </p>
                        <p className="mt-3 text-sm text-slate-500">{event.association ?? event.organiser}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
