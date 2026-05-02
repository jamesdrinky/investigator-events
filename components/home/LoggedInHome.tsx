'use client';

import { useEffect, useState } from 'react';
import { Calendar, Users, Star, Bell, ChevronRight, MapPin, Bookmark, Search, MessageCircle, Globe, Send, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

interface QuickEvent {
  id: string;
  title: string;
  city: string;
  country: string;
  start_date: string;
  slug: string;
  association: string | null;
}

function EventRow({ event, accent = 'blue' }: { event: QuickEvent; accent?: 'blue' | 'amber' }) {
  const d = new Date(event.start_date);
  const bgClass = accent === 'amber' ? 'bg-amber-50' : 'bg-blue-50';
  const monthClass = accent === 'amber' ? 'text-amber-600' : 'text-blue-600';
  const dayClass = accent === 'amber' ? 'text-amber-700' : 'text-blue-700';

  return (
    <Link
      href={`/events/${event.slug}` as Route}
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition active:scale-[0.98]"
    >
      <div className={`flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg ${bgClass}`}>
        <span className={`text-[9px] font-bold uppercase ${monthClass}`}>
          {d.toLocaleDateString('en-GB', { month: 'short' })}
        </span>
        <span className={`text-sm font-bold leading-none ${dayClass}`}>
          {d.getDate()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{event.title}</p>
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3" /> {event.city}, {event.country}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
    </Link>
  );
}

export function LoggedInHome() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [upcomingGoing, setUpcomingGoing] = useState<QuickEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<QuickEvent[]>([]);
  const [upcomingAll, setUpcomingAll] = useState<QuickEvent[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  // Track whether to hide marketing sections
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false);
        return;
      }

      setUser(data.user);
      setIsLoggedIn(true);
      const uid = data.user.id;

      const [profileRes, goingRes, savedRes, notifRes, msgRes, connRes, eventsRes] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url, username').eq('id', uid).single(),
        supabase
          .from('event_attendees')
          .select('event_id, events:event_id(id, title, city, country, start_date, slug, association)')
          .eq('user_id', uid)
          .eq('is_going', true)
          .order('created_at', { ascending: false })
          .limit(5) as any,
        supabase
          .from('saved_events')
          .select('event_id, events:event_id(id, title, city, country, start_date, slug, association)')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(5) as any,
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid)
          .eq('is_read', false),
        supabase
          .from('messages' as any)
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', uid)
          .eq('is_read', false),
        supabase
          .from('connections')
          .select('id', { count: 'exact', head: true })
          .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`)
          .eq('status', 'accepted'),
        supabase
          .from('events')
          .select('id, title, city, country, start_date, slug, association')
          .eq('approved', true)
          .eq('event_scope', 'main')
          .gte('start_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: true })
          .limit(6),
      ]);

      setProfile(profileRes.data);

      const goingEvents = (goingRes.data ?? [])
        .map((r: any) => r.events)
        .filter(Boolean)
        .filter((e: any) => new Date(e.start_date) >= new Date());
      setUpcomingGoing(goingEvents);

      const saved = (savedRes.data ?? [])
        .map((r: any) => r.events)
        .filter(Boolean);
      setSavedEvents(saved);

      setUpcomingAll((eventsRes.data ?? []) as QuickEvent[]);
      setUnreadNotifs(notifRes.count ?? 0);
      setUnreadMessages(msgRes.count ?? 0);
      setConnectionCount(connRes.count ?? 0);
      setLoading(false);
    });
  }, []);

  // Don't render anything for logged-out users
  if (!loading && !user) return null;

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="lg:hidden">
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-4 pb-6 pt-20">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
            <div className="space-y-2">
              <div className="h-5 w-28 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-40 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white/10 px-3 py-4" />
            ))}
          </div>
        </div>
        <div className="space-y-3 px-4 py-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const totalUnread = unreadNotifs + unreadMessages;

  return (
    <>
      <div className="lg:hidden">
        {/* ── Dark header ── */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-4 pb-5 pt-20">
          {/* Greeting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={profile?.username ? `/profile/${profile.username}` as Route : '/profile/setup' as Route}>
                <UserAvatar src={profile?.avatar_url} name={profile?.full_name} size={44} className="ring-2 ring-white/20" />
              </Link>
              <div>
                <p className="text-base font-bold text-white">Hey {firstName}</p>
                <p className="text-[11px] text-slate-400">Welcome back</p>
              </div>
            </div>
            {totalUnread > 0 && (
              <Link href="/messages" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                <Bell className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-white">{totalUnread}</span>
              </Link>
            )}
          </div>

          {/* Quick stats row */}
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            <Link href="/calendar" className="flex flex-col items-center gap-0.5 rounded-xl bg-white/[0.07] px-2 py-2.5">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-bold text-white">{upcomingGoing.length}</span>
              <span className="text-[9px] text-slate-400">Going</span>
            </Link>
            <Link href="/people" className="flex flex-col items-center gap-0.5 rounded-xl bg-white/[0.07] px-2 py-2.5">
              <Users className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-bold text-white">{connectionCount}</span>
              <span className="text-[9px] text-slate-400">Connections</span>
            </Link>
            <Link href="/messages" className="relative flex flex-col items-center gap-0.5 rounded-xl bg-white/[0.07] px-2 py-2.5">
              <MessageCircle className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">{unreadMessages}</span>
              <span className="text-[9px] text-slate-400">Messages</span>
            </Link>
            <Link href="/reviews" className="flex flex-col items-center gap-0.5 rounded-xl bg-white/[0.07] px-2 py-2.5">
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-bold text-white">{savedEvents.length}</span>
              <span className="text-[9px] text-slate-400">Saved</span>
            </Link>
          </div>
        </div>

        {/* ── Quick actions grid ── */}
        <div className="bg-slate-50 px-4 py-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { href: '/calendar' as Route, icon: Calendar, label: 'Events', color: 'text-blue-600 bg-blue-50' },
              { href: '/directory' as Route, icon: Search, label: 'Find a PI', color: 'text-purple-600 bg-purple-50' },
              { href: '/submit-event' as Route, icon: Send, label: 'Submit', color: 'text-emerald-600 bg-emerald-50' },
              { href: '/associations' as Route, icon: Globe, label: 'Assocs', color: 'text-cyan-600 bg-cyan-50' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 shadow-sm transition active:scale-95"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Your events ── */}
        {upcomingGoing.length > 0 && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your events</h3>
              <Link href="/calendar" className="text-xs font-medium text-blue-600">See all</Link>
            </div>
            <div className="mt-2.5 space-y-2">
              {upcomingGoing.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* ── Saved events ── */}
        {savedEvents.length > 0 && (
          <div className="px-4 pt-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Bookmark className="h-3.5 w-3.5 text-amber-500" /> Saved
              </h3>
            </div>
            <div className="mt-2.5 space-y-2">
              {savedEvents.map((event) => (
                <EventRow key={event.id} event={event} accent="amber" />
              ))}
            </div>
          </div>
        )}

        {/* ── Upcoming on the platform ── */}
        {upcomingAll.length > 0 && (
          <div className="px-4 pt-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Coming up
              </h3>
              <Link href="/calendar" className="text-xs font-medium text-blue-600">View all</Link>
            </div>
            <div className="mt-2.5 space-y-2">
              {upcomingAll.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom padding ── */}
        <div className="h-6" />
      </div>

      {/* Hide the marketing homepage sections on mobile when logged in */}
      {isLoggedIn && (
        <style>{`
          @media (max-width: 1023px) {
            .mesh-blob { display: none !important; }
            [data-homepage-section] { display: none !important; }
          }
        `}</style>
      )}
    </>
  );
}
