import Link from 'next/link';
import { CategoryIcon } from '@/components/category-icon';
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
    <section className="lux-panel relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(77,163,255,0.1),transparent_26%)]" />
      <div className="relative">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-white">{title}</h2>

        {events.length === 0 ? (
          <p className="mt-5 text-sm text-slate-300">{emptyText}</p>
        ) : (
          <div className="mt-5 grid gap-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${getEventSlug(event)}`}
                className="group rounded-[1.45rem] border border-white/10 bg-white/[0.025] px-4 py-4 transition duration-300 hover:-translate-y-0.5 hover:border-signal/30 hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between gap-4">
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
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 justify-end">
                    <span className="country-chip">
                      <span>{getCountryFlag(event.country)}</span>
                      <span>{event.country}</span>
                    </span>
                  </div>
                </div>
                {event.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{event.description}</p>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    Open the event record for dates, location, organiser information, and the official source link.
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
