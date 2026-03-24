'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { EventCoverMedia } from '@/components/event-cover-media';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';
import { getCountryFlag } from '@/lib/utils/location';

interface DayPreviewModalProps {
  date: string | null;
  events: EventItem[];
  onClose: () => void;
  onPreviewEvent: (event: EventItem) => void;
}

const dayDetailFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
});

export function DayPreviewModal({ date, events, onClose, onPreviewEvent }: DayPreviewModalProps) {
  const open = Boolean(date && events.length > 0);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[72] flex items-end justify-center bg-slate-950/78 p-3 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={date ? `Events on ${dayDetailFormatter.format(new Date(`${date}T00:00:00Z`))}` : 'Selected date events'}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.article
            className="surface-elevated max-h-[88vh] w-full max-w-4xl overflow-y-auto p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 20, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 14, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Day Preview</p>
                <h3 className="mt-3 font-[var(--font-serif)] text-3xl text-white">
                  {date ? dayDetailFormatter.format(new Date(`${date}T00:00:00Z`)) : ''}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  {events.length} live {events.length === 1 ? 'event' : 'events'} active on this date
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/16 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/[0.06]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {events.map((event) => (
                <article
                  key={`${date}-${event.id}`}
                  className="surface-flat p-4 sm:p-5"
                >
                  <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
                    <EventCoverMedia
                      title={event.title}
                      city={event.city}
                      country={event.country}
                      region={event.region}
                      category={event.category}
                      coverImage={event.coverImage}
                      coverImageAlt={event.coverImageAlt}
                      associationName={event.association ?? event.organiser}
                      featured={event.featured}
                      compact
                      priorityLabel={event.featured ? 'Featured event' : event.category}
                    />

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{formatEventDate(event)}</p>
                          <h4 className="mt-2 text-2xl font-semibold leading-tight text-white">{event.title}</h4>
                        </div>
                        <span className="country-chip shrink-0">
                          <span>{getCountryFlag(event.country)}</span>
                          <span>{event.country}</span>
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="city-chip">{event.city}</span>
                        <span className="global-chip">{event.region}</span>
                        <span className="city-chip">{event.association ?? event.organiser}</span>
                        <span className="city-chip">{event.category}</span>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-slate-300">
                        {event.description || 'Open the full event record for organiser details, dates, and the official source link.'}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button type="button" onClick={() => onPreviewEvent(event)} className="btn-primary px-5 py-2.5">
                          Preview event
                        </button>
                        <Link href={`/events/${getEventSlug(event)}`} className="btn-secondary px-5 py-2.5">
                          Open event page
                        </Link>
                        <a
                          href={event.website}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-white/16 px-5 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.06]"
                        >
                          Visit website
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
