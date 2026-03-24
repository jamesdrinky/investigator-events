import Link from 'next/link';
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
      <div className="container-shell space-y-8">
        <Reveal>
          <header className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,179,255,0.1),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(41,211,163,0.08),transparent_22%)]" />

            <div className="relative grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div>
                <p className="eyebrow">About The Platform</p>
                <h1 className="section-title">Investigator Events exists to make the industry easier to see, compare, and coordinate</h1>
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600">
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
                <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-sky-100 bg-white px-4 py-4 shadow-sm">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700">Countries</p>
                      <p className="mt-2 font-[var(--font-serif)] text-4xl text-slate-950">{coverage.totalCountries}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-700">Live events</p>
                      <p className="mt-2 font-[var(--font-serif)] text-4xl text-slate-950">{coverage.totalEvents}</p>
                    </div>
                    <div className="rounded-2xl border border-violet-100 bg-white px-4 py-4 shadow-sm">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-violet-700">Subregions</p>
                      <p className="mt-2 font-[var(--font-serif)] text-4xl text-slate-950">{coverage.totalSubregions}</p>
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
                className={`relative overflow-hidden rounded-[1.8rem] border bg-white p-6 shadow-sm ${
                  index === 0
                    ? 'border-sky-100'
                    : index === 1
                      ? 'border-emerald-100'
                      : 'border-violet-100'
                }`}
              >
                <h2 className="font-[var(--font-serif)] text-2xl text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </article>
            ))}
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,179,255,0.08),transparent_24%),radial-gradient(circle_at_80%_24%,rgba(123,124,255,0.07),transparent_20%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Who the product serves</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">Built for the people who actually need the wider event picture</h2>
                <div className="mt-6 grid gap-3">
                  {audiences.map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(41,211,163,0.08),transparent_22%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">What already exists</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">Phase 1 is already more than a simple calendar page</h2>
                <div className="mt-6 space-y-3">
                  {productAreas.map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
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
