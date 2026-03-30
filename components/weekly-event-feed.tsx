import Link from 'next/link';
import { CategoryIcon } from '@/components/category-icon';
import { EventCoverMedia } from '@/components/event-cover-media';
import { SaveDateLinks } from '@/components/save-date-links';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';
import { getCountryFlag } from '@/lib/utils/location';

interface WeeklyEventFeedProps {
  title: string;
  eyebrow?: string;
  events: EventItem[];
  emptyText: string;
}

export function WeeklyEventFeed({ title, eyebrow, events, emptyText }: WeeklyEventFeedProps) {
  return (
    <section className="relative overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white/96 p-4 shadow-[0_24px_54px_-34px_rgba(15,23,42,0.18)] sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(77,163,255,0.1),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0),rgba(224,242,254,0.24))]" />
      <div className="relative">
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-700">{eyebrow}</p> : null}
        <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">{title}</h2>

        {events.length === 0 ? (
          <p className="mt-5 text-sm text-slate-600">{emptyText}</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="group rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f0f9ff_100%)] px-4 py-4 shadow-[0_18px_40px_-34px_rgba(14,116,144,0.18)]"
              >
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_14px_24px_-16px_rgba(15,23,42,0.42)]">
                        <CategoryIcon category={event.category} />
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.18em]">{event.category}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950 transition-colors duration-300 group-hover:text-sky-700">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-sky-700">{formatEventDate(event)}</p>
                    <p className="mt-2 text-sm text-slate-600">{event.city}, {event.country}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-700">
                        <span>{getCountryFlag(event.country)}</span>
                        <span>{event.country}</span>
                      </span>
                      <SaveDateLinks event={event} compact />
                      <Link
                        href={`/events/${getEventSlug(event)}`}
                        className="inline-flex rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-sky-700"
                      >
                        Open event
                      </Link>
                    </div>
                  </div>
                  <div className="md:pl-2">
                    <EventCoverMedia
                      title={event.title}
                      city={event.city}
                      country={event.country}
                      region={event.region}
                      category={event.category}
                      imagePath={event.image_path}
                      coverImage={event.coverImage}
                      coverImageAlt={event.coverImageAlt}
                      associationName={event.association ?? event.organiser}
                      compact
                    />
                  </div>
                </div>
                {event.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{event.description}</p>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Open the event record for dates, location, organiser information, and the official source link.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
