import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

export function CTASection() {
  return (
    <section className="section-pad relative overflow-hidden bg-[linear-gradient(180deg,#f6fbff_0%,#ffffff_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(37,99,235,0.08),transparent_18%),radial-gradient(circle_at_84%_18%,rgba(6,182,212,0.08),transparent_18%),radial-gradient(circle_at_72%_82%,rgba(16,185,129,0.08),transparent_18%)]" />
      <div className="container-shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.1rem] border border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#edf5ff_42%,#ecfbf6_100%)] p-6 shadow-[0_34px_84px_-48px_rgba(37,99,235,0.2)] sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.1),transparent_22%),radial-gradient(circle_at_84%_24%,rgba(16,185,129,0.08),transparent_20%)]" />
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700">Submit / Advertise</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-3xl leading-tight text-slate-950 sm:text-4xl">
                  Add your event or reserve a future promoted placement
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  Submit an event for free now, or explore future promotion opportunities for higher visibility on the platform.
                </p>
              </div>
              <Link href="/submit-event" className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#06b6d4)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(37,99,235,0.48)] transition hover:-translate-y-0.5">
                Submit event free
              </Link>
              <Link href="/advertise" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                Promote event
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
