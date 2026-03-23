import Link from 'next/link';
import { EventCoverMedia } from '@/components/event-cover-media';
import { WeeklyEventFeed } from '@/components/weekly-event-feed';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';
import { getCountryFlag } from '@/lib/utils/location';

interface HomeWeeklyBriefProps {
  newlyAdded: EventItem[];
  upcoming: EventItem[];
  featured: EventItem[];
}

export function HomeWeeklyBrief({ newlyAdded, upcoming, featured }: HomeWeeklyBriefProps) {
  const leadEvent = featured[0] ?? upcoming[0] ?? newlyAdded[0] ?? null;

  return (
    <section className="section-pad section-open relative overflow-hidden pt-1">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_26%,rgba(33,150,255,0.14),transparent_22%)]" />
      <div className="container-shell">
        <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(20,36,56,0.74),rgba(9,17,28,0.84))] p-5 sm:p-6 lg:p-8">
          <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(33,150,255,0.16),transparent_26%)]" />

          <div className="relative">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-3xl">
                <p className="eyebrow">This Week in Investigator Events</p>
                <h2 className="section-title">A brighter briefing surface for new listings, approaching dates, and one event worth opening now</h2>
              </div>
              <Link href="/weekly" className="btn-secondary px-5 py-2.5">
                View Full Weekly Brief
              </Link>
            </div>

            <div className="grid items-start gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-4">
                <WeeklyEventFeed
                  eyebrow="Freshly Added"
                  title="Newly added events"
                  events={newlyAdded.slice(0, 3)}
                  emptyText="No new events have been added in the last seven days."
                />
                <WeeklyEventFeed
                  eyebrow="Approaching Windows"
                  title="Upcoming within 30 days"
                  events={upcoming.slice(0, 3)}
                  emptyText="No events are approaching in the next 30 days."
                />
              </div>

              <article className="surface-elevated relative self-start overflow-hidden p-5 sm:p-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(33,150,255,0.14),transparent_28%)]" />
                <div className="relative">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-sky-200">Notable Event</p>
                  {leadEvent ? (
                    <>
                      <div className="mt-4">
                        <EventCoverMedia
                          title={leadEvent.title}
                          city={leadEvent.city}
                          country={leadEvent.country}
                          region={leadEvent.region}
                          category={leadEvent.category}
                          coverImage={leadEvent.coverImage}
                          coverImageAlt={leadEvent.coverImageAlt}
                          compact
                          priorityLabel="Destination signal"
                        />
                      </div>
                      <h3 className="mt-4 font-[var(--font-serif)] text-4xl leading-tight text-white">{leadEvent.title}</h3>
                      <p className="mt-4 flex flex-wrap items-center gap-2 text-sm uppercase tracking-[0.18em] text-slate-300">
                        <span className="country-chip">
                          <span>{getCountryFlag(leadEvent.country)}</span>
                          <span>{leadEvent.country}</span>
                        </span>
                        <span className="global-chip">{leadEvent.region}</span>
                      </p>
                      <p className="mt-2 text-sm text-slate-300">{formatEventDate(leadEvent)}</p>
                      {leadEvent.description ? (
                        <p className="mt-4 text-sm leading-relaxed text-slate-300">{leadEvent.description}</p>
                      ) : (
                        <p className="mt-4 text-sm leading-relaxed text-slate-300">
                          Open the event record for location details, organiser information, and the official source link.
                        </p>
                      )}
                      <div className="mt-6 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/14 px-3 py-1 text-xs font-medium text-sky-200">
                          {leadEvent.category}
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-slate-400">
                        {leadEvent.city}, {leadEvent.country} · Organiser: {leadEvent.organiser}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link href="/weekly" className="btn-primary px-5 py-2.5">
                          Read Weekly Brief
                        </Link>
                        <Link href={`/events/${getEventSlug(leadEvent)}`} className="btn-secondary px-5 py-2.5">
                          Open Event Detail
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="mt-4 text-sm text-slate-700">No notable live event is available for this brief yet.</p>
                  )}
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
