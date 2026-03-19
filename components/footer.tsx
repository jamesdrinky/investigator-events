import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-[#04070d]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent_24%),radial-gradient(circle_at_18%_22%,rgba(54,168,255,0.1),transparent_26%),radial-gradient(circle_at_78%_100%,rgba(255,104,203,0.08),transparent_30%),radial-gradient(circle_at_58%_32%,rgba(29,214,202,0.08),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.04]" />
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.1fr_0.9fr_0.8fr]">
        <div className="relative">
          <p className="text-[11px] font-semibold tracking-[0.26em] text-signal2">INVESTIGATOR EVENTS</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
            The international event network for private investigators, organisers, and trusted industry partners.
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.16em] text-slate-500">
            Global event intelligence for a specialist worldwide industry.
          </p>
        </div>

        <div className="relative">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Platform</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li>
              <Link href="/calendar" className="hover:text-signal2">
                Event Calendar
              </Link>
            </li>
            <li>
              <Link href="/weekly" className="hover:text-signal2">
                Weekly Brief
              </Link>
            </li>
            <li>
              <Link href="/submit-event" className="hover:text-signal2">
                Submit Event
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-signal2">
                About
              </Link>
            </li>
            <li>
              <Link href="/advertise" className="hover:text-signal2">
                Advertise
              </Link>
            </li>
          </ul>
        </div>

        <div className="relative">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Contact</h2>
          <p className="mt-4 text-sm text-slate-300">partners@investigatorevents.com</p>
          <p className="mt-1 text-sm text-slate-500">London | Dubai | New York | Singapore</p>
        </div>
      </div>

      <div className="relative border-t border-[#161412] py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Investigator Events. All rights reserved.
      </div>
    </footer>
  );
}
