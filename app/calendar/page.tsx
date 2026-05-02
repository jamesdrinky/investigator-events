import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/reveal';
import { CalendarView } from '@/components/calendar-view';
import { MyEventsPanel } from '@/components/MyEventsPanel';
import { SpinningLogoRings } from '@/components/calendar/spinning-logo-rings';
import { ExpandingEventCards, type ExpandingEventItem } from '@/components/home/ExpandingEventCards';
import { fetchAllEvents } from '@/lib/data/events';
import { getCoverageMetrics } from '@/lib/utils/coverage';
import { formatEventDate, parseDate, sortEventsByDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'PI Events Calendar 2026',
  description: 'Browse confirmed PI conferences, AGMs, training, and association events by month, region, country, and organiser.'
};

export default async function CalendarPage({
  searchParams
}: {
  searchParams?: { association?: string; search?: string; region?: string; month?: string; view?: string };
}) {
  const events = await fetchAllEvents();
  const mainEvents = sortEventsByDate(events.filter((e) => e.eventScope === 'main'));
  const coverage = getCoverageMetrics(mainEvents);
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const upcomingMain = mainEvents.filter((e) => parseDate(e.date).getTime() >= today.getTime());
  const upcomingCount = upcomingMain.length;

  const expandingItems: ExpandingEventItem[] = upcomingMain.slice(0, 5).map((e) => ({
    id: e.id, title: e.title, date: formatEventDate(e), city: e.city, country: e.country,
    region: e.region, category: e.category, slug: getEventSlug(e),
    association: e.association ?? e.organiser, coverImage: e.coverImage, description: e.description || undefined,
  }));

  const initialAssociation = searchParams?.association ? decodeURIComponent(searchParams.association) : undefined;
  const initialSearch = searchParams?.search ? decodeURIComponent(searchParams.search) : undefined;
  const initialRegion = searchParams?.region ? decodeURIComponent(searchParams.region) : undefined;
  const initialMonth = searchParams?.month ? decodeURIComponent(searchParams.month) : undefined;

  return (
    <section className="relative overflow-hidden">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-8 pt-20 sm:pb-16 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.06),transparent_35%)]" />
        <SpinningLogoRings />

        <div className="container-shell relative">
          <Reveal>
            <div className="max-w-3xl">
              <p className="eyebrow">Calendar</p>
              <h1 className="mt-2 text-[1.8rem] font-bold leading-[0.94] tracking-[-0.05em] text-slate-950 sm:mt-4 sm:text-[3.5rem] lg:text-[5rem]">
                The{' '}
                <span
                  className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
                  style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
                >
                  live
                </span>{' '}
                global events calendar.
              </h1>
              <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-slate-600 sm:mt-5 sm:max-w-2xl sm:text-lg">
                Browse conferences, training, and association events in one place, then filter by month, region, or organiser.
              </p>
            </div>
          </Reveal>

          {/* Stats — responsive */}
          <Reveal delay={0.06}>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-12 sm:gap-5">
              {[
                { label: 'Upcoming', value: upcomingCount, gradient: 'from-blue-500 to-cyan-400' },
                { label: 'Countries', value: coverage.totalCountries, gradient: 'from-violet-500 to-purple-400' },
                { label: 'Total', value: coverage.totalEvents, gradient: 'from-cyan-500 to-teal-400' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/70 bg-white/95 px-3 py-3 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.1)] sm:rounded-2xl sm:px-6 sm:py-6">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]">{item.label}</p>
                  <p className={`mt-1 bg-gradient-to-r ${item.gradient} bg-clip-text text-xl font-bold tracking-tight text-transparent sm:mt-2 sm:text-[3rem]`}>{item.value}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Expanding cards — full version on desktop, compact list on mobile */}
          {expandingItems.length > 0 && (
            <Reveal delay={0.1}>
              <div className="mt-8 sm:mt-12">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:text-xs">Coming soon</p>
                <h2 className="mt-1 text-lg font-bold tracking-[-0.03em] text-slate-950 sm:text-xl">Next on the calendar</h2>
                {/* Desktop: expanding cards */}
                <div className="mt-4 hidden sm:block">
                  <ExpandingEventCards items={expandingItems} />
                </div>
                {/* Mobile: simple list */}
                <div className="mt-3 space-y-2 sm:hidden">
                  {expandingItems.slice(0, 5).map((item) => {
                    const d = new Date(item.date.split('–')[0].trim().replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $1, $3') || item.date);
                    const month = isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { month: 'short' });
                    const day = isNaN(d.getTime()) ? '' : String(d.getDate());
                    return (
                      <a key={item.slug} href={`/events/${item.slug}`} className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white p-3 shadow-sm transition active:scale-[0.98]">
                        {month && day ? (
                          <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50">
                            <span className="text-[9px] font-bold uppercase text-blue-500">{month}</span>
                            <span className="text-base font-bold leading-none text-blue-700">{day}</span>
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            <span className="text-[10px] font-bold text-slate-400">TBC</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-400">{item.city}, {item.country}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* ── My Events (logged in only) ── */}
      <div className="container-shell relative pt-8 sm:pt-12">
        <MyEventsPanel />
      </div>

      {/* ── Newsletter CTA ── */}
      <div className="container-shell relative">
        <div className="mx-auto max-w-3xl rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-violet-50 px-6 py-5 sm:px-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Never miss an event</p>
              <p className="mt-0.5 text-xs text-slate-500">Get a free weekly briefing with new events, featured conferences, and community updates.</p>
            </div>
            <a href="/weekly" className="flex-shrink-0 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
              Subscribe free
            </a>
          </div>
        </div>
      </div>

      {/* ── Calendar content ── */}
      <div className="container-shell relative pb-8 sm:pb-12">
        <CalendarView
          events={events}
          initialAssociation={initialAssociation}
          initialSearch={initialSearch}
          initialRegion={initialRegion}
          initialMonth={initialMonth}
          initialView={searchParams?.view === 'calendar' ? 'calendar' : undefined}
        />
      </div>
    </section>
  );
}
