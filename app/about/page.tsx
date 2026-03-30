import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description: 'Why Investigator Events exists, how the calendar works, and who is behind the platform.'
};

const pillars = [
  {
    title: 'One place to browse',
    description: 'Track investigator conferences, training, and association meetings worldwide in one clear calendar.'
  },
  {
    title: 'A clearer planning view',
    description: 'Compare timing more quickly and reduce the risk of avoidable date clashes.'
  },
  {
    title: 'Clear links behind each event',
    description: 'See which association or organiser is behind a listing before you commit time or travel.'
  }
];

const credibilityPoints = [
  '25+ years in international private sector investigations',
  'Spear’s 500 Top Investigator',
  'Investigator of the Year (2016)',
  'President of the Association of British Investigators',
  'Former President of the World Association of Detectives',
  'Global investigations leadership'
];

const platformExpectations = [
  'Live event listings with clear dates, locations, and organiser details.',
  'Clear links between events and the association or organiser behind them.',
  'Free submissions, with review before publication so the calendar stays credible.'
];

export default async function AboutPage() {
  return (
    <section className="section-pad relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#f4f7fb_34%,#ffffff_60%,#f8fafc_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(37,99,235,0.08),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.06),transparent_20%),radial-gradient(circle_at_50%_56%,rgba(148,163,184,0.08),transparent_34%)]" />
      <div className="container-shell relative space-y-24 sm:space-y-32 lg:space-y-40">
        <Reveal>
          <header className="relative pt-4 sm:pt-8">
            <div className="pointer-events-none absolute inset-x-[-8%] top-[-4rem] h-[22rem] bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.96),rgba(255,255,255,0)_42%),radial-gradient(circle_at_72%_18%,rgba(186,230,253,0.28),rgba(186,230,253,0)_26%)]" />
            <div className="relative max-w-4xl">
              <p className="eyebrow">About</p>
              <h1 className="mt-5 max-w-[11ch] text-[2.95rem] font-semibold leading-[0.88] tracking-[-0.07em] text-slate-950 sm:text-[4.2rem] lg:text-[5.45rem]">
                What Investigator Events is, and why it exists
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-800 sm:text-lg">
                Investigator Events is a practical calendar for the private investigations sector. It brings live conferences, training, and association events into one place so professionals can compare timing, check provenance, and see who is behind each listing.
              </p>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.04}>
          <section className="grid gap-10 border-t border-slate-300/80 pt-9 md:grid-cols-3 md:gap-8 md:pt-11">
            {pillars.map((item) => (
              <article key={item.title} className="max-w-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">{item.title}</p>
                <p className="mt-4 text-base font-medium leading-8 text-slate-800">{item.description}</p>
              </article>
            ))}
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="space-y-24 sm:space-y-32">
            <article className="relative -mx-4 overflow-hidden px-4 py-4 sm:-mx-6 sm:px-6 sm:py-6 lg:-mx-10 lg:px-10 lg:py-8">
              <div className="pointer-events-none absolute inset-x-[-10%] inset-y-0 bg-[radial-gradient(circle_at_18%_36%,rgba(59,130,246,0.14),transparent_22%),radial-gradient(circle_at_72%_48%,rgba(148,163,184,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0))]" />
              <div className="relative grid gap-12 lg:grid-cols-[18.5rem_minmax(0,1fr)] lg:items-start lg:gap-20">
                <div className="relative mx-auto w-full max-w-[17.5rem] lg:mx-0 lg:mt-2">
                  <div className="absolute inset-[-12%] rounded-[2.8rem] bg-[radial-gradient(circle_at_48%_24%,rgba(59,130,246,0.2),transparent_48%),radial-gradient(circle_at_50%_70%,rgba(255,255,255,0.9),transparent_52%)]" />
                  <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_70px_-36px_rgba(15,23,42,0.42)] ring-1 ring-white/80">
                    <Image src="/faces/mike1.webp" alt="Mike LaCorte" width={360} height={420} className="h-auto w-full object-cover" />
                  </div>
                </div>

                <div className="max-w-5xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">Why Trust It</p>
                    <span className="text-[11px] font-medium text-slate-500">LinkedIn available on request</span>
                  </div>
                  <h2 className="mt-5 max-w-[11ch] font-[var(--font-serif)] text-[2.5rem] leading-[0.92] tracking-[-0.05em] text-slate-950 sm:text-6xl">
                    Built by someone with real standing in the profession.
                  </h2>
                  <h3 className="mt-9 text-[1.75rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2rem]">Mike LaCorte</h3>
                  <p className="mt-2.5 text-base font-medium leading-7 text-slate-800 sm:text-lg">
                    CEO, Conflict International · ABI President · IKD Secretary General
                  </p>
                  <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-800 sm:text-[1.15rem]">
                    I help law firms, corporates, and HNWIs solve complex cross-border investigations.
                  </p>

                  <div className="mt-11 grid gap-x-8 gap-y-5 border-t border-slate-300/80 pt-8 sm:grid-cols-2 xl:grid-cols-3">
                    {credibilityPoints.map((point) => (
                      <div key={point} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-slate-900" />
                        <p className="text-sm font-medium leading-6 text-slate-800">{point}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-slate-600">
                    {['International Investigations', 'Asset Tracing', 'Corporate Risk', 'Litigation Support', 'OSINT / HUMINT'].map((item) => (
                      <span key={item} className="whitespace-nowrap">
                        {item}
                      </span>
                    ))}
                  </div>

                  <p className="mt-9 max-w-3xl text-base leading-8 text-slate-700">
                    Investigator Events was built because there was no neutral, genuinely useful global calendar for this space. It exists to make legitimate events easier to find, compare, and trust at a glance.
                  </p>
                </div>
              </div>
            </article>

            <section className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-20">
              <div className="max-w-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">What You Can Expect</p>
                <h2 className="mt-4 font-[var(--font-serif)] text-3xl tracking-[-0.045em] text-slate-950 sm:text-[2.7rem]">
                  A cleaner, more useful way to navigate the event calendar.
                </h2>
                <p className="mt-6 text-base leading-8 text-slate-700">
                  The platform is designed to help professionals assess relevance quickly, understand provenance, and make decisions with less friction.
                </p>
              </div>

              <div className="space-y-0 border-t border-slate-300/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(255,255,255,0))]">
                {platformExpectations.map((item) => (
                  <div key={item} className="border-b border-slate-200/80 py-5 text-base leading-8 text-slate-800">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </section>
        </Reveal>

        <Reveal delay={0.12}>
          <section className="border-t border-slate-300/80 pt-14 sm:pt-16">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">Next Step</p>
                <h2 className="mt-4 font-[var(--font-serif)] text-3xl tracking-[-0.045em] text-slate-950 sm:text-[2.7rem]">
                  Browse the network or go straight to the live calendar.
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/calendar" className="btn-primary px-5 py-2.5">
                  Browse events
                </Link>
                <Link href="/associations" className="btn-secondary px-5 py-2.5">
                  View associations
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
