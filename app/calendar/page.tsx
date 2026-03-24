import { CalendarView } from '@/components/calendar-view';
import { Reveal } from '@/components/motion/reveal';
import { fetchAllEvents } from '@/lib/data/events';
import { getCoverageMetrics } from '@/lib/utils/coverage';

export const dynamic = 'force-dynamic';

export default async function CalendarPage({
  searchParams
}: {
  searchParams?: { association?: string; search?: string; region?: string; month?: string };
}) {
  const events = await fetchAllEvents();
  const coverage = getCoverageMetrics(events);
  const initialAssociation = searchParams?.association ? decodeURIComponent(searchParams.association) : undefined;
  const initialSearch = searchParams?.search ? decodeURIComponent(searchParams.search) : undefined;
  const initialRegion = searchParams?.region ? decodeURIComponent(searchParams.region) : undefined;
  const initialMonth = searchParams?.month ? decodeURIComponent(searchParams.month) : undefined;

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="container-shell relative">
        <Reveal>
          <header className="mb-6 overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_54%,#f4fbff_100%)] p-6 shadow-[0_34px_80px_-50px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.16]" />
            <div className="relative grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="eyebrow">Global Calendar</p>
                <h1 className="section-title">The live investigator events calendar.</h1>
                <p className="section-copy max-w-3xl">
                  Search by month, region, country, association, or event type. Start with major events, then widen the view when you need every approved listing.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-blue-700">Coverage</p>
                  <p className="mt-2 text-sm text-slate-700">{coverage.totalEvents} live events across {coverage.totalCountries} countries.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-700">Major Events</p>
                  <p className="mt-2 text-sm text-slate-700">Flagship conferences and anchor meetings with the strongest international draw.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-700">All Events</p>
                  <p className="mt-2 text-sm text-slate-700">Adds training, webinars, seminars, and smaller approved gatherings.</p>
                </div>
              </div>
            </div>
          </header>
        </Reveal>

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
