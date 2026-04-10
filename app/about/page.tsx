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
  { title: 'One place to browse', description: 'Track investigator conferences, training, and association meetings worldwide in one clear calendar.', color: 'border-blue-200 bg-blue-50/50', accent: 'text-blue-600' },
  { title: 'A clearer planning view', description: 'Compare timing more quickly and reduce the risk of avoidable date clashes.', color: 'border-violet-200 bg-violet-50/50', accent: 'text-violet-600' },
  { title: 'Clear links behind each event', description: 'See which association or organiser is behind a listing before you commit time or travel.', color: 'border-cyan-200 bg-cyan-50/50', accent: 'text-cyan-600' },
];

const credibilityPoints = [
  '25+ years in international investigations',
  "Spear's 500 Top Investigator",
  'Investigator of the Year (2016)',
  'President, Association of British Investigators',
  'Former President, World Association of Detectives',
  'Global investigations leadership',
];

const platformExpectations = [
  'Live event listings with clear dates, locations, and organiser details.',
  'Clear links between events and the association or organiser behind them.',
  'Free submissions, with review before publication so the calendar stays credible.',
];

export default async function AboutPage() {
  return (
    <section className="relative overflow-hidden">
      {/* ── Hero ── */}
      <div className="relative bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-10 pt-24 sm:pb-16 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.06),transparent_35%)]" />
        <div className="container-shell relative">
          <Reveal>
            <div className="max-w-3xl">
              <p className="eyebrow">About</p>
              <h1 className="mt-4 text-[2.2rem] font-bold leading-[0.9] tracking-[-0.06em] text-slate-950 sm:text-[3.5rem] lg:text-[5rem]">
                What Investigator Events is, and why it exists.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:mt-6 sm:text-lg">
                A practical calendar for the private investigations sector. It brings live conferences, training, and association events into one place so professionals can compare timing, check provenance, and see who is behind each listing.
              </p>
            </div>
          </Reveal>

          {/* Pillar cards */}
          <Reveal delay={0.06}>
            <div className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4">
              {pillars.map((p) => (
                <div key={p.title} className={`rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6 ${p.color}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px] ${p.accent}`}>{p.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{p.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Conference atmosphere ── */}
      <div className="relative h-48 w-full overflow-hidden sm:h-64 lg:h-80" style={{ contain: 'layout paint' }}>
        <Image src="/conference/conference4.avif" alt="Panel discussion at a professional conference" fill className="object-cover object-[center_60%]" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white/50" />
      </div>

      {/* ── Content ── */}
      <div className="container-shell relative py-10 sm:py-16">
        {/* Introduction video */}
        <Reveal>
          <div className="mb-10 sm:mb-14">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-500 sm:text-xs">Watch</p>
              <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950 sm:text-2xl">A quick introduction from the founder</h2>
            </div>
            <div className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl border border-slate-200/60 bg-black shadow-[0_16px_50px_-16px_rgba(15,23,42,0.18)] sm:rounded-[1.6rem]">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  controls
                  preload="metadata"
                  poster="/faces/mike2.png"
                  playsInline
                >
                  <source src="/video/about-intro.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            <p className="mx-auto mt-3 max-w-lg text-center text-xs text-slate-400">
              Mike LaCorte introduces Investigator Events and explains why the platform exists.
            </p>
          </div>
        </Reveal>

        {/* Mike LaCorte — glassmorphism profile card */}
        <Reveal>
          <div className="overflow-hidden rounded-[1.6rem] border border-slate-200/60 bg-[linear-gradient(135deg,#f8faff_0%,#f0f4ff_40%,#ede9fe_70%,#faf5ff_100%)] p-6 shadow-[0_8px_30px_-12px_rgba(99,102,241,0.1)] sm:rounded-[2rem] sm:p-8 lg:p-10">
            <div className="grid items-start gap-8 lg:grid-cols-[14rem_1fr] lg:gap-12">
              <div className="relative mx-auto w-full max-w-[12rem] lg:mx-0">
                <div className="pointer-events-none absolute inset-[-16%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12),transparent_60%)]" />
                <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_50px_-16px_rgba(15,23,42,0.25)]">
                  <Image src="/faces/mike2.png" alt="Mike LaCorte" width={300} height={360} className="h-auto w-full object-cover" />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-500 sm:text-xs">Why Trust It</p>
                <h2 className="mt-2 text-[1.6rem] font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-3xl lg:text-4xl">
                  Built by someone with real standing in the profession.
                </h2>
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-950 sm:text-xl">Mike LaCorte</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">CEO, Conflict International · ABI President · IKD Secretary General</p>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">I help law firms, corporates, and HNWIs solve complex cross-border investigations.</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {credibilityPoints.map((point) => (
                    <span key={point} className="rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm">{point}</span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                  {['International Investigations', 'Asset Tracing', 'Corporate Risk', 'Litigation Support', 'OSINT / HUMINT'].map((s) => (
                    <span key={s} className="text-[11px] font-medium text-slate-400">{s}</span>
                  ))}
                </div>

                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-600">
                  Investigator Events was built because there was no neutral, genuinely useful global calendar for this space. It exists to make legitimate events easier to find, compare, and trust at a glance.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Founder's Note */}
        <Reveal delay={0.04}>
          <div className="mt-10 sm:mt-14">
            <div className="mx-auto max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-500 sm:text-xs">From the Founder</p>
              <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950 sm:text-2xl lg:text-3xl">Why this exists</h2>

              <div className="mt-6 space-y-4 text-[15px] leading-[1.75] text-slate-600">
                <p>I have spent my career in international investigations and I still feel lucky to be part of this world. It is a community before it is an industry. The people in it are sharp, generous, fiercely independent, and surprisingly good company at a hotel bar after a long day of conference sessions.</p>

                <p>Over the years I have been fortunate enough to hold senior positions across several of the associations that serve this profession, as President of the Association of British Investigators, Secretary General of the IKD, and through President and Chairman roles within the World Association of Detectives. Those roles gave me a front-row seat to an industry with great events, run by good people, that many investigators never heard about until it was too late.</p>

                <p>The problem was never a shortage of conferences, training, or association gatherings. The problem was that nobody could see the full picture. Every organisation promoted its own calendar, on its own website, to its own members. Dates clashed without anyone realising. Investigators booked one event and missed another they would have loved. Organisers set dates in the dark.</p>

                <p>I care about this because I have seen what happens when people actually show up. Conferences are where investigators meet the person they will trust with a referral three years later. They are where someone early in their career realises how far this profession can take them. They are where association leaders sit together and quietly move things forward for everyone else. When those gatherings are easy to find and well attended, the whole community benefits.</p>

                <p>I also care about the associations themselves. The people who run them do it because they believe in the profession, often voluntarily, often without much thanks. If a shared calendar means better attendance at their events and fewer avoidable clashes, that alone makes this worth doing.</p>

                <p>Investigator Events is a free platform, built for a community I am proud to be part of. It is not a commercial layer between associations and their members. It is a single calendar that makes the industry easier to see, easier to plan around, and a little harder to miss.</p>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Image src="/faces/mike2.png" alt="Mike LaCorte" width={56} height={56} className="h-14 w-14 rounded-full object-cover shadow-md" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Mike LaCorte</p>
                  <p className="text-xs text-slate-500">Founder, Investigator Events</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Conference audience */}
        <div className="relative -mx-4 mt-10 h-48 overflow-hidden sm:-mx-6 sm:mt-14 sm:h-64 sm:rounded-2xl lg:-mx-10 lg:h-72" style={{ contain: 'layout paint' }}>
          <Image src="/conference/conference7.avif" alt="Audience at an industry conference" fill className="object-cover object-[center_45%]" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
        </div>

        {/* What you can expect */}
        <Reveal delay={0.06}>
          <div className="mt-10 grid gap-8 sm:mt-14 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 sm:text-xs">What You Can Expect</p>
              <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950 sm:text-2xl lg:text-3xl">A cleaner, more useful way to navigate the event calendar.</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">The platform is designed to help professionals assess relevance quickly, understand provenance, and make decisions with less friction.</p>
            </div>
            <div className="space-y-3">
              {platformExpectations.map((item, i) => (
                <div key={item} className="flex gap-4 rounded-xl border border-slate-200/60 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">{i + 1}</div>
                  <p className="text-sm leading-relaxed text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={0.08}>
          <div className="mt-10 rounded-2xl bg-[linear-gradient(135deg,#f0f4ff,#ede9fe,#faf5ff)] p-8 text-center sm:mt-14 sm:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-500 sm:text-xs">Next Step</p>
            <h2 className="mx-auto mt-2 max-w-lg text-xl font-bold tracking-[-0.03em] text-slate-950 sm:text-2xl">Browse the network or go straight to the live calendar.</h2>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/calendar" className="btn-primary px-6 py-3">Browse events</Link>
              <Link href="/associations" className="btn-secondary px-6 py-3">View associations</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
