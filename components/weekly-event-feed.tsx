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
    <section className="surface-flat relative overflow-hidden p-4 sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(77,163,255,0.14),transparent_26%)]" />
      <div className="relative">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-white">{title}</h2>

        {events.length === 0 ? (
          <p className="mt-5 text-sm text-slate-300">{emptyText}</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="surface-elevated group rounded-[1.45rem] px-4 py-4"
              >
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300">
                        <CategoryIcon category={event.category} />
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.18em]">{event.category}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white transition-colors duration-300 group-hover:text-accent2">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">{formatEventDate(event)}</p>
                    <p className="mt-2 text-sm text-slate-400">{event.city}, {event.country}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="country-chip">
                        <span>{getCountryFlag(event.country)}</span>
                        <span>{event.country}</span>
                      </span>
                      <SaveDateLinks event={event} compact />
                      <Link
                        href={`/events/${getEventSlug(event)}`}
                        className="inline-flex rounded-full border border-white/12 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
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
                      coverImage={event.coverImage}
                      coverImageAlt={event.coverImageAlt}
                      compact
                    />
                  </div>
                </div>
                {event.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{event.description}</p>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
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
