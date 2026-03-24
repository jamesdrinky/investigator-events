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
  { href: '/submit-event', label: 'List Event' },
  { href: '/about', label: 'About' }
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="container-shell flex min-h-[4.75rem] items-center justify-between gap-4">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1668ff,#14b8ff_62%,#645bff)] text-sm font-semibold text-white shadow-[0_22px_40px_-24px_rgba(22,104,255,0.48)] transition-transform duration-300 group-hover:scale-105">
            IE
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold tracking-[0.26em] text-slate-950 sm:text-sm">INVESTIGATOR EVENTS</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Global event discovery</p>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-2 text-sm ${
                  active ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-[linear-gradient(90deg,#1668ff,#14b8ff,#645bff)] transition ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/#newsletter" className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:text-slate-950 md:inline-flex">
            Newsletter
          </Link>
          <Link href="/submit-event" className="btn-primary hidden px-4 py-2 md:inline-flex">
            Submit Event
          </Link>
          <button
            type="button"
            aria-controls="mobile-nav"
            aria-expanded={isOpen}
            aria-label="Toggle mobile menu"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.18)] transition hover:bg-slate-50 md:hidden"
          >
            {isOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-slate-200/80 transition-all duration-300 md:hidden ${
          isOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav aria-label="Mobile navigation" className="container-shell space-y-2 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-2xl px-4 py-3 text-sm ${
                  active
                    ? 'bg-[linear-gradient(135deg,rgba(22,104,255,0.14),rgba(20,184,255,0.12),rgba(100,91,255,0.12))] text-slate-950'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="grid gap-2 pt-2">
            <Link href="/#newsletter" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              Newsletter
            </Link>
            <Link href="/submit-event" className="btn-primary w-full px-4 py-3">
              Submit Event
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
