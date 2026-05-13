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
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';

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

  // Hide newsletter CTA for signed-in users — same rationale as
  // NewsletterBanner: they can subscribe from profile/footer, and Apple
  // private relay emails won't match newsletter_subscribers anyway.
  const supabase = await createSupabaseSSRServerClient();
  const { data: { user } } = await supabase.auth.getUser();
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
      {/* ── Hero — compact mobile, full desktop ── */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-4 pt-4 sm:pb-16 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.06),transparent_35%)]" />
        <div className="hidden sm:block"><SpinningLogoRings /></div>

        <div className="container-shell relative">
          {/* Mobile: compact inline header */}
          <div className="sm:hidden">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600/70">Live calendar</p>
            <div className="mt-1.5 flex items-end justify-between gap-3">
              <h1
                className="bg-[linear-gradient(92deg,#0f172a_0%,#1d4ed8_55%,#0f172a_100%)] bg-[length:200%_100%] bg-clip-text text-[2rem] font-bold leading-[0.95] tracking-[-0.04em] text-transparent"
                style={{ animation: 'gradient-text-cycle 6s ease-in-out infinite' }}
              >
                Events
              </h1>
              <a
                href="/submit-event"
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.55)] transition active:scale-95"
              >
                + Submit
              </a>
            </div>
            <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/85 px-4 py-2 backdrop-blur-sm shadow-[0_4px_14px_-8px_rgba(15,23,42,0.12)]">
              <span className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-blue-600">{upcomingCount}</span>
                <span className="text-[11px] font-medium text-slate-500">upcoming</span>
              </span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-violet-600">{coverage.totalCountries}</span>
                <span className="text-[11px] font-medium text-slate-500">countries</span>
              </span>
            </div>
          </div>

          {/* Desktop: full hero */}
          <div className="hidden sm:block">
            <Reveal>
              <div className="max-w-3xl">
                <p className="eyebrow">Calendar</p>
                <h1 className="mt-4 text-[3.5rem] font-bold leading-[0.94] tracking-[-0.05em] text-slate-950 lg:text-[5rem]">
                  The{' '}
                  <span
                    className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
                    style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
                  >
                    live
                  </span>{' '}
                  global events calendar.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
                  Browse conferences, training, and association events in one place, then filter by month, region, or organiser.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="mt-12 grid grid-cols-3 gap-5">
                {[
                  { label: 'Upcoming', value: upcomingCount, gradient: 'from-blue-500 to-cyan-400' },
                  { label: 'Countries', value: coverage.totalCountries, gradient: 'from-violet-500 to-purple-400' },
                  { label: 'Total', value: coverage.totalEvents, gradient: 'from-cyan-500 to-teal-400' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/70 bg-white/95 px-6 py-6 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.1)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className={`mt-2 bg-gradient-to-r ${item.gradient} bg-clip-text text-[3rem] font-bold tracking-tight text-transparent`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Expanding cards — desktop only */}
          {expandingItems.length > 0 && (
            <Reveal delay={0.1}>
              <div className="mt-8 hidden sm:block sm:mt-12">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Coming soon</p>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-slate-950">Next on the calendar</h2>
                <div className="mt-4">
                  <ExpandingEventCards items={expandingItems} />
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

      {/* ── Newsletter CTA (anon only) ── */}
      {!user && (
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
      )}

      {/* ── Calendar content ── */}
      <div id="events-list" className="container-shell relative scroll-mt-24 pb-8 sm:pb-12">
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
