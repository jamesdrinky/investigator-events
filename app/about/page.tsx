import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description: 'Why Investigator Events exists, how the calendar works, and who is behind the platform.'
};

const credibilityPoints = [
  '25+ years in international investigations',
  "Spear's 500 Top Investigator",
  'Investigator of the Year (2016)',
  'President, Association of British Investigators',
  'Former President, World Association of Detectives',
  'Global investigations leadership',
];

const platformExpectations = [
  { icon: '1', text: 'Live event listings with clear dates, locations, and organiser details.' },
  { icon: '2', text: 'Clear links between events and the association or organiser behind them.' },
  { icon: '3', text: 'Free submissions, with review before publication so the calendar stays credible.' },
];

export default async function AboutPage() {
  return (
    <div className="relative">
      {/* ── Hero with conference crowd image ── */}
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-slate-950 sm:min-h-[80vh]">
        <Image
          src="/conference/hugeconference.avif"
          alt="Professional investigators at a global conference"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />

        <div className="container-shell relative z-10 pb-14 pt-32 sm:pb-20">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-400 sm:text-xs">About Investigator Events</p>
            <h1 className="mt-4 max-w-2xl text-[2.2rem] font-bold leading-[0.92] tracking-[-0.05em] text-white sm:text-[3.5rem] lg:text-[4.5rem]">
              What this is, and why it exists.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              A practical calendar for the private investigations sector — bringing conferences, training, and association events into one place.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Three pillars ── */}
      <section className="border-b border-slate-200/60 bg-white">
        <div className="container-shell py-14 sm:py-20">
          <Reveal>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { label: 'Browse', title: 'One place for everything', desc: 'Track investigator conferences, training, and association meetings worldwide in one clear calendar.', gradient: 'from-blue-600 to-blue-400' },
                { label: 'Plan', title: 'See the full picture', desc: 'Compare timing more quickly and reduce the risk of avoidable date clashes.', gradient: 'from-violet-600 to-violet-400' },
                { label: 'Trust', title: 'Know who is behind it', desc: 'See which association or organiser is behind a listing before you commit time or travel.', gradient: 'from-cyan-600 to-cyan-400' },
              ].map((p) => (
                <div key={p.label} className="group rounded-2xl border border-slate-200/60 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8">
                  <span className={`inline-block bg-gradient-to-r ${p.gradient} bg-clip-text text-[10px] font-bold uppercase tracking-[0.2em] text-transparent`}>{p.label}</span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{p.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Mike LaCorte — founder section ── */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-15">
          <Image src="/conference/conference7.avif" alt="" fill className="object-cover object-[center_45%]" sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/80" />

        <div className="container-shell relative z-10 py-16 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_18rem] lg:gap-16">
            <div>
              <Reveal>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-400 sm:text-xs">The Founder</p>
                <h2 className="mt-3 text-[1.8rem] font-bold leading-tight tracking-[-0.04em] text-white sm:text-3xl lg:text-4xl">
                  Built by someone with real standing in the profession.
                </h2>
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-white">Mike LaCorte</h3>
                  <p className="mt-1 text-sm text-slate-400">CEO, Conflict International &middot; Founder, Investigator Events</p>
                </div>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-300">I help law firms, corporates, and HNWIs solve complex cross-border investigations.</p>

                <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {credibilityPoints.map((point) => (
                    <div key={point} className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-sm transition hover:bg-white/10">
                      <p className="text-[11px] font-medium leading-snug text-slate-200">{point}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="mx-auto max-w-[16rem] lg:mx-0">
                <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_60px_-16px_rgba(0,0,0,0.5)]">
                  <Image src="/faces/mike2.png" alt="Mike LaCorte" width={300} height={360} className="h-auto w-full object-cover" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Conference reel — with audio ── */}
      <section className="bg-slate-950 pb-16 sm:pb-24">
        <div className="container-shell">
          <Reveal>
            <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">See it in action</p>
            <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <video
                controls
                playsInline
                preload="metadata"
                poster="/conference/hugeconference.avif"
                className="w-full"
              >
                <source src="/conference/ie-reel.mp4" type="video/mp4" />
              </video>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Why this exists — long-form ── */}
      <section className="bg-white">
        <div className="container-shell py-16 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-500 sm:text-xs">From the Founder</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">Why this exists</h2>

              <div className="mt-8 space-y-5 text-[15px] leading-[1.8] text-slate-600">
                <p>I have spent my career in international investigations and I still feel lucky to be part of this world. It is a community before it is an industry. The people in it are sharp, generous, fiercely independent, and surprisingly good company at a hotel bar after a long day of conference sessions.</p>

                <p>Over the years I have been fortunate enough to hold senior positions across several of the associations that serve this profession, as President of the Association of British Investigators, Secretary General of the IKD, and through President and Chairman roles within the World Association of Detectives. Those roles gave me a front-row seat to an industry with great events, run by good people, that many investigators never heard about until it was too late.</p>

                <p>The problem was never a shortage of conferences, training, or association gatherings. The problem was that nobody could see the full picture. Every organisation promoted its own calendar, on its own website, to its own members. Dates clashed without anyone realising. Investigators booked one event and missed another they would have loved. Organisers set dates in the dark.</p>

                <p>I care about this because I have seen what happens when people actually show up. Conferences are where investigators meet the person they will trust with a referral three years later. They are where someone early in their career realises how far this profession can take them. They are where association leaders sit together and quietly move things forward for everyone else. When those gatherings are easy to find and well attended, the whole community benefits.</p>

                <p>I also care about the associations themselves. The people who run them do it because they believe in the profession, often voluntarily, often without much thanks. If a shared calendar means better attendance at their events and fewer avoidable clashes, that alone makes this worth doing.</p>

                <p>Investigator Events is a free platform, built for a community I am proud to be part of. It is not a commercial layer between associations and their members. It is a single calendar that makes the industry easier to see, easier to plan around, and a little harder to miss.</p>
              </div>

              <div className="mt-10 flex items-center gap-4 border-t border-slate-200 pt-8">
                <Image src="/faces/mike2.png" alt="Mike LaCorte" width={56} height={56} className="h-14 w-14 rounded-full object-cover shadow-md" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Mike LaCorte</p>
                  <p className="text-xs text-slate-500">Founder, Investigator Events</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── What you can expect ── */}
      <section className="border-t border-slate-200/60 bg-slate-50">
        <div className="container-shell py-16 sm:py-24">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-600 sm:text-xs">What You Can Expect</p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">A cleaner, more useful way to navigate the event calendar.</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-500">The platform is designed to help professionals assess relevance quickly, understand provenance, and make decisions with less friction.</p>
              </div>
              <div className="space-y-3">
                {platformExpectations.map((item) => (
                  <div key={item.icon} className="flex gap-4 rounded-xl border border-slate-200/60 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{item.icon}</div>
                    <p className="text-sm leading-relaxed text-slate-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.08),transparent_50%)]" />
        <div className="container-shell relative z-10 py-16 text-center sm:py-24">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-400 sm:text-xs">Next Step</p>
            <h2 className="mx-auto mt-4 max-w-lg text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">Browse the network or go straight to the live calendar.</h2>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/calendar" className="inline-flex min-h-[3rem] items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-blue-50">Browse events</Link>
              <Link href="/associations" className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10">View associations</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
