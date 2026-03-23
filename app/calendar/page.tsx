import { CalendarView } from '@/components/calendar-view';
import { PageAtmosphere } from '@/components/global/page-atmosphere';
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
      <PageAtmosphere />
      <div className="container-shell">
        <Reveal>
          <header className="mb-6 relative overflow-hidden rounded-[2.2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(21,58,100,0.9),rgba(13,24,39,0.94)_34%,rgba(16,88,92,0.82)_100%)] p-6 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(139,169,255,0.22),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(127,228,199,0.16),transparent_24%)]" />
            <div className="relative">
              <p className="eyebrow">Global Calendar</p>
              <h1 className="section-title">Investigator Events Calendar</h1>
              <p className="section-copy max-w-3xl">
                The default timeline is built for fast scanning and comparison. Month view stays available as a cleaner
                secondary planning overview when you need date pattern visibility.
              </p>
              <p className="mt-3 max-w-3xl text-sm text-slate-400">
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
            <article className="surface-flat relative overflow-hidden p-5 sm:p-6">
              <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(139,169,255,0.14),transparent_28%),radial-gradient(circle_at_80%_68%,rgba(127,228,199,0.08),transparent_24%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Filter Logic</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-2xl text-white">Navigate by region, country, month, and association</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Start with the broad event picture, then narrow into country, category, association, and month when you
                  need a tighter planning view.
                </p>
                <div className="signal-divider mt-5" />
                <p className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-400">
                  Built for comparing international coverage without sacrificing month-view readability.
                </p>
              </div>
            </article>

            <article className="surface-elevated relative overflow-hidden p-5 sm:p-6">
              <div className="relative grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl border border-white/12 bg-[linear-gradient(180deg,rgba(77,163,255,0.14),rgba(255,255,255,0.03))] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Region-first view</p>
                  <p className="mt-2 text-sm text-slate-200">See where live event activity is concentrated before drilling into specific countries.</p>
                </div>
                <div className="rounded-xl border border-white/12 bg-[linear-gradient(180deg,rgba(77,163,255,0.08),rgba(255,255,255,0.03),rgba(52,211,153,0.08))] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Timing clarity</p>
                  <p className="mt-2 text-sm text-slate-200">Compare months to reduce clashes and spot high-density windows.</p>
                </div>
                <div className="rounded-xl border border-white/12 bg-[linear-gradient(180deg,rgba(52,211,153,0.14),rgba(255,255,255,0.03))] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Main by default</p>
                  <p className="mt-2 text-sm text-slate-200">The public view starts with major conferences and flagship meetings, with an option to widen the scope.</p>
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
