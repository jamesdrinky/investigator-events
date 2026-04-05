'use client';

import type { Route } from 'next';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const desktopNavItems: Array<{ href: Route; label: string }> = [
  { href: '/calendar', label: 'Events' },
  { href: '/associations', label: 'Associations' },
  { href: '/weekly', label: 'Weekly' },
  { href: '/advice', label: 'Advice' },
  { href: '/about', label: 'About' }
];

const mobileCoreItems: Array<{ href: Route; label: string }> = [
  { href: '/calendar', label: 'Browse' },
  { href: '/submit-event', label: 'Submit' },
  { href: '/about', label: 'About' }
];

const mobileMenuItems: Array<{ href: Route; label: string }> = [
  { href: '/calendar', label: 'Events' },
  { href: '/associations', label: 'Associations' },
  { href: '/weekly', label: 'Weekly' },
  { href: '/advice', label: 'Advice' },
  { href: '/about', label: 'About' }
];

function getBrowserPathname() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.pathname;
}

function getRoutePathname(href: Route) {
  const pathname = href.split('#')[0];
  return pathname || '/';
}

function isActiveRoute(pathname: string, href: Route) {
  return pathname === getRoutePathname(href);
}

export function Navbar() {
  const [pathname, setPathname] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const syncPathname = () => {
      setPathname(getBrowserPathname());
      setIsOpen(false);
    };

    syncPathname();
    window.addEventListener('popstate', syncPathname);

    return () => {
      window.removeEventListener('popstate', syncPathname);
    };
  }, []);

  const handleNavigation = (href: Route) => {
    setPathname(getRoutePathname(href));
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/88 backdrop-blur-xl">
      <div className="container-shell flex min-h-[4rem] items-center justify-between gap-3 py-2 md:min-h-[4.75rem] md:gap-5 md:py-0">
        <Link href="/" onClick={() => handleNavigation('/')} className="group flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1.1rem] bg-[linear-gradient(135deg,#1668ff,#14b8ff_62%,#645bff)] text-sm font-semibold text-white shadow-[0_18px_32px_-24px_rgba(22,104,255,0.42)] transition-transform duration-300 group-hover:scale-105 md:h-11 md:w-11 md:rounded-2xl">
            IE
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold tracking-[0.22em] text-slate-950 sm:text-sm sm:tracking-[0.26em]">INVESTIGATOR EVENTS</p>
            <p className="hidden text-[10px] uppercase tracking-[0.2em] text-slate-500 md:block">Global event discovery</p>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          {desktopNavItems.map((item) => {
            const active = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`relative py-2 text-sm font-medium ${
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
          <Link
            href={"/list-your-event" as Route}
            onClick={() => handleNavigation('/list-your-event' as Route)}
            className="btn-primary inline-flex min-h-[2.5rem] px-3.5 text-xs sm:px-4 md:text-sm"
          >
            List Your Event
          </Link>
          <button
            type="button"
            aria-controls="mobile-nav"
            aria-expanded={isOpen}
            aria-label="Toggle mobile menu"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            {isOpen ? <X className="h-[18px] w-[18px]" strokeWidth={2.1} aria-hidden="true" /> : <Menu className="h-[18px] w-[18px]" strokeWidth={2.1} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200/70 lg:hidden">
        <div className="container-shell py-2.5">
          <nav aria-label="Mobile quick navigation" className="grid grid-cols-3 gap-1.5 rounded-[1.1rem] bg-slate-100/80 p-1">
            {mobileCoreItems.map((item) => {
              const active = isActiveRoute(pathname, item.href) || (item.href === '/submit-event' && pathname === '/list-your-event');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`rounded-[0.9rem] px-3 py-2.5 text-center text-xs font-semibold transition ${
                    active ? 'bg-white text-slate-950 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.2)]' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-slate-200/80 transition-all duration-300 lg:hidden ${
          isOpen ? 'max-h-[24rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav aria-label="Mobile navigation" className="container-shell space-y-1.5 py-4">
          {mobileMenuItems.map((item) => {
            const active = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`block rounded-[1rem] px-4 py-3 text-sm font-medium ${
                  active
                    ? 'bg-slate-100 text-slate-950'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
