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
  image_path?: string | null;
}

function getCountdown(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'Past';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `In ${days} days`;
  if (days <= 30) return `In ${Math.ceil(days / 7)} weeks`;
  return `In ${Math.ceil(days / 30)} months`;
}

function EventRow({ event, accent = 'blue', showCountdown = false }: { event: QuickEvent; accent?: 'blue' | 'amber'; showCountdown?: boolean }) {
  const d = new Date(event.start_date);
  const bgClass = accent === 'amber' ? 'bg-amber-50' : 'bg-blue-50';
  const monthClass = accent === 'amber' ? 'text-amber-600' : 'text-blue-600';
  const dayClass = accent === 'amber' ? 'text-amber-700' : 'text-blue-700';
  const hasImage = event.image_path && /^(\/(cities|events|images)\/|https?:\/\/)/.test(event.image_path);
  const countdown = showCountdown ? getCountdown(event.start_date) : null;

  return (
    <Link
      href={`/events/${event.slug}` as Route}
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition active:scale-[0.98]"
    >
      {hasImage ? (
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
          <img src={event.image_path!} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1 pb-0.5 pt-2">
            <span className={`text-[8px] font-bold uppercase text-white`}>
              {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      ) : (
        <div className={`flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg ${bgClass}`}>
          <span className={`text-[9px] font-bold uppercase ${monthClass}`}>
            {d.toLocaleDateString('en-GB', { month: 'short' })}
          </span>
          <span className={`text-base font-bold leading-none ${dayClass}`}>
            {d.getDate()}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{event.title}</p>
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" /> {event.city}, {event.country}
          </p>
          {countdown && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">{countdown}</span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
    </Link>
  );
}

interface UserAssociation {
  association_name: string;
  association_slug: string;
}

interface PastAttendedEvent extends QuickEvent {
  hasReview: boolean;
}

interface SuggestedPerson {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  specialisation: string | null;
}

export function LoggedInHome() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [upcomingGoing, setUpcomingGoing] = useState<QuickEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<QuickEvent[]>([]);
  const [upcomingAll, setUpcomingAll] = useState<QuickEvent[]>([]);
  const [pastAttended, setPastAttended] = useState<PastAttendedEvent[]>([]);
  const [userAssociations, setUserAssociations] = useState<UserAssociation[]>([]);
  const [suggestedPeople, setSuggestedPeople] = useState<SuggestedPerson[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [associationCount, setAssociationCount] = useState(0);
  const [loading, setLoading] = useState(true);
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

      const [profileRes, goingRes, savedRes, notifRes, msgRes, connRes, eventsRes, assocRes] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url, username, specialisation, country, bio').eq('id', uid).single(),
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
          .select('id, title, city, country, start_date, slug, association, image_path')
          .eq('approved', true)
          .eq('event_scope', 'main')
          .gte('start_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: true })
          .limit(6),
        supabase
          .from('user_associations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid),
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

      const upcoming = (eventsRes.data ?? []) as QuickEvent[];
      if (upcoming.length === 0 && !eventsRes.error) {
        // Fallback: try without event_scope filter
        const { data: fallback } = await supabase
          .from('events')
          .select('id, title, city, country, start_date, slug, association, image_path')
          .eq('approved', true)
          .gte('start_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: true })
          .limit(6);
        setUpcomingAll((fallback ?? []) as QuickEvent[]);
      } else {
        setUpcomingAll(upcoming);
      }
      setUnreadNotifs(notifRes.count ?? 0);
      setUnreadMessages(msgRes.count ?? 0);
      setConnectionCount(connRes.count ?? 0);
      setAssociationCount(assocRes.count ?? 0);

      // Fetch user associations + past attended events (for review prompts)
      const [userAssocsRes, pastGoingRes, userReviewsRes] = await Promise.all([
        supabase.from('user_associations').select('association_name, association_slug').eq('user_id', uid),
        supabase
          .from('event_attendees')
          .select('event_id, events:event_id(id, title, city, country, start_date, slug, association, image_path)')
          .eq('user_id', uid)
          .eq('is_going', true) as any,
        supabase.from('event_reviews').select('event_id').eq('user_id', uid),
      ]);

      setUserAssociations((userAssocsRes.data ?? []) as UserAssociation[]);

      const reviewedEventIds = new Set((userReviewsRes.data ?? []).map((r: any) => r.event_id));
      const pastEvents = (pastGoingRes.data ?? [])
        .map((r: any) => r.events)
        .filter(Boolean)
        .filter((e: any) => new Date(e.start_date) < new Date())
        .map((e: any) => ({ ...e, hasReview: reviewedEventIds.has(e.id) }))
        .slice(0, 3);
      setPastAttended(pastEvents);

      // Suggested people — same associations
      const assocNames = (userAssocsRes.data ?? []).map((a: any) => a.association_name);
      if (assocNames.length > 0) {
        const { data: assocMembers } = await supabase
          .from('user_associations')
          .select('user_id, profiles:user_id(id, full_name, avatar_url, username, specialisation)')
          .in('association_name', assocNames)
          .neq('user_id', uid)
          .limit(20) as any;
        const seen = new Set<string>();
        const people = (assocMembers ?? [])
          .map((r: any) => r.profiles)
          .filter((p: any) => p && p.full_name && !seen.has(p.id) && (seen.add(p.id), true))
          .slice(0, 4);
        setSuggestedPeople(people);
      }

      setLoading(false);
    });
  }, []);

  // Don't render anything for logged-out users
  if (!loading && !user) return null;

  // Show skeleton while loading
  if (loading) {
    return (
      <div>
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-4 pb-6 pt-20 lg:pt-24">
          <div className="mx-auto max-w-5xl">
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
        </div>
        <div className="mx-auto max-w-5xl space-y-3 px-4 py-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const totalUnread = unreadNotifs + unreadMessages;

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Profile completion
  const profileFields = [profile?.full_name, profile?.avatar_url, (profile as any)?.specialisation, (profile as any)?.country, (profile as any)?.bio];
  const filledFields = profileFields.filter(Boolean).length;
  const profilePercent = Math.round((filledFields / profileFields.length) * 100);
  const profileComplete = profilePercent >= 80;

  return (
    <>
      <div>
        {/* ── Dark header ── */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-4 pb-5 pt-20 lg:pb-8 lg:pt-24">
          <div className="mx-auto max-w-5xl">
          {/* Greeting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={profile?.username ? `/profile/${profile.username}` as Route : '/profile/setup' as Route}>
                <UserAvatar src={profile?.avatar_url} name={profile?.full_name} size={44} className="ring-2 ring-white/20 lg:h-14 lg:w-14" />
              </Link>
              <div>
                <p className="text-base font-bold text-white lg:text-xl">{greeting}, {firstName}</p>
                <p className="text-[11px] text-slate-400 lg:text-sm">Welcome back to Investigator Events</p>
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
            <Link href={"/calendar" as Route} className="flex flex-col items-center gap-0.5 rounded-xl bg-white/[0.07] px-2 py-2.5">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-bold text-white">{upcomingGoing.length}</span>
              <span className="text-[9px] text-slate-400">Going</span>
            </Link>
            <Link href={"/people?tab=discover" as Route} className="flex flex-col items-center gap-0.5 rounded-xl bg-white/[0.07] px-2 py-2.5">
              <Users className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-bold text-white">{connectionCount}</span>
              <span className="text-[9px] text-slate-400">Connections</span>
            </Link>
            <Link href={"/messages" as Route} className="relative flex flex-col items-center gap-0.5 rounded-xl bg-white/[0.07] px-2 py-2.5">
              <MessageCircle className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">{unreadMessages}</span>
              <span className="text-[9px] text-slate-400">Messages</span>
            </Link>
            <Link href={"/associations" as Route} className="flex flex-col items-center gap-0.5 rounded-xl bg-white/[0.07] px-2 py-2.5">
              <Globe className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-bold text-white">{associationCount}</span>
              <span className="text-[9px] text-slate-400">Assocs</span>
            </Link>
          </div>
          </div>{/* close max-w-5xl */}
        </div>

        {/* ── Quick actions grid ── */}
        <div className="bg-slate-50 px-4 py-4">
          <div className="mx-auto grid max-w-5xl grid-cols-4 gap-2 lg:grid-cols-8">
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

        {/* ── Profile completion nudge ── */}
        {!profileComplete && (
          <div className="mx-auto max-w-5xl px-4 pt-4 lg:px-4">
            <Link
              href="/profile/edit"
              className="flex items-center gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 transition active:scale-[0.98]"
            >
              <div className="relative h-10 w-10 flex-shrink-0">
                <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#3b82f6" strokeWidth="3"
                    strokeDasharray={`${profilePercent} 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-600">{profilePercent}%</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">Complete your profile</p>
                <p className="text-[11px] text-slate-500">Add your photo, specialisation, and bio to get discovered</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-blue-400" />
            </Link>
          </div>
        )}

        {/* ── Main content — single column mobile, two columns desktop ── */}
        <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[1fr_20rem] lg:gap-8 lg:px-4 lg:py-6">
        <div>{/* Left column */}

        {/* ── Your events ── */}
        {upcomingGoing.length > 0 && (
          <div className="px-4 pt-4 lg:px-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your events</h3>
              <Link href="/calendar" className="text-xs font-medium text-blue-600">See all</Link>
            </div>
            <div className="mt-2.5 space-y-2">
              {upcomingGoing.map((event) => (
                <EventRow key={event.id} event={event} showCountdown />
              ))}
            </div>
          </div>
        )}

        {/* ── Saved events ── */}
        {savedEvents.length > 0 && (
          <div className="px-4 pt-5 lg:px-0">
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
          <div className="px-4 pt-5 lg:px-0">
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

        </div>{/* close left column */}

        <div>{/* Right column */}
        {/* ── Past events — review prompts ── */}
        {pastAttended.length > 0 && (
          <div className="px-4 pt-5 lg:px-0">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <Star className="h-3.5 w-3.5 text-amber-500" /> Review past events
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">Help the community — share your experience</p>
            <div className="mt-2.5 space-y-2">
              {pastAttended.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}` as Route}
                  className={`flex items-center gap-3 rounded-xl border p-2.5 shadow-sm transition active:scale-[0.98] ${
                    event.hasReview
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-amber-200 bg-gradient-to-r from-amber-50/80 to-orange-50/50 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                  }`}
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                    event.hasReview ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    {event.hasReview ? (
                      <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                    ) : (
                      <Star className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{event.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {event.hasReview ? 'Reviewed' : 'Tap to leave a review'}
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 flex-shrink-0 ${event.hasReview ? 'text-emerald-400' : 'text-amber-400'}`} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Your associations ── */}
        {userAssociations.length > 0 && (
          <div className="px-4 pt-5 lg:px-0">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Globe className="h-3.5 w-3.5 text-cyan-500" /> Your associations
              </h3>
              <Link href="/associations" className="text-xs font-medium text-blue-600">Browse all</Link>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {userAssociations.map((assoc) => (
                <Link
                  key={assoc.association_slug}
                  href={`/associations/${assoc.association_slug}` as Route}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition active:scale-95"
                >
                  {assoc.association_name}
                </Link>
              ))}
              <Link
                href="/associations"
                className="rounded-full border border-dashed border-blue-300 bg-blue-50/50 px-3.5 py-2 text-xs font-semibold text-blue-600 transition active:scale-95"
              >
                + Explore more
              </Link>
            </div>
          </div>
        )}

        {/* ── People you may know ── */}
        {suggestedPeople.length > 0 && (
          <div className="px-4 pt-5 lg:px-0">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Users className="h-3.5 w-3.5 text-purple-500" /> People you may know
              </h3>
              <Link href={"/people?tab=discover" as Route} className="text-xs font-medium text-blue-600">See all</Link>
            </div>
            <div className="mt-2.5 space-y-2">
              {suggestedPeople.map((person) => (
                <Link
                  key={person.id}
                  href={`/profile/${person.username}` as Route}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition active:scale-[0.98]"
                >
                  <UserAvatar src={person.avatar_url} name={person.full_name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{person.full_name}</p>
                    <p className="text-[11px] text-slate-500">{person.specialisation ?? 'Investigator'}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
                </Link>
              ))}
            </div>
          </div>
        )}

        </div>{/* close right column */}
        </div>{/* close grid */}

        {/* ── Bottom padding ── */}
        <div className="h-6" />
      </div>

      {/* Hide the marketing homepage sections when logged in */}
      {isLoggedIn && (
        <style>{`
          .mesh-blob { display: none !important; }
          [data-homepage-section] { display: none !important; }
        `}</style>
      )}
    </>
  );
}
