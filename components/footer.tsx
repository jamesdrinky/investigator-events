import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(22,104,255,0.1),transparent_22%),radial-gradient(circle_at_86%_16%,rgba(20,184,255,0.1),transparent_18%),radial-gradient(circle_at_70%_84%,rgba(100,91,255,0.08),transparent_18%),radial-gradient(circle_at_54%_14%,rgba(236,72,153,0.04),transparent_18%)]" />
      <div className="pointer-events-none absolute left-[10%] top-6 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(22,104,255,0.14),transparent_72%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[12%] top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(111,86,255,0.12),transparent_72%)] blur-3xl" />
      <div className="container-shell relative grid gap-6 py-8 sm:gap-10 sm:py-16 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr] lg:py-20">
        <div>
          <Image src="/logo/ie-none.png" alt="Investigator Events" width={64} height={64} className="h-14 w-14 rounded-2xl object-contain sm:h-16 sm:w-16" />
          <p className="mt-5 text-[11px] font-semibold tracking-[0.28em] text-slate-900">INVESTIGATOR EVENTS</p>
          <p className="mt-3 max-w-md font-[var(--font-serif)] text-[1.95rem] leading-[1.02] tracking-[-0.04em] text-slate-950 sm:mt-4 sm:text-3xl">
            Every investigator event. One global calendar.
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 sm:mt-4">
            Browse live events, follow associations, and list conferences, training, and meetings for free.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:block">
          <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">Explore</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li><Link href="/calendar" className="premium-link hover:text-slate-950">Calendar</Link></li>
            <li><Link href="/associations" className="premium-link hover:text-slate-950">Associations</Link></li>
            <li><Link href="/weekly" className="premium-link hover:text-slate-950">Weekly</Link></li>
            <li><Link href="/about" className="premium-link hover:text-slate-950">About</Link></li>
            <li><Link href="/privacy" className="premium-link hover:text-slate-950">Privacy</Link></li>
          </ul>
          </div>

          <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">List</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li><Link href="/submit-event" className="premium-link hover:text-slate-950">Submit event</Link></li>
            <li><Link href="/advertise" className="premium-link hover:text-slate-950">Advertise or partner</Link></li>
            <li><Link href="/weekly#signup" className="premium-link hover:text-slate-950">Email updates</Link></li>
            <li><Link href="/advice" className="premium-link hover:text-slate-950">Organiser advice</Link></li>
          </ul>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">Contact</h2>
          <p className="mt-3 text-sm text-slate-600 sm:mt-5">partners@investigatorevents.com</p>
          <p className="mt-2 text-sm text-slate-500">Global coverage. Free listings. Reviewed submissions.</p>
          <div className="mt-6 hidden rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,250,255,0.88))] p-4 shadow-[0_24px_48px_-30px_rgba(15,23,42,0.16)] sm:block">
            <p className="text-[10px] uppercase tracking-[0.18em] text-blue-700">Email updates</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Read the weekly page or subscribe for new events, approaching dates, and one useful featured listing.
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
