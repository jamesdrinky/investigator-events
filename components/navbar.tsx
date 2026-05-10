'use client';

import type { Route } from 'next';
import { Menu, X, LogOut, User, Send, Bell, UserPlus, UserCheck, Heart, MessageCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { registerPushNotifications, unregisterPushToken } from '@/lib/capacitor';
import { GlobalSearch } from '@/components/GlobalSearch';
import { UserAvatar } from '@/components/UserAvatar';
import { ShinyButton } from '@/components/ui/shiny-button';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const desktopNavItems: Array<{ href: Route; label: string; authOnly?: boolean }> = [
  { href: '/calendar', label: 'Events' },
  { href: '/associations', label: 'Associations' },
  { href: '/people', label: 'Forum' },
  { href: '/reviews' as Route, label: 'Reviews', authOnly: true },
  { href: '/advice', label: 'Advice' },
  { href: '/about', label: 'About' }
];

const mobileMenuItems: Array<{ href: Route; label: string; authOnly?: boolean }> = [
  { href: '/calendar', label: 'Events' },
  { href: '/calendar?view=calendar' as Route, label: 'Calendar' },
  { href: '/associations', label: 'Associations' },
  { href: '/people', label: 'Forum' },
  { href: '/reviews' as Route, label: 'Reviews', authOnly: true },
  { href: '/why-join-an-association' as Route, label: 'Why Join?' },
  { href: '/advice', label: 'Advice' },
  { href: '/about', label: 'About' }
];

function getBrowserPathname() {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

function getRoutePathname(href: Route) {
  return href.split(/[?#]/)[0] || '/';
}

function isActiveRoute(pathname: string, href: Route) {
  return pathname === getRoutePathname(href);
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const DARK_ROUTES = ['/about'];

export function Navbar() {
  const [pathname, setPathname] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
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

  // Auth state + unread count
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from('profiles').select('avatar_url').eq('id', data.user.id).single().then(({ data: p }) => {
          if (p?.avatar_url) setProfileAvatar(p.avatar_url);
        });
        // Fetch unread message count
        supabase.from('messages' as any).select('id', { count: 'exact', head: true }).eq('receiver_id', data.user.id).eq('is_read', false).then(({ count }) => {
          setUnreadCount(count ?? 0);
        });
        // Fetch unread notification count
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', data.user.id).eq('is_read', false).then(({ count }) => {
          setNotifCount(count ?? 0);
        });
        // Update last_seen
        supabase.from('profiles').update({ last_seen: new Date().toISOString() } as any).eq('id', data.user.id).then(() => {});
        // Register for push notifications on native app
        registerPushNotifications(supabase);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        registerPushNotifications(supabase);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Poll unread count every 15s
  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    const interval = setInterval(() => {
      supabase.from('messages' as any).select('id', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('is_read', false).then(({ count }) => {
        setUnreadCount(count ?? 0);
      });
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false).then(({ count }) => {
        setNotifCount(count ?? 0);
      });
      // Update last_seen
      supabase.from('profiles').update({ last_seen: new Date().toISOString() } as any).eq('id', user.id).then(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await unregisterPushToken(supabase);
    await supabase.auth.signOut();
    setShowDropdown(false);
    window.location.href = '/';
  };

  const avatarUrl = profileAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  // Lock the actual mobile scroll container when the menu is open.
  // The app shell scrolls [data-app-content], so body/window locking is
  // unreliable on mobile pages and can make the header appear to jump.
  useEffect(() => {
    const appContent = document.querySelector<HTMLElement>('[data-app-content]');
    if (isOpen) {
      if (appContent) appContent.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      if (appContent) appContent.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      if (appContent) appContent.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigation = (href: Route) => {
    setPathname(getRoutePathname(href));
    setIsOpen(false);
  };

  return (
    <>
      <header className={`sticky top-0 z-[80] shrink-0 border-b backdrop-blur-md sm:backdrop-blur-xl ${isDark ? 'border-white/[0.06] bg-[#080f1e]/90' : 'border-slate-200/70 bg-white/92 sm:bg-white/88'}`} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex min-h-[3.25rem] max-w-7xl items-center gap-2 px-4 py-1.5 sm:min-h-[4rem] sm:gap-2 sm:px-5 md:min-h-[4.75rem] md:gap-3 md:py-0 lg:px-6">
          {/* Logo */}
          <Link href="/" onClick={() => handleNavigation('/')} className="group flex shrink-0 items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-sm sm:h-10 sm:w-10 md:h-11 md:w-11">
              <Image
                src="/logo/ielogo1.PNG"
                alt="Investigator Events"
                width={48}
                height={48}
                priority
                className="h-full w-full scale-[1.35] object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <p className={`whitespace-nowrap text-[11px] font-semibold tracking-[0.14em] sm:text-[13px] sm:tracking-[0.16em] ${isDark ? 'text-white' : 'text-slate-950'}`}>INVESTIGATOR EVENTS</p>
              <p className={`hidden whitespace-nowrap text-[10px] uppercase tracking-[0.14em] md:block ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Global event discovery</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden min-w-0 flex-1 items-center gap-0.5 lg:flex">
            {desktopNavItems.filter((item) => !item.authOnly || user).map((item) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`relative rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all duration-300 hover:-translate-y-[1px] ${
                    isDark
                      ? (active ? 'bg-white/15 text-white shadow-[0_0_18px_rgba(34,211,238,0.25),0_0_6px_rgba(255,255,255,0.1)]' : 'text-white/50 hover:bg-white/8 hover:text-white hover:shadow-[0_0_22px_rgba(34,211,238,0.2),0_0_8px_rgba(255,255,255,0.08)]')
                      : (active ? 'bg-slate-900 text-white shadow-[0_4px_20px_-4px_rgba(59,130,246,0.4),0_0_10px_rgba(99,102,241,0.15)]' : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-[0_4px_24px_-4px_rgba(59,130,246,0.3),0_0_12px_rgba(99,102,241,0.1)]')
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search + Right side */}
          <div className="flex shrink-0 items-center gap-2">
            <GlobalSearch isDark={isDark} />
            {user ? (
              <div ref={dropdownRef} className="relative flex items-center gap-2">
                <Link
                  href="/submit-event"
                  className={`hidden whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition sm:inline-flex ${isDark ? 'text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/10' : 'text-blue-600 border border-blue-200 hover:bg-blue-50'}`}
                >
                  Submit Event
                </Link>
                {/* Notifications bell */}
                <div ref={notifRef} className="relative">
                  <button
                    type="button"
                    onClick={async () => {
                      const opening = !showNotifs;
                      setShowNotifs(opening);
                      if (opening && notifications.length === 0) {
                        setLoadingNotifs(true);
                        try {
                          const res = await fetch('/api/notifications');
                          const data = await res.json();
                          setNotifications(data.notifications ?? []);
                        } catch {}
                        setLoadingNotifs(false);
                      }
                      if (opening && notifCount > 0) {
                        // Mark all as read
                        fetch('/api/notifications', { method: 'PATCH' }).then(() => setNotifCount(0)).catch(() => {});
                      }
                    }}
                    className={`relative flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition ${
                      isDark
                        ? 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        : 'border-slate-200/80 bg-white text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                    }`}
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {notifCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                        {notifCount > 99 ? '99+' : notifCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="fixed inset-x-0 z-[95] rounded-b-2xl border-b border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:rounded-xl sm:border" style={{ top: 'calc(3.25rem + env(safe-area-inset-top, 0px))' }}>
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-bold text-slate-900">Notifications</p>
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              fetch('/api/notifications', { method: 'PATCH' }).catch(() => {});
                              setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
                              setNotifCount(0);
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {loadingNotifs ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="py-10 text-center">
                            <Bell className="mx-auto h-8 w-8 text-slate-200" />
                            <p className="mt-2 text-sm text-slate-400">No notifications yet</p>
                            <p className="mt-1 text-xs text-slate-300">When people follow you, like your posts, or send connection requests, they'll show up here.</p>
                          </div>
                        ) : (
                          notifications.map((n: any) => {
                            const actor = n.actor;
                            const actorName = actor?.full_name ?? 'Someone';
                            const timeAgo = getTimeAgo(n.created_at);

                            const typeIcon = n.type === 'follow' ? <UserPlus className="h-3 w-3 text-blue-500" />
                              : n.type === 'connection_request' ? <UserPlus className="h-3 w-3 text-emerald-500" />
                              : n.type === 'connection_accepted' ? <UserCheck className="h-3 w-3 text-emerald-500" />
                              : n.type === 'post_like' ? <Heart className="h-3 w-3 text-pink-500" />
                              : n.type === 'post_comment' ? <MessageCircle className="h-3 w-3 text-violet-500" />
                              : <CheckCircle className="h-3 w-3 text-blue-500" />;

                            const actionText = n.type === 'follow' ? 'started following you'
                              : n.type === 'connection_request' ? 'wants to connect with you'
                              : n.type === 'connection_accepted' ? 'accepted your connection request'
                              : n.type === 'post_like' ? 'liked your post'
                              : n.type === 'post_comment' ? 'commented on your post'
                              : n.body || '';

                            const inner = (
                              <div
                                key={n.id}
                                className={`flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50 ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                              >
                                {/* Avatar with type badge */}
                                <div className="relative flex-shrink-0">
                                  {actor?.avatar_url ? (
                                    <img src={actor.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                                      {actorName.charAt(0)}
                                    </div>
                                  )}
                                  <div className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-white bg-white">
                                    {typeIcon}
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13px] leading-snug text-slate-700">
                                    <span className="font-semibold text-slate-900">{actorName}</span>
                                    {' '}{actionText}
                                  </p>
                                  <p className="mt-1 text-[11px] text-slate-400">{timeAgo}</p>
                                </div>

                                {!n.is_read && <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />}
                              </div>
                            );

                            const href = n.link || (actor?.username ? `/profile/${actor.username}` : null);
                            return href ? (
                              <Link key={n.id} href={href as any} onClick={() => setShowNotifs(false)}>{inner}</Link>
                            ) : (
                              <div key={n.id}>{inner}</div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/messages"
                  className={`relative flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      : 'border-slate-200/80 bg-white text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                  title="Messages"
                >
                  <Send className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => setShowDropdown((c) => !c)}
                  className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center overflow-hidden rounded-full ring-2 ring-blue-500/20 transition hover:ring-blue-500/40"
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
                    <Link
                      href="/admin"
                      onClick={() => { handleNavigation('/admin' as Route); setShowDropdown(false); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                      Admin
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
                  href="/why-join-an-association"
                  onClick={() => handleNavigation('/why-join-an-association' as Route)}
                  className={`hidden whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition xl:inline-flex ${isDark ? 'text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/10' : 'text-blue-600 border border-blue-200 hover:bg-blue-50'}`}
                >
                  Why Join?
                </Link>
                <Link
                  href="/signin"
                  onClick={() => handleNavigation('/signin' as Route)}
                  className={`hidden whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition sm:inline-flex ${isDark ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'}`}
                >
                  Sign in
                </Link>
                <Link href="/weekly" className="hidden xl:inline-flex">
                  <ShinyButton className="whitespace-nowrap px-3 py-1.5 text-xs">Newsletter</ShinyButton>
                </Link>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsOpen((c) => !c)}
              className={`relative z-[100] inline-flex h-9 w-9 items-center justify-center rounded-xl border transition sm:h-10 sm:w-10 lg:hidden ${
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
        className={`fixed inset-0 z-[90] bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Top bar with logo + close */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" onClick={() => handleNavigation('/')} className="flex items-center gap-2.5">
            <div className="h-9 w-9 overflow-hidden rounded-full">
              <Image src="/logo/ielogo1.PNG" alt="Investigator Events" width={40} height={40} className="h-full w-full scale-[1.35] object-cover" />
            </div>
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

        <nav className="flex h-[calc(100%-4rem)] flex-col justify-between overflow-y-auto px-8 pb-[max(6rem,calc(6rem+env(safe-area-inset-bottom)))] pt-6">
          <ul className="space-y-1">
            {mobileMenuItems.filter((item) => !item.authOnly || user).map((item, i) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={`block py-2.5 text-[1.7rem] font-semibold tracking-[-0.02em] transition-colors duration-200 sm:py-3 sm:text-[2rem] ${
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
            {!user && (
              <Link
                href="/signin"
                onClick={() => handleNavigation('/signin' as Route)}
                className="inline-flex w-full justify-center rounded-full border-2 border-slate-900 bg-slate-900 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in
              </Link>
            )}
            <Link href="/weekly" onClick={() => { handleNavigation('/weekly' as Route); }}>
              <ShinyButton className="w-full px-6 py-4 text-base">Weekly Newsletter</ShinyButton>
            </Link>
            <Link
              href="/calendar"
              onClick={() => handleNavigation('/calendar')}
              className="inline-flex w-full justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Browse Events
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
