'use client';

import { useEffect, useState } from 'react';
import { Calendar, Users, Star, Bell, ChevronRight, MapPin, Bookmark } from 'lucide-react';
import Link from 'next/link';
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

export function LoggedInHome() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [upcomingGoing, setUpcomingGoing] = useState<QuickEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<QuickEvent[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false);
        return;
      }

      setUser(data.user);
      const uid = data.user.id;

      // Fetch everything in parallel
      const [profileRes, goingRes, savedRes, notifRes, connRes] = await Promise.all([
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
          .from('connections')
          .select('id', { count: 'exact', head: true })
          .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`)
          .eq('status', 'accepted'),
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

      setUnreadNotifs(notifRes.count ?? 0);
      setConnectionCount(connRes.count ?? 0);
      setLoading(false);
    });
  }, []);

  // Don't render anything for logged-out users or while loading
  if (loading || !user) return null;

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="lg:hidden">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-4 pb-6 pt-20">
        {/* Greeting */}
        <div className="flex items-center gap-3">
          <UserAvatar src={profile?.avatar_url} name={profile?.full_name} size={48} className="ring-2 ring-white/20" />
          <div>
            <p className="text-lg font-bold text-white">Hey {firstName}</p>
            <p className="text-xs text-slate-400">Welcome back to Investigator Events</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Link href="/calendar" className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm">
            <Calendar className="h-5 w-5 text-blue-400" />
            <span className="text-lg font-bold text-white">{upcomingGoing.length}</span>
            <span className="text-[10px] text-slate-400">Going</span>
          </Link>
          <Link href="/people" className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm">
            <Users className="h-5 w-5 text-purple-400" />
            <span className="text-lg font-bold text-white">{connectionCount}</span>
            <span className="text-[10px] text-slate-400">Connections</span>
          </Link>
          <Link href="/profile" className="relative flex flex-col items-center gap-1 rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm">
            <Bell className="h-5 w-5 text-amber-400" />
            <span className="text-lg font-bold text-white">{unreadNotifs}</span>
            <span className="text-[10px] text-slate-400">Notifications</span>
            {unreadNotifs > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Link>
        </div>
      </div>

      {/* Your upcoming events */}
      {upcomingGoing.length > 0 && (
        <div className="px-4 pt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Your upcoming events</h3>
            <Link href="/calendar" className="text-xs font-medium text-blue-600">See all</Link>
          </div>
          <div className="mt-3 space-y-2">
            {upcomingGoing.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition active:scale-[0.98]"
              >
                <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50">
                  <span className="text-[10px] font-semibold uppercase text-blue-600">
                    {new Date(event.start_date).toLocaleDateString('en-GB', { month: 'short' })}
                  </span>
                  <span className="text-sm font-bold text-blue-700">
                    {new Date(event.start_date).getDate()}
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
            ))}
          </div>
        </div>
      )}

      {/* Saved events */}
      {savedEvents.length > 0 && (
        <div className="px-4 pt-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <Bookmark className="h-3.5 w-3.5 text-amber-500" /> Saved events
            </h3>
          </div>
          <div className="mt-3 space-y-2">
            {savedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition active:scale-[0.98]"
              >
                <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-amber-50">
                  <span className="text-[10px] font-semibold uppercase text-amber-600">
                    {new Date(event.start_date).toLocaleDateString('en-GB', { month: 'short' })}
                  </span>
                  <span className="text-sm font-bold text-amber-700">
                    {new Date(event.start_date).getDate()}
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
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="px-4 pb-2 pt-5">
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/submit-event"
            className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition active:scale-[0.98]"
          >
            <Star className="h-5 w-5 text-blue-500" />
            <span className="text-xs font-semibold text-slate-700">Submit event</span>
          </Link>
          <Link
            href="/directory"
            className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition active:scale-[0.98]"
          >
            <Users className="h-5 w-5 text-purple-500" />
            <span className="text-xs font-semibold text-slate-700">Directory</span>
          </Link>
        </div>
      </div>

      {/* Divider before rest of page */}
      <div className="mt-4 border-t border-slate-100" />
    </div>
  );
}
