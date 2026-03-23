'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems: Array<{ href: Route; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/associations', label: 'Associations' },
  { href: '/weekly', label: 'Weekly' },
  { href: '/submit-event', label: 'Submit Event' },
  { href: '/advertise', label: 'Advertise' },
  { href: '/about', label: 'About' }
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 ${
        isHome
          ? 'border-b border-white/8 bg-[linear-gradient(180deg,rgba(4,10,18,0.78),rgba(4,10,18,0.44))] backdrop-blur-xl'
          : 'border-b border-white/8 bg-[linear-gradient(180deg,rgba(6,15,25,0.96),rgba(6,15,25,0.92))]'
      }`}
    >
      <div className="container-shell flex h-18 items-center justify-between gap-4">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-white transition-transform duration-300 group-hover:scale-105 ${
              isHome
                ? 'bg-[linear-gradient(135deg,rgba(55,132,255,0.96),rgba(110,112,255,0.82),rgba(17,199,232,0.92))] shadow-[0_18px_40px_-22px_rgba(74,183,255,0.7)]'
                : 'bg-[linear-gradient(135deg,#1f8cff,#11c7e8)]'
            }`}
          >
            IE
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-100 sm:text-sm">INVESTIGATOR EVENTS</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Global industry platform</p>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-2 text-sm transition ${
                  active
                    ? 'text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-0 -bottom-[1px] h-px origin-left transition ${
                    active ? 'scale-x-100 bg-cyan-300 shadow-[0_0_16px_rgba(17,199,232,0.42)]' : 'scale-x-0 bg-white/0'
                  }`}
                />
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
                  active ? 'bg-[linear-gradient(135deg,rgba(52,179,255,0.2),rgba(41,211,163,0.2))] text-white' : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
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
