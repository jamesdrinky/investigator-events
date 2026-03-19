'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems: Array<{ href: Route; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/weekly', label: 'Weekly' },
  { href: '/submit-event', label: 'Submit Event' },
  { href: '/advertise', label: 'Advertise' },
  { href: '/about', label: 'About' }
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(180deg,rgba(5,11,24,0.92),rgba(5,11,24,0.68))] backdrop-blur-2xl">
      <div className="container-shell flex h-18 items-center justify-between gap-4">
        <Link href="/" className="group flex min-w-0 items-center gap-2">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-signal/24 bg-[linear-gradient(180deg,rgba(54,168,255,0.32),rgba(108,99,255,0.16)_58%,rgba(255,177,74,0.08))] text-sm font-semibold text-signal2 transition-transform duration-300 group-hover:scale-105">
            IE
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold tracking-[0.24em] text-slate-100 sm:text-sm">INVESTIGATOR EVENTS</p>
            <p className="truncate text-[10px] uppercase tracking-[0.22em] text-slate-400">Global event network</p>
          </div>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-2 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] px-2 py-2 md:flex"
        >
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? 'bg-[linear-gradient(135deg,rgba(54,168,255,0.22),rgba(108,99,255,0.2))] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/submit-event" className="btn-secondary hidden px-4 py-2 md:inline-flex">
            Submit Event
          </Link>

          <button
            type="button"
            aria-controls="mobile-nav"
            aria-expanded={isOpen}
            aria-label="Toggle mobile menu"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-100 transition hover:bg-white/10 md:hidden"
          >
            {isOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`md:hidden ${
          isOpen ? 'max-h-80 border-t border-white/10 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden transition-all duration-300`}
      >
        <nav aria-label="Mobile navigation" className="container-shell space-y-2 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  active ? 'bg-[linear-gradient(135deg,rgba(54,168,255,0.22),rgba(108,99,255,0.2))] text-white' : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/submit-event" className="btn-primary mt-2 inline-flex w-full px-4 py-2">
            Submit Event
          </Link>
        </nav>
      </div>
    </header>
  );
}
