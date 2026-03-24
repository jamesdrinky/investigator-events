import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { fetchAllEvents } from '@/lib/data/events';
import { getCoverageMetrics } from '@/lib/utils/coverage';

export const dynamic = 'force-dynamic';

const pillars = [
  'One place to browse investigator conferences, training, and association meetings worldwide.',
  'A clearer planning surface for organisers trying to avoid clashes and understand the wider calendar.',
  'A stronger public network layer for the associations behind the events.'
];

export default async function AboutPage() {
  const events = await fetchAllEvents();
  const coverage = getCoverageMetrics(events);

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="container-shell relative space-y-8">
        <Reveal>
          <header className="overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_54%,#f4fbff_100%)] p-6 shadow-[0_34px_84px_-52px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
              <div>
                <p className="eyebrow">About</p>
                <h1 className="section-title">Built to make the global investigator events market easier to see.</h1>
                <p className="section-copy max-w-3xl">
                  Investigator Events brings conferences, training, and association activity into one place so people can discover what is on, compare timing, and understand who is behind the calendar.
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

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-blue-700">Countries</p>
                  <p className="mt-2 font-[var(--font-serif)] text-4xl text-slate-950">{coverage.totalCountries}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-700">Live events</p>
                  <p className="mt-2 font-[var(--font-serif)] text-4xl text-slate-950">{coverage.totalEvents}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-700">Regions</p>
                  <p className="mt-2 font-[var(--font-serif)] text-4xl text-slate-950">{coverage.regions.length}</p>
                </div>
              </div>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.04}>
          <section className="grid gap-4 md:grid-cols-3">
            {pillars.map((item) => (
              <article key={item} className="rounded-[1.9rem] border border-white/80 bg-white p-6 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.16)]">
                <p className="text-sm leading-relaxed text-slate-700">{item}</p>
              </article>
            ))}
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-[2rem] border border-white/80 bg-white p-7 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-8">
              <p className="eyebrow">What The Platform Does</p>
              <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-slate-950">A discovery product first.</h2>
              <div className="mt-6 grid gap-3">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  Shows live dates and event detail pages instead of long marketing explanation blocks.
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  Gives associations visible identity through logos, network browsing, and linked event views.
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  Makes listing free, while keeping public quality through review before publication.
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/80 bg-white p-7 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-8">
              <p className="eyebrow">Founded By</p>
              <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-slate-950">Founder credentials</h2>
              <div className="mt-6 rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm leading-relaxed text-slate-700">
                  This section has been prepared for founder and industry credential detail, but no verified founder biography is present in the current repository content.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Add the founder name, relevant investigator industry background, and any association or event credentials here to complete the credibility layer.
                </p>
              </div>
            </article>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
