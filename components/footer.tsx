import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(22,104,255,0.08),transparent_22%),radial-gradient(circle_at_86%_16%,rgba(20,184,255,0.08),transparent_18%),radial-gradient(circle_at_70%_84%,rgba(100,91,255,0.06),transparent_18%)]" />
      <div className="pointer-events-none absolute left-[10%] top-6 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(22,104,255,0.12),transparent_72%)] blur-3xl" />
      <div className="container-shell relative grid gap-10 py-16 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr] lg:py-20">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1668ff,#14b8ff,#645bff)] text-sm font-semibold text-white shadow-[0_22px_46px_-24px_rgba(22,104,255,0.44)]">
            IE
          </div>
          <p className="mt-5 text-[11px] font-semibold tracking-[0.28em] text-slate-900">INVESTIGATOR EVENTS</p>
          <p className="mt-4 max-w-md font-[var(--font-serif)] text-3xl leading-[1.02] tracking-[-0.04em] text-slate-950">
            Every investigator event. One global calendar.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
            Browse live events, follow associations, and list conferences, training, and meetings for free.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">Explore</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li><Link href="/calendar" className="premium-link hover:text-slate-950">Calendar</Link></li>
            <li><Link href="/associations" className="premium-link hover:text-slate-950">Associations</Link></li>
            <li><Link href="/weekly" className="premium-link hover:text-slate-950">Weekly</Link></li>
            <li><Link href="/about" className="premium-link hover:text-slate-950">About</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">List</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li><Link href="/submit-event" className="premium-link hover:text-slate-950">Submit event</Link></li>
            <li><Link href="/advertise" className="premium-link hover:text-slate-950">Promote an event</Link></li>
            <li><Link href="/#newsletter" className="premium-link hover:text-slate-950">Newsletter</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">Contact</h2>
          <p className="mt-5 text-sm text-slate-600">partners@investigatorevents.com</p>
          <p className="mt-2 text-sm text-slate-500">Global coverage. Free listings. Reviewed submissions.</p>
          <div className="mt-6 rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,250,255,0.88))] p-4 shadow-[0_24px_48px_-30px_rgba(15,23,42,0.16)]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-blue-700">Why subscribe</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              New events, approaching dates, and one standout listing each week.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        (c) {new Date().getFullYear()} Investigator Events
      </div>
    </footer>
  );
}
