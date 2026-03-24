import { NewsletterSignupForm } from '@/components/newsletter-signup-form';

export function HomeNewsletterSection() {
  return (
    <section id="newsletter" className="section-pad relative overflow-hidden pt-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_26%,rgba(34,197,94,0.03))]" />
      <div className="container-shell">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(239,248,255,0.98),rgba(245,252,247,0.98))] p-6 shadow-[0_28px_52px_-38px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,179,255,0.1),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(41,211,163,0.1),transparent_22%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div>
              <p className="eyebrow">Stay Informed</p>
              <h2 className="section-title text-slate-950">Get new events, upcoming dates, and the weekly brief in one place</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Join the list if you want to know when new events are added, when important dates are approaching, or when
                the weekly update is published.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Alerts</p>
                  <p className="mt-1 text-sm text-slate-700">New event additions</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Planning</p>
                  <p className="mt-1 text-sm text-slate-700">Upcoming date windows</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Briefing</p>
                  <p className="mt-1 text-sm text-slate-700">Weekly round-up</p>
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
