import { AdvertiserLeadForm } from '@/components/advertiser-lead-form';
import { PageAtmosphere } from '@/components/global/page-atmosphere';
import { Reveal } from '@/components/motion/reveal';

const advertiserTypes = [
  'Law firms',
  'Surveillance equipment providers',
  'Software / OSINT tools',
  'Training providers',
  'Industry services'
];

const placementOptions = [
  {
    title: 'Featured placement',
    text: 'Prominent homepage and calendar exposure for high-visibility campaigns and launch windows.'
  },
  {
    title: 'Category sponsor',
    text: 'Aligned positioning within specific event categories to target relevant investigator audiences.'
  },
  {
    title: 'Strategic partner',
    text: 'Longer-term brand integration with coordinated campaigns across calendar and partner touchpoints.'
  }
];

const reasons = [
  'Specialist audience of investigators and organisers',
  'Commercially focused placements with premium context',
  'Global relevance across key private investigation markets'
];

export default function AdvertisePage() {
  return (
    <section className="section-pad relative overflow-hidden">
      <PageAtmosphere />
      <div className="container-shell space-y-8">
        <Reveal>
          <div className="global-panel relative overflow-hidden p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(139,169,255,0.16),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(183,138,255,0.08),transparent_24%)]" />
            <div className="relative">
            <p className="eyebrow">Advertising & Partnerships</p>
            <h1 className="section-title">Partner With a Global Investigator Industry Platform</h1>
            <p className="section-copy max-w-3xl">
              Investigator Events is designed for serious industry visibility. We help commercial partners reach
              investigator audiences in a context built around professional events, training, and live event discovery.
            </p>

            <ul className="mt-6 grid gap-2 sm:grid-cols-3">
              {reasons.map((reason) => (
                <li key={reason} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                  {reason}
                </li>
              ))}
            </ul>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <section className="global-panel relative overflow-hidden p-6 sm:p-7">
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Partner Intelligence</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-white">Advertising is placed inside a specialist event platform</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Placements sit beside event discovery, calendar planning, and association visibility, so partner
                  exposure feels useful rather than interruptive.
                </p>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.06}>
            <section className="glass-panel relative overflow-hidden p-6 sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(127,228,199,0.08),transparent_24%),radial-gradient(circle_at_18%_76%,rgba(183,138,255,0.08),transparent_28%)]" />
              <div className="relative grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <article className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Audience quality</p>
                  <p className="mt-2 text-sm text-slate-200">Investigators, organisers, associations, and training decision-makers.</p>
                </article>
                <article className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Market spread</p>
                  <p className="mt-2 text-sm text-slate-200">Positioned across multiple regions rather than a single domestic audience.</p>
                </article>
                <article className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Format options</p>
                  <p className="mt-2 text-sm text-slate-200">Homepage presence, category sponsorship, and longer-term partnership programs.</p>
                </article>
              </div>
            </section>
          </Reveal>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-8">
            <Reveal>
            <section className="global-panel relative overflow-hidden p-7 sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(139,169,255,0.1),transparent_24%)]" />
                <h2 className="font-[var(--font-serif)] text-3xl text-white">Who Advertises Here</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  We work with businesses that support investigative professionals and want focused exposure in a trusted,
                  professional environment.
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {advertiserTypes.map((type) => (
                    <span key={type} className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-200">
                      {type}
                    </span>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal delay={0.1}>
              <section className="global-panel relative overflow-hidden p-7 sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(127,228,199,0.08),transparent_24%)]" />
                <h2 className="font-[var(--font-serif)] text-3xl text-white">Sponsor Opportunities</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Use the inquiry form to start a direct commercial conversation. We review each request manually before
                  discussing placements or partnership options.
                </p>
                <div className="mt-5 space-y-3">
                  {placementOptions.map((option) => (
                    <article key={option.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]">
                      <h3 className="text-base font-semibold text-white">{option.title}</h3>
                      <p className="mt-2 text-sm text-slate-300">{option.text}</p>
                    </article>
                  ))}
                </div>
              </section>
            </Reveal>
          </div>

          <AdvertiserLeadForm />
        </div>
      </div>
    </section>
  );
}
