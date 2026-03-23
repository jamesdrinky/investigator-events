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
    title: 'Featured event support',
    text: 'Additional visibility for major conferences, training programmes, or association-led gatherings.'
  },
  {
    title: 'Supplier visibility',
    text: 'Relevant tools and services placed beside the calendar, weekly brief, and related event discovery surfaces.'
  },
  {
    title: 'Newsletter and brief sponsorship',
    text: 'Future premium placement around the recurring update for subscribers who want to hear about new events.'
  }
];

const reasons = [
  'Specialist audience of investigators, organisers, and associations',
  'Commercially focused placements with premium product context',
  'Global relevance across core private investigation markets'
];

export default function AdvertisePage() {
  return (
    <section className="section-pad relative overflow-hidden">
      <PageAtmosphere />
      <div className="container-shell space-y-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,28,43,0.92),rgba(7,14,24,0.97))] p-8 shadow-[0_36px_110px_-56px_rgba(0,0,0,0.92)] sm:p-10">
            <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,179,255,0.18),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(41,211,163,0.14),transparent_22%),radial-gradient(circle_at_62%_72%,rgba(255,180,93,0.08),transparent_24%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
              <div>
                <p className="eyebrow">Advertising & Partnerships</p>
                <h1 className="section-title">A premium visibility layer for sponsors, suppliers, and promoted conferences</h1>
                <p className="section-copy max-w-3xl">
                  Investigator Events gives relevant commercial partners a cleaner way to appear in front of the
                  investigator industry, inside a product built around real event planning and association activity.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {reasons.map((reason) => (
                  <div key={reason} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-100">
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <Reveal>
            <section className="atlas-panel relative overflow-hidden p-6 sm:p-7">
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Partner Intelligence</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-white">Visibility sits inside a specialist industry product</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Placements sit beside event discovery, calendar planning, weekly updates, and the associations layer, so
                  exposure feels relevant instead of random.
                </p>
                <div className="mt-5 rounded-[1.4rem] border border-emerald-300/16 bg-[linear-gradient(180deg,rgba(41,211,163,0.08),rgba(255,255,255,0.02))] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">Phase 1 reality</p>
                  <p className="mt-2 text-sm text-slate-200">
                    The current product already supports association visibility, featured event treatment, advertiser
                    inquiry capture, and a clear path toward sponsored newsletter placement.
                  </p>
                </div>
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
                  <p className="mt-2 text-sm text-slate-200">Featured conference support, supplier visibility, and newsletter sponsorship direction.</p>
                </article>
              </div>
            </section>
          </Reveal>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-8">
            <Reveal>
            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-7 sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,179,255,0.1),transparent_24%)]" />
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
              <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,28,44,0.92),rgba(7,14,24,0.97))] p-7 sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(41,211,163,0.12),transparent_24%),radial-gradient(circle_at_18%_80%,rgba(123,124,255,0.1),transparent_22%)]" />
                <h2 className="font-[var(--font-serif)] text-3xl text-white">Visibility Opportunities</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Use the inquiry form to start a direct commercial conversation. We review each request manually so the
                  platform stays useful for investigators and credible for partners.
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
