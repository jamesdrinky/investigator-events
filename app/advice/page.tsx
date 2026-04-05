import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
  title: 'Event Organiser Advice',
  description: 'Dos and don\'ts for investigator event organisers. Practical guidance on listings, communication, and running professional PI sector events.'
};

const dos = [
  {
    title: 'Confirm dates early',
    description: 'Lock in your venue and dates as far in advance as possible. Investigators plan travel and leave months ahead, especially for international events.'
  },
  {
    title: 'Publish a clear event website',
    description: 'Your event page should include confirmed dates, location, agenda outline, and registration details. Ambiguity costs you attendees.'
  },
  {
    title: 'Link your association clearly',
    description: 'Make it obvious which association is behind the event. Attendees use provenance to decide whether an event is worth their time.'
  },
  {
    title: 'Submit your listing free',
    description: 'Use this calendar to list your event for free. Reach investigators globally who would not otherwise find your event through association channels alone.'
  },
  {
    title: 'Keep your listing updated',
    description: 'If dates change, venue moves, or the event is cancelled, update or contact us promptly. Stale listings damage trust in the organiser and the calendar.'
  },
  {
    title: 'Provide a direct registration link',
    description: 'Make registration as frictionless as possible. A single clear URL to book or express interest reduces drop-off significantly.'
  },
  {
    title: 'Cater to international attendees',
    description: 'For conferences that draw overseas delegates, include visa information, accommodation suggestions, and time zone details in your communications.'
  }
];

const donts = [
  {
    title: 'Don\'t announce without confirmed dates',
    description: 'Vague "coming soon" events without fixed dates create confusion and make it impossible to list or plan around your event.'
  },
  {
    title: 'Don\'t ignore the programme',
    description: 'Investigators attend for professional development and networking. An event without a credible agenda or named speakers will struggle to fill seats.'
  },
  {
    title: 'Don\'t make attendees chase information',
    description: 'If pricing, location, or registration requires multiple emails to confirm, you will lose interest. Put the key facts front and centre.'
  },
  {
    title: 'Don\'t clash with major sector events',
    description: 'Check the global calendar before fixing your dates. Clashing with an established conference in the same region will split your potential audience.'
  },
  {
    title: 'Don\'t skip the review process',
    description: 'Listings on this calendar are reviewed before going live. Incomplete or inaccurate submissions will be rejected. Submit with accurate, verifiable details.'
  },
  {
    title: 'Don\'t overlook follow-up',
    description: 'After the event, share recordings, slides, or a summary. Attendees who benefit are more likely to return next year and recommend to colleagues.'
  },
  {
    title: 'Don\'t assume your audience is local',
    description: 'Many PI events draw delegates from multiple countries. Market accordingly and make international attendance straightforward from the outset.'
  }
];

export default function AdvicePage() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="pointer-events-none absolute left-[6%] top-[10%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(22,104,255,0.12),transparent_72%)] blur-3xl" />
      <div className="container-shell relative space-y-8">
        <Reveal>
          <header className="overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_54%,#f4fbff_100%)] p-6 shadow-[0_34px_84px_-52px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_28%,rgba(255,255,255,0.1)_56%,rgba(255,255,255,0)_100%)]" />
            <div>
              <p className="eyebrow">Organiser Advice</p>
              <h1 className="section-title">Dos and don'ts for investigator event organisers.</h1>
              <p className="section-copy max-w-3xl">
                Practical guidance for associations and organisers listing and running professional events in the private investigations sector.
              </p>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_56%,rgba(255,255,255,0)_100%)]" />
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Dos</p>
              <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">What works well</h2>
              <div className="mt-6 space-y-3">
                {dos.map((item) => (
                  <div key={item.title} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4 transition duration-300 hover:-translate-y-0.5">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">✓</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(255,247,247,0.92))] p-6 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_56%,rgba(255,255,255,0)_100%)]" />
              <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Don'ts</p>
              <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">What to avoid</h2>
              <div className="mt-6 space-y-3">
                {donts.map((item) => (
                  <div key={item.title} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4 transition duration-300 hover:-translate-y-0.5">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rose-100 text-[11px] font-bold text-rose-700">✕</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
