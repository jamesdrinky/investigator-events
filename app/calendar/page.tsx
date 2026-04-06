import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/reveal';
import { CalendarView } from '@/components/calendar-view';
import { SpinningLogoRings } from '@/components/calendar/spinning-logo-rings';
import { ExpandingEventCards, type ExpandingEventItem } from '@/components/home/ExpandingEventCards';
import { fetchAllEvents } from '@/lib/data/events';
import { getCoverageMetrics } from '@/lib/utils/coverage';
import { formatEventDate, parseDate, sortEventsByDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'Browse confirmed PI conferences, AGMs, training, and association events by month, region, country, and organiser.'
};

export default async function CalendarPage({
  searchParams
}: {
  searchParams?: { association?: string; search?: string; region?: string; month?: string };
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
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-8 pt-24 sm:pb-14 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.06),transparent_35%)]" />
        <SpinningLogoRings />

        <div className="container-shell relative">
          <Reveal>
            <div className="max-w-3xl">
              <p className="eyebrow">Calendar</p>
              <h1 className="mt-3 text-[2rem] font-bold leading-[0.92] tracking-[-0.05em] text-slate-950 sm:mt-4 sm:text-[3.5rem] lg:text-[5rem]">
                The{' '}
                <span className="relative inline-block">
                  <span
                    className="bg-[linear-gradient(92deg,#2563eb_0%,#7c3aed_50%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
                    style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
                  >
                    live
                  </span>
                  {/* Glow behind "live" */}
                  <span
                    className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-[radial-gradient(circle,rgba(99,102,241,0.2),transparent_70%)]"
                    style={{ animation: 'hero-pulse 3s ease-in-out infinite', filter: 'blur(12px)' }}
                  />
                </span>{' '}
                global events calendar.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-5 sm:max-w-2xl sm:text-base">
                Browse conferences, training, and association events in one place, then filter by month, region, or organiser.
              </p>
            </div>
          </Reveal>

          {/* Stats — responsive */}
          <Reveal delay={0.06}>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-4">
              {[
                { label: 'Upcoming', value: upcomingCount, color: 'text-blue-600' },
                { label: 'Countries', value: coverage.totalCountries, color: 'text-violet-600' },
                { label: 'Total', value: coverage.totalEvents, color: 'text-cyan-600' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/80 bg-white/90 px-3 py-3 shadow-sm sm:rounded-2xl sm:px-5 sm:py-6">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]">{item.label}</p>
                  <p className={`mt-1 text-[1.5rem] font-bold tracking-tight sm:mt-2 sm:text-[3rem] ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Expanding cards — hidden on mobile (too tall) */}
          {expandingItems.length > 0 && (
            <Reveal delay={0.1}>
              <div className="mt-8 hidden sm:block sm:mt-12">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:text-xs">Coming soon</p>
                <h2 className="mt-1 text-lg font-bold tracking-[-0.03em] text-slate-950 sm:text-xl">Next on the calendar</h2>
                <div className="mt-4">
                  <ExpandingEventCards items={expandingItems} />
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* ── Calendar content ── */}
      <div className="container-shell relative py-6 sm:py-10">
        <CalendarView
          events={events}
          initialAssociation={initialAssociation}
          initialSearch={initialSearch}
          initialRegion={initialRegion}
          initialMonth={initialMonth}
        />
      </div>
    </section>
  );
}
