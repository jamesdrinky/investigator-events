import Link from 'next/link';
import { PageAtmosphere } from '@/components/global/page-atmosphere';
import { GlobalNetworkVisual } from '@/components/global/network-visual';
import { Reveal } from '@/components/motion/reveal';
import { fetchAllEvents } from '@/lib/data/events';
import { getCoverageMetrics } from '@/lib/utils/coverage';

const pillars = [
  {
    title: 'A shared international calendar',
    text: 'Investigators can browse conferences, training, and association meetings across the year instead of relying on scattered local sources.'
  },
  {
    title: 'A coordination tool for organisers',
    text: 'Event teams can check the wider schedule, reduce avoidable clashes, and position their dates with more context.'
  },
  {
    title: 'A visible platform for associations',
    text: 'Associations are not hidden inside event records. They have a real network layer, branded presence, and direct paths into the calendar.'
  }
];

const audiences = [
  'Investigators planning conferences, seminars, and training year-round',
  'Associations promoting conferences, meetings, and member activity',
  'Organisers checking international timing before they set dates',
  'Sponsors, suppliers, and service providers looking for credible visibility'
];

const productAreas = [
  'Calendar view for live event discovery and schedule comparison',
  'Associations page as the industry layer behind the calendar',
  'Weekly brief for recurring return value and event awareness',
  'Submit flow for reviewed intake rather than direct publication',
  'Advertiser inquiry structure for sponsor and supplier visibility'
];

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const events = await fetchAllEvents();
  const coverage = getCoverageMetrics(events);
  const visualRegions = coverage.regions.filter((region) =>
    ['North America', 'Europe', 'Middle East', 'Asia-Pacific'].includes(region.name)
  );

  return (
    <section className="section-pad relative overflow-hidden">
      <PageAtmosphere />

      <div className="container-shell space-y-8">
        <Reveal>
          <header className="global-panel relative overflow-hidden p-8 sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,179,255,0.18),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(41,211,163,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.015))]" />

            <div className="relative grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div>
                <p className="eyebrow">About The Platform</p>
                <h1 className="section-title">Investigator Events exists to make the industry easier to see, compare, and coordinate</h1>
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-200">
                  The private investigator events market is international, but most of it is still discovered in fragments.
                  Investigator Events brings conferences, training, and association activity into one place so people can
                  browse what is happening, compare timing, and understand who sits behind the calendar.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/calendar" className="btn-primary px-5 py-2.5">
                    Explore calendar
                  </Link>
                  <Link href="/associations" className="btn-secondary px-5 py-2.5">
                    View associations
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.8rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Countries</p>
                      <p className="mt-2 font-[var(--font-serif)] text-4xl text-white">{coverage.totalCountries}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Live events</p>
                      <p className="mt-2 font-[var(--font-serif)] text-4xl text-white">{coverage.totalEvents}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Subregions</p>
                      <p className="mt-2 font-[var(--font-serif)] text-4xl text-white">{coverage.totalSubregions}</p>
                    </div>
                  </div>
                </div>

                <GlobalNetworkVisual regions={visualRegions} />
              </div>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.04}>
          <section className="grid gap-4 md:grid-cols-3">
            {pillars.map((item, index) => (
              <article
                key={item.title}
                className={`relative overflow-hidden rounded-[1.8rem] border p-6 ${
                  index === 0
                    ? 'border-signal/20 bg-[linear-gradient(180deg,rgba(52,179,255,0.12),rgba(255,255,255,0.03))]'
                    : index === 1
                      ? 'border-globe/20 bg-[linear-gradient(180deg,rgba(41,211,163,0.12),rgba(255,255,255,0.03))]'
                      : 'border-[#7b7cff]/20 bg-[linear-gradient(180deg,rgba(123,124,255,0.12),rgba(255,255,255,0.03))]'
                }`}
              >
                <h2 className="font-[var(--font-serif)] text-2xl text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-200">{item.text}</p>
              </article>
            ))}
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="atlas-panel relative overflow-hidden p-7 sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,179,255,0.16),transparent_24%),radial-gradient(circle_at_80%_24%,rgba(123,124,255,0.14),transparent_20%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Who the product serves</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-white">Built for the people who actually need the wider event picture</h2>
                <div className="mt-6 grid gap-3">
                  {audiences.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-100">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="global-panel relative overflow-hidden p-7 sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(41,211,163,0.1),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_44%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">What already exists</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-white">Phase 1 is already more than a simple calendar page</h2>
                <div className="mt-6 space-y-3">
                  {productAreas.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/weekly" className="btn-secondary px-5 py-2.5">
                    Read weekly brief
                  </Link>
                  <Link href="/advertise" className="btn-secondary px-5 py-2.5">
                    View advertiser options
                  </Link>
                </div>
              </div>
            </article>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
