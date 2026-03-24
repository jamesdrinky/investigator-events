import { NewsletterSignupForm } from '@/components/newsletter-signup-form';

export function HomeNewsletterSection() {
  return (
    <section id="newsletter" className="section-pad relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#eef7ff_42%,#edfdf8_100%)] pt-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(37,99,235,0.1),transparent_18%),radial-gradient(circle_at_84%_18%,rgba(6,182,212,0.08),transparent_18%),radial-gradient(circle_at_72%_84%,rgba(16,185,129,0.08),transparent_18%)]" />
      <div className="container-shell">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-sky-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_40%,#eefcf7_100%)] p-6 shadow-[0_34px_86px_-48px_rgba(37,99,235,0.2)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.1),transparent_24%),radial-gradient(circle_at_84%_22%,rgba(16,185,129,0.08),transparent_20%)]" />
          <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700">Newsletter</p>
              <h2 className="mt-4 font-[var(--font-serif)] text-3xl leading-tight text-slate-950 sm:text-4xl">
                Get new events, updates, and approaching deadlines by email
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Subscribe if you want simple weekly updates on new listings, notable upcoming dates, and useful changes to
                the calendar.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] bg-blue-50 px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-blue-700">Alerts</p>
                  <p className="mt-2 text-sm text-slate-800">New event additions</p>
                </div>
                <div className="rounded-[1.4rem] bg-emerald-50 px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-700">Planning</p>
                  <p className="mt-2 text-sm text-slate-800">Upcoming date windows</p>
                </div>
                <div className="rounded-[1.4rem] bg-slate-100 px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">Briefing</p>
                  <p className="mt-2 text-sm text-slate-800">Weekly round-up</p>
                </div>
              </div>
            </div>
            <NewsletterSignupForm />
          </div>
        </div>
      </div>
    </section>
  );
}
