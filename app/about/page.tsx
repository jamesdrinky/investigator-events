import Link from 'next/link';
import { PageAtmosphere } from '@/components/global/page-atmosphere';
import { Reveal } from '@/components/motion/reveal';

const principles = [
  {
    title: 'Global industry visibility',
    text: 'Event intelligence is organised across countries, regions, and categories so professionals can understand the wider market, not just isolated local listings.'
  },
  {
    title: 'Better coordination',
    text: 'A shared calendar helps organisers reduce date overlap and gives attendees a clearer view of how major events are distributed through the year.'
  },
  {
    title: 'Trusted commercial context',
    text: 'Partner and sponsor visibility is designed to feel credible, relevant, and aligned with a professional investigation audience.'
  }
];

const roadmap = [
  'Region-aware event submission workflows for organisers and associations',
  'A weekly intelligence brief highlighting priority conferences and training windows',
  'Expanded association and partner visibility across international markets'
];

export default function AboutPage() {
  return (
    <section className="section-pad relative overflow-hidden">
      <PageAtmosphere />

      <div className="container-shell space-y-8">
        <Reveal>
          <header className="global-panel relative overflow-hidden p-8 sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(139,169,255,0.16),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(183,138,255,0.08),transparent_24%)]" />

            <div className="relative max-w-4xl">
              <p className="eyebrow">About The Platform</p>
              <h1 className="section-title">Why Investigator Events Exists</h1>
              <div className="mt-8 space-y-5 text-sm leading-relaxed text-slate-300 sm:text-base">
                <p>
                  Investigator Events is a central global event calendar for the private investigator industry. We bring
                  conferences, seminars, and training opportunities together in a single trusted destination.
                </p>
                <p>
                  The platform helps organisers avoid date clashes by making event timelines visible across countries,
                  regions, and categories. It also helps investigators discover relevant events faster and plan attendance
                  throughout the year.
                </p>
                <p>
                  The long-term direction is a stronger shared platform for investigator events, associations, and selected
                  partner visibility.
                </p>
              </div>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.04}>
          <section className="grid gap-4 md:grid-cols-3">
            {principles.map((item) => (
              <article key={item.title} className="lux-panel relative overflow-hidden p-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(139,169,255,0.1),transparent_24%)]" />
                <h2 className="relative font-[var(--font-serif)] text-2xl text-white">{item.title}</h2>
                <p className="relative mt-3 text-sm leading-relaxed text-slate-300">{item.text}</p>
              </article>
            ))}
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="global-panel relative overflow-hidden p-7 sm:p-8">
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Platform Roadmap</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-white">Building toward a stronger global event platform</h2>
                <div className="mt-5 space-y-3">
                  {roadmap.map((item) => (
                    <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="glass-panel relative overflow-hidden p-7 sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(127,228,199,0.08),transparent_24%),radial-gradient(circle_at_18%_78%,rgba(183,138,255,0.08),transparent_28%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Network Orientation</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-white">Designed for organisers, associations, and investigators</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  The platform is intended to become a shared reference point for the global investigator events ecosystem,
                  from national associations to specialist training providers and partner brands.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/calendar" className="btn-primary">
                    Explore Calendar
                  </Link>
                  <Link href="/advertise" className="btn-secondary">
                    View Partner Options
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
