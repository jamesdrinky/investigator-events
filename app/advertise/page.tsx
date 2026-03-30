import type { Metadata } from 'next';
import { AdvertiserLeadForm } from '@/components/advertiser-lead-form';
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
    title: 'Get in touch',
    text: 'Get in touch to discuss how we can work together.'
  },
  {
    title: 'Get in touch',
    text: 'Get in touch to discuss how we can work together.'
  },
  {
    title: 'Get in touch',
    text: 'Get in touch to discuss how we can work together.'
  }
];

const reasons = [
  'Specialist audience of investigators, organisers, and associations',
  'Reviewed placements rather than open ad inventory',
  'Global relevance across core private investigation markets'
];

export const metadata: Metadata = {
  title: 'Advertise',
  description: 'Advertising and partnership options for relevant suppliers, sponsors, and event organisers in the investigator events market.'
};

export default function AdvertisePage() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="container-shell space-y-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,246,255,0.9))] p-8 shadow-[0_32px_76px_-42px_rgba(15,23,42,0.16)] sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,179,255,0.12),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(41,211,163,0.1),transparent_22%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
              <div>
                <p className="eyebrow">Advertising & Partnerships</p>
                <h1 className="section-title">Advertising for relevant industry partners.</h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                  This page is for suppliers, sponsors, and event organisers who want visibility in a real industry calendar. We review every enquiry manually so placements stay relevant and the site stays trustworthy.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {reasons.map((reason) => (
                  <div key={reason} className="rounded-[1.4rem] border border-white/80 bg-white/90 px-4 py-4 text-sm text-slate-700 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.12)]">
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <Reveal>
            <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_24px_54px_-34px_rgba(15,23,42,0.16)] sm:p-7">
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Partner Intelligence</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">What you are actually buying into.</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Placements appear inside pages people already use to browse events, compare timing, and follow associations. That keeps the context useful instead of feeling like generic display advertising.
                </p>
                <div className="mt-5 rounded-[1.4rem] border border-emerald-100 bg-[linear-gradient(145deg,rgba(236,253,245,0.98),rgba(255,255,255,0.92))] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Current scope</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Get in touch to discuss how we can work together.
                  </p>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.06}>
            <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_24px_54px_-34px_rgba(15,23,42,0.16)] sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(127,228,199,0.06),transparent_24%),radial-gradient(circle_at_18%_76%,rgba(183,138,255,0.06),transparent_28%)]" />
              <div className="relative grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <article className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-sky-700">Audience quality</p>
                  <p className="mt-2 text-sm text-slate-700">Investigators, organisers, associations, and training decision-makers.</p>
                </article>
                <article className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">Market spread</p>
                  <p className="mt-2 text-sm text-slate-700">Positioned across multiple regions rather than a single domestic audience.</p>
                </article>
                <article className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-violet-700">Format options</p>
                  <p className="mt-2 text-sm text-slate-700">Get in touch to discuss how we can work together.</p>
                </article>
              </div>
            </section>
          </Reveal>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-8">
            <Reveal>
              <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-7 shadow-[0_24px_54px_-34px_rgba(15,23,42,0.16)] sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,179,255,0.06),transparent_24%)]" />
                <h2 className="font-[var(--font-serif)] text-3xl text-slate-950">Who this page is for.</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  We work with businesses and organisers that serve investigative professionals and want focused exposure in a trusted, professional setting.
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {advertiserTypes.map((type) => (
                    <span key={type} className="rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.12)]">
                      {type}
                    </span>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal delay={0.1}>
              <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-7 shadow-[0_24px_54px_-34px_rgba(15,23,42,0.16)] sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(41,211,163,0.08),transparent_24%),radial-gradient(circle_at_18%_80%,rgba(123,124,255,0.06),transparent_22%)]" />
                <h2 className="font-[var(--font-serif)] text-3xl text-slate-950">Ways to appear on the site.</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Use the enquiry form to start a direct conversation. We review each request manually so the platform stays useful for visitors and credible for partners.
                </p>
                <div className="mt-5 space-y-3">
                  {placementOptions.map((option) => (
                    <article key={option.title} className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/60">
                      <h3 className="text-base font-semibold text-slate-950">{option.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{option.text}</p>
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
