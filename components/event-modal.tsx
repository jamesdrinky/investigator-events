'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { EventCoverMedia } from '@/components/event-cover-media';
import { SaveDateLinks } from '@/components/save-date-links';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

interface EventModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export function EventModal({ event, onClose }: EventModalProps) {
  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/78 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={`${event.title} details`}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.article
            className="surface-elevated max-h-[90vh] w-full max-w-xl overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 28, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.33, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs text-sky-700">{event.category}</span>
                <h3 className="mt-3 font-[var(--font-serif)] text-3xl leading-tight text-slate-950">{event.title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                Close
              </button>
            </div>

            <div className="mt-5">
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
              />
            </div>

            <dl className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Dates</dt>
                <dd>{formatEventDate(event)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Location</dt>
                <dd>
                  {event.city}, {event.country}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Region</dt>
                <dd>{event.region}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Organiser</dt>
                <dd>{event.organiser}</dd>
              </div>
            </dl>

            {event.description ? (
              <p className="mt-5 text-sm leading-relaxed text-slate-600">{event.description}</p>
            ) : (
              <p className="mt-5 text-sm leading-relaxed text-slate-600">
                Open the full event page for the official source link and the rest of the live event record.
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={event.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-5 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100"
              >
                Open Official Website
              </a>
              <Link
                href={`/events/${getEventSlug(event)}`}
                className="inline-flex rounded-full border border-slate-200 px-5 py-2 text-sm text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                Open Event Page
              </Link>
              <SaveDateLinks event={event} />
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
