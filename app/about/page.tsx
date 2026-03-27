import Link from 'next/link';
import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/reveal';
import { fetchAllEvents } from '@/lib/data/events';
import { getCoverageMetrics } from '@/lib/utils/coverage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description: 'Why Investigator Events exists, how the calendar works, and who is behind the platform.'
};

const pillars = [
  'One place to browse investigator conferences, training, and association meetings worldwide.',
  'A clearer planning view for organisers trying to avoid date clashes.',
  'Clear links between events and the associations or organisers behind them.'
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
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_28%,rgba(255,255,255,0.1)_56%,rgba(255,255,255,0)_100%)]" />
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
              <div>
                <p className="eyebrow">About</p>
                <h1 className="section-title">What Investigator Events is, and why it exists.</h1>
                <p className="section-copy max-w-3xl">
                  Investigator Events is a practical calendar for the private investigations sector. It brings live conferences, training, and association events into one place so people can check dates, compare timing, and see who is behind each listing.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/calendar" className="btn-primary px-5 py-2.5">
                    Browse events
                  </Link>
                  <Link href="/associations" className="btn-secondary px-5 py-2.5">
                    View associations
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-blue-700">Countries</p>
                  <p className="mt-2 font-[var(--font-serif)] text-4xl text-slate-950">{coverage.totalCountries}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-700">Live events</p>
                  <p className="mt-2 font-[var(--font-serif)] text-4xl text-slate-950">{coverage.totalEvents}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1">
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
              <article key={item} className="rounded-[1.9rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.16)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_34px_76px_-38px_rgba(36,76,170,0.2)]">
                <p className="text-sm leading-relaxed text-slate-700">{item}</p>
              </article>
            ))}
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-7 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-8">
              <p className="eyebrow">What The Platform Does</p>
              <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-slate-950">What you can expect from the site.</h2>
              <div className="mt-6 grid gap-3">
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4 text-sm text-slate-700">
                  Live event listings with clear dates, locations, and organiser details.
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4 text-sm text-slate-700">
                  Clear links between events and the association or organiser behind them.
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4 text-sm text-slate-700">
                  Free submissions, with review before publication so the calendar stays credible.
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-7 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-8">
              <p className="eyebrow">Why Trust It</p>
              <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-slate-950">Built by someone who knows the industry.</h2>
              <div className="mt-6 rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm leading-relaxed text-slate-700">
                  Mike LaCorte has spent over 25 years working at the sharp end of international private sector investigations. As CEO of Conflict International, he has led cross-border casework spanning Europe, the Americas, Asia, and the Middle East.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  He currently serves as President of the Association of British Investigators, Secretary General of the IKD (Internationale Kommission der Detektiv-Verbande), and is a former President of the World Association of Detectives. His forthcoming book, A Guide to Conducting Successful Private Sector International Investigations, is published by Taylor & Francis / CRC Press.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Investigator Events was built because there was no neutral, genuinely useful global calendar for this space. The aim is simple: make it easier to find legitimate events and easier to understand who is running them.
                </p>
              </div>
            </article>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
