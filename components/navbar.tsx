'use client';

import type { Route } from 'next';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const desktopNavItems: Array<{ href: Route; label: string }> = [
  { href: '/calendar', label: 'Events' },
  { href: '/associations', label: 'Associations' },
  { href: '/weekly', label: 'Weekly' },
  { href: '/advice', label: 'Advice' },
  { href: '/about', label: 'About' }
];

const mobileMenuItems: Array<{ href: Route; label: string }> = [
  { href: '/calendar', label: 'Events' },
  { href: '/associations', label: 'Associations' },
  { href: '/weekly', label: 'Weekly' },
  { href: '/submit-event', label: 'Submit Event' },
  { href: '/advice', label: 'Advice' },
  { href: '/about', label: 'About' }
];

function getBrowserPathname() {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

function getRoutePathname(href: Route) {
  return href.split('#')[0] || '/';
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
    return () => window.removeEventListener('popstate', syncPathname);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNavigation = (href: Route) => {
    setPathname(getRoutePathname(href));
    setIsOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/92 backdrop-blur-md sm:bg-white/88 sm:backdrop-blur-xl">
        <div className="container-shell flex min-h-[3.25rem] items-center justify-between gap-2.5 py-1.5 sm:min-h-[4rem] sm:gap-3 md:min-h-[4.75rem] md:gap-5 md:py-0">
          {/* Logo */}
          <Link href="/" onClick={() => handleNavigation('/')} className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Image
              src="/logo/ie-none.png"
              alt="Investigator Events"
              width={1536}
              height={1024}
              priority
              className="h-10 w-auto shrink-0 object-contain sm:h-11 md:h-12"
              sizes="(max-width: 639px) 96px, 112px"
            />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-[11px] font-semibold tracking-[0.22em] text-slate-950 sm:text-sm sm:tracking-[0.26em]">INVESTIGATOR EVENTS</p>
              <p className="hidden text-[10px] uppercase tracking-[0.2em] text-slate-500 md:block">Global event discovery</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
            {desktopNavItems.map((item) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`relative py-2 text-sm font-medium ${active ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  {item.label}
                  <span className={`absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-[linear-gradient(90deg,#1668ff,#14b8ff,#645bff)] transition ${active ? 'scale-x-100' : 'scale-x-0'}`} />
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/#newsletter"
              className="btn-glow-nav hidden min-h-[2.5rem] px-3.5 text-xs sm:inline-flex sm:px-4 md:text-sm"
            >
              Subscribe Free
            </Link>
            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsOpen((c) => !c)}
              className="relative z-[60] inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 transition hover:bg-slate-50 sm:h-10 sm:w-10 lg:hidden"
            >
              {isOpen
                ? <X className="h-[18px] w-[18px]" strokeWidth={2.2} />
                : <Menu className="h-[18px] w-[18px]" strokeWidth={2.2} />
              }
            </button>
          </div>
        </div>
      </header>

      {/* ── Apple-style full-screen mobile menu overlay ── */}
      <div
        className={`fixed inset-0 z-[55] bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Top bar with logo + close */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" onClick={() => handleNavigation('/')} className="flex items-center gap-2.5">
            <Image src="/logo/ie-none.png" alt="Investigator Events" width={40} height={40} className="h-9 w-auto object-contain" />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:text-slate-950"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex h-[calc(100%-4rem)] flex-col justify-center px-8 pb-20">
          <ul className="space-y-1">
            {mobileMenuItems.map((item, i) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={`block py-3 text-[2rem] font-semibold tracking-[-0.02em] transition-colors duration-200 ${
                      active ? 'text-slate-950' : 'text-slate-400 hover:text-slate-950'
                    }`}
                    style={{
                      transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                      opacity: isOpen ? 1 : 0,
                      transition: `transform 0.4s cubic-bezier(0.16,1,0.3,1) ${0.05 * i}s, opacity 0.3s ease ${0.05 * i}s`,
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* CTAs at bottom */}
          <div
            className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-8"
            style={{
              transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
              opacity: isOpen ? 1 : 0,
              transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1) 0.35s, opacity 0.3s ease 0.35s',
            }}
          >
            <Link
              href="/#newsletter"
              onClick={() => { handleNavigation('/' as Route); }}
              className="btn-glow inline-flex w-full justify-center px-6 py-4 text-base"
            >
              Subscribe Free
            </Link>
            <Link
              href="/calendar"
              onClick={() => handleNavigation('/calendar')}
              className="btn-glow-outline inline-flex w-full justify-center px-6 py-3.5 text-sm"
            >
              Browse Events
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
