'use client';

import type { Route } from 'next';
import { Menu, X, LogOut, User, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { GlobalSearch } from '@/components/GlobalSearch';
import { UserAvatar } from '@/components/UserAvatar';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const desktopNavItems: Array<{ href: Route; label: string }> = [
  { href: '/calendar', label: 'Events' },
  { href: '/associations', label: 'Associations' },
  { href: '/people', label: 'Community' },
  { href: '/advice', label: 'Advice' },
  { href: '/about', label: 'About' }
];

const mobileMenuItems: Array<{ href: Route; label: string }> = [
  { href: '/calendar', label: 'Events' },
  { href: '/associations', label: 'Associations' },
  { href: '/people', label: 'Community' },
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

const DARK_ROUTES = ['/advice'];

export function Navbar() {
  const [pathname, setPathname] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDark = DARK_ROUTES.includes(pathname);

  useEffect(() => {
    const syncPathname = () => {
      setPathname(getBrowserPathname());
      setIsOpen(false);
    };
    syncPathname();
    window.addEventListener('popstate', syncPathname);
    return () => window.removeEventListener('popstate', syncPathname);
  }, []);

  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  // Auth state
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from('profiles').select('avatar_url').eq('id', data.user.id).single().then(({ data: p }) => {
          if (p?.avatar_url) setProfileAvatar(p.avatar_url);
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setShowDropdown(false);
    window.location.href = '/';
  };

  const avatarUrl = profileAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

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
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md sm:backdrop-blur-xl ${isDark ? 'border-white/[0.06] bg-[#080f1e]/90' : 'border-slate-200/70 bg-white/92 sm:bg-white/88'}`}>
        <div className="container-shell flex min-h-[3.25rem] items-center justify-between gap-2.5 py-1.5 sm:min-h-[4rem] sm:gap-3 md:min-h-[4.75rem] md:gap-5 md:py-0">
          {/* Logo */}
          <Link href="/" onClick={() => handleNavigation('/')} className="group flex shrink-0 items-center gap-2.5 sm:gap-3">
            <Image
              src="/logo/ie-none.png"
              alt="Investigator Events"
              width={1536}
              height={1024}
              priority
              className="h-10 w-auto shrink-0 object-contain sm:h-11 md:h-12"
              sizes="(max-width: 639px) 96px, 112px"
            />
            <div className="hidden sm:block">
              <p className={`whitespace-nowrap text-[11px] font-semibold tracking-[0.22em] sm:text-sm sm:tracking-[0.26em] ${isDark ? 'text-white' : 'text-slate-950'}`}>INVESTIGATOR EVENTS</p>
              <p className={`hidden whitespace-nowrap text-[10px] uppercase tracking-[0.2em] md:block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Global event discovery</p>
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
                  className={`relative py-2 text-sm font-medium ${
                    isDark
                      ? (active ? 'text-white' : 'text-white/50 hover:text-white')
                      : (active ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950')
                  }`}
                >
                  {item.label}
                  <span className={`absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-[linear-gradient(90deg,#1668ff,#14b8ff,#645bff)] transition ${active ? 'scale-x-100' : 'scale-x-0'}`} />
                </Link>
              );
            })}
          </nav>

          {/* Search + Right side */}
          <div className="flex items-center gap-2">
            <GlobalSearch isDark={isDark} />
            {user ? (
              <div ref={dropdownRef} className="relative">
                <Link
                  href="/messages"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
                  title="Messages"
                >
                  <MessageCircle className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowDropdown((c) => !c)}
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-2 ring-blue-500/20 transition hover:ring-blue-500/40"
                >
                  <UserAvatar src={avatarUrl} name={user.user_metadata?.full_name} size={32} />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
                    <Link
                      href="/profile"
                      onClick={() => { handleNavigation('/profile' as Route); setShowDropdown(false); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => handleNavigation('/signin' as Route)}
                  className={`hidden text-sm font-medium sm:inline-flex ${isDark ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  Sign in
                </Link>
                <Link
                  href="/weekly"
                  className="btn-glow-nav hidden min-h-[2.5rem] px-3.5 text-xs sm:inline-flex sm:px-4 md:text-sm"
                >
                  Subscribe Free
                </Link>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsOpen((c) => !c)}
              className={`relative z-[60] inline-flex h-9 w-9 items-center justify-center rounded-xl border transition sm:h-10 sm:w-10 lg:hidden ${
                isDark ? 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10' : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
              }`}
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
              href="/weekly"
              onClick={() => { handleNavigation('/weekly' as Route); }}
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
