import { CalendarView } from '@/components/calendar-view';
import { Reveal } from '@/components/motion/reveal';
import { fetchAllEvents } from '@/lib/data/events';
import { getCoverageMetrics } from '@/lib/utils/coverage';

export const dynamic = 'force-dynamic';

export default async function CalendarPage({
  searchParams
}: {
  searchParams?: { association?: string };
}) {
  const events = await fetchAllEvents();
  const coverage = getCoverageMetrics(events);
  const initialAssociation = searchParams?.association ? decodeURIComponent(searchParams.association) : undefined;

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="container-shell">
        <Reveal>
          <header className="mb-6 relative overflow-hidden rounded-[2.2rem] border border-slate-900/80 bg-[linear-gradient(135deg,#14396a,#0f1b2f_38%,#0f5d5b_100%)] p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(96,165,250,0.22),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(34,197,94,0.14),transparent_24%)]" />
            <div className="relative">
              <p className="eyebrow">Global Calendar</p>
              <h1 className="font-[var(--font-serif)] text-4xl leading-tight text-white sm:text-5xl">
                Investigator Events Calendar
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-200">
                The default timeline is built for fast scanning and comparison. Month view stays available as a cleaner
                secondary planning overview when you need date pattern visibility.
              </p>
              <p className="mt-3 max-w-3xl text-sm text-slate-300">
                The public calendar starts with major conferences and flagship meetings. Switch to all events when you need
                the wider picture, including webinars, training sessions, and smaller network gatherings.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="city-chip">{coverage.totalCountries} countries</span>
                <span className="city-chip">{coverage.totalSubregions} subregions</span>
                <span className="city-chip">{coverage.totalEvents} live events</span>
                <span className="global-chip">worldwide scan view</span>
              </div>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.04}>
          <section className="mb-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(59,130,246,0.08),transparent_28%),radial-gradient(circle_at_80%_68%,rgba(34,197,94,0.06),transparent_24%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-700">Filter Logic</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-2xl text-slate-950">
                  Navigate by region, country, month, and association
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Start with the broad event picture, then narrow into country, category, association, and month when you
                  need a tighter planning view.
                </p>
                <div className="signal-divider mt-5" />
                <p className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-500">
                  Built for comparing international coverage without sacrificing month-view readability.
                </p>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="relative grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-sky-700">Region-first view</p>
                  <p className="mt-2 text-sm text-slate-700">See where live event activity is concentrated before drilling into specific countries.</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">Timing clarity</p>
                  <p className="mt-2 text-sm text-slate-700">Compare months to reduce clashes and spot high-density windows.</p>
                </div>
                <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-violet-700">Main by default</p>
                  <p className="mt-2 text-sm text-slate-700">The public view starts with major conferences and flagship meetings, with an option to widen the scope.</p>
                </div>
              </div>
            </article>
          </section>
        </Reveal>

        <CalendarView events={events} initialAssociation={initialAssociation} />
      </div>
    </section>
  );
}
