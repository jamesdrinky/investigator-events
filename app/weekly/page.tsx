import Link from 'next/link';
import { PageAtmosphere } from '@/components/global/page-atmosphere';
import { LocationSignature } from '@/components/location-signature';
import { Reveal } from '@/components/motion/reveal';
import { WeeklyEventFeed } from '@/components/weekly-event-feed';
import { fetchAllEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';
import { getCountryFlag } from '@/lib/utils/location';

export const dynamic = 'force-dynamic';

export default async function WeeklyPage() {
  const events = await fetchAllEvents();
  const weekly = getWeeklyCollections(events);
  const leadEvent = weekly.featured[0] ?? weekly.upcoming[0] ?? null;

  return (
    <section className="section-pad relative overflow-hidden">
      <PageAtmosphere />
      <div className="container-shell space-y-8">
        <Reveal>
          <header className="lux-panel relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 intel-grid opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(200,173,127,0.08),transparent_28%),radial-gradient(circle_at_84%_24%,rgba(255,255,255,0.04),transparent_24%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <p className="eyebrow">Weekly Brief</p>
                <h1 className="section-title">This Week in Investigator Events</h1>
                <p className="section-copy max-w-3xl">
                  A weekly view of newly approved events, the next upcoming dates, and one notable live event worth
                  checking this week.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-accent">Newly Added</p>
                  <p className="mt-2 text-sm text-slate-200">{weekly.newlyAdded.length} event listings entered the platform in the last 7 days.</p>
                </article>
                <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-accent">Upcoming Windows</p>
                  <p className="mt-2 text-sm text-slate-200">{weekly.upcoming.length} events are approaching in the next 30 days.</p>
                </article>
                <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-accent">Live focus</p>
                  <p className="mt-2 text-sm text-slate-200">This brief highlights current event activity rather than archive content.</p>
                </article>
              </div>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <WeeklyEventFeed
              eyebrow="Newly Added Events"
              title="New event intake in the last 7 days"
              events={weekly.newlyAdded}
              emptyText="No new events have been approved in the last seven days."
            />

            <article className="lux-panel relative overflow-hidden border border-accent/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(200,173,127,0.16),transparent_30%),linear-gradient(180deg,rgba(200,173,127,0.06),transparent_52%)]" />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.24em] text-accent">Featured / Notable Conferences</p>
                {leadEvent ? (
                  <>
                    <div className="mt-4">
                      <LocationSignature city={leadEvent.city} country={leadEvent.country} region={leadEvent.region} />
                    </div>
                    <h2 className="mt-4 font-[var(--font-serif)] text-4xl leading-tight text-white">{leadEvent.title}</h2>
                    <p className="mt-4 text-sm text-slate-300">{formatEventDate(leadEvent)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm uppercase tracking-[0.18em] text-slate-500">
                      <span className="country-chip">
                        <span>{getCountryFlag(leadEvent.country)}</span>
                        <span>{leadEvent.country}</span>
                      </span>
                      <span className="global-chip">{leadEvent.region}</span>
                    </div>
                    {leadEvent.description ? (
                      <p className="mt-5 text-sm leading-relaxed text-slate-300">{leadEvent.description}</p>
                    ) : (
                      <p className="mt-5 text-sm leading-relaxed text-slate-300">
                        Open the event record for dates, location details, organiser information, and the source link.
                      </p>
                    )}
                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-signal/20 bg-signal/10 px-3 py-1 text-xs font-medium text-signal2">
                        {leadEvent.category}
                      </span>
                      <span className="city-chip">{leadEvent.city}</span>
                      <span className="city-chip">{leadEvent.organiser}</span>
                    </div>
                    <Link href={`/events/${getEventSlug(leadEvent)}`} className="btn-primary mt-8 px-5 py-2.5">
                      Open Event Detail
                    </Link>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-slate-300">No notable conference is available for this week yet.</p>
                )}
              </div>
            </article>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <WeeklyEventFeed
              eyebrow="Upcoming Events"
              title="Approaching in the next 30 days"
              events={weekly.upcoming}
              emptyText="No upcoming events are currently scheduled in the next 30 days."
            />

            <article className="lux-panel relative overflow-hidden p-6 sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(200,173,127,0.08),transparent_24%)]" />
              <div className="relative">
                <p className="eyebrow">Future Ready</p>
                <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-white">Additional coverage will appear here later</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  This area is reserved for future additions such as association notices or platform updates. For now, the
                  weekly brief stays focused on live event activity.
                </p>
                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Association updates</p>
                    <p className="mt-2 text-sm text-slate-200">Reserved for future association notices and schedule changes.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Platform updates</p>
                    <p className="mt-2 text-sm text-slate-200">Reserved for future platform notices when that coverage is introduced.</p>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
