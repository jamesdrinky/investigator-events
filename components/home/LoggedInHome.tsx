'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, Users, Star, Bell, ChevronRight, MapPin, Bookmark, Search, MessageCircle, Globe, Send, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';
import { getCityHeroImageUrl, getEventImage } from '@/lib/utils/city-media';

// Resolve an image for an event without showing a blank gradient when
// image_path is missing / non-matching. Falls back through: event-slug
// lookup → city image → generic city fallback.
function resolveEventImage(image_path: string | null | undefined, slug: string | null | undefined, city: string | null | undefined): string {
  if (image_path && /^(\/(cities|events|images)\/|https?:\/\/)/.test(image_path)) return image_path;
  if (image_path) return image_path; // try whatever we have; <img onError> falls back below
  return getEventImage(slug ?? '') ?? getCityHeroImageUrl(city ?? '') ?? '/cities/fallback.jpg';
}

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
  const countdown = showCountdown ? getCountdown(event.start_date) : null;
  const imageSrc = resolveEventImage(event.image_path, event.slug, event.city);

  return (
    <Link
      href={`/events/${event.slug}` as Route}
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition active:scale-[0.98] lg:rounded-2xl lg:p-3.5 lg:hover:shadow-md lg:hover:border-blue-200"
    >
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/cities/fallback.jpg'; }}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1 pb-0.5 pt-2">
          <span className={`text-[8px] font-bold uppercase text-white`}>
            {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
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

function HeroEventCard({ event }: { event: QuickEvent }) {
  const d = new Date(event.start_date);
  const countdown = getCountdown(event.start_date);
  const imageSrc = resolveEventImage(event.image_path, event.slug, event.city);
  const wrapRef = useRef<HTMLAnchorElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Scroll-driven parallax — same pattern as /calendar's FeaturedHero.
  // Listens to [data-app-content] scroll on mobile, window scroll on desktop.
  useEffect(() => {
    const container: HTMLElement | Window = document.querySelector<HTMLElement>('[data-app-content]') ?? window;
    const update = () => {
      if (!wrapRef.current || !imgRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const containerHeight = container === window ? window.innerHeight : (container as HTMLElement).clientHeight;
      const progress = (containerHeight - rect.top) / (containerHeight + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      const yPercent = -8 + clamped * 16;
      imgRef.current.style.transform = `translate3d(0, ${yPercent}%, 0) scale(1.18)`;
    };
    update();
    container.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      container.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <Link
      ref={wrapRef}
      href={`/events/${event.slug}` as Route}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-100 to-slate-200 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] transition active:scale-[0.99] lg:rounded-3xl"
      style={{ aspectRatio: '16/10' }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imgRef}
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/cities/fallback.jpg'; }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-500/95 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">{countdown}</span>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium text-white/95 backdrop-blur-sm">{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        </div>
        <h4 className="mt-2 line-clamp-2 text-lg font-bold leading-tight text-white drop-shadow-md lg:text-2xl">{event.title}</h4>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-white/85">
          <MapPin className="h-3 w-3" /> {event.city}, {event.country}
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ eyebrow, title, accent = 'blue', cta }: { eyebrow: string; title: string; accent?: 'blue' | 'amber' | 'indigo' | 'emerald' | 'cyan' | 'purple'; cta?: { href: string; label: string } }) {
  const accentText = {
    blue: 'text-blue-600/75',
    amber: 'text-amber-600/80',
    indigo: 'text-indigo-600/75',
    emerald: 'text-emerald-600/80',
    cyan: 'text-cyan-600/80',
    purple: 'text-purple-600/80',
  }[accent];
  return (
    <div>
      <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${accentText}`}>{eyebrow}</p>
      <div className="mt-0.5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold tracking-[-0.02em] text-slate-900 lg:text-xl">{title}</h3>
        {cta && (
          <Link href={cta.href as Route} className="text-xs font-semibold text-blue-600 transition active:scale-95">
            {cta.label} →
          </Link>
        )}
      </div>
    </div>
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

      // ONE round-trip for everything we can fetch up-front. Previously this
      // was three sequential Promise.all batches (8 + 3 + 1 queries) which
      // serialised three network round-trips on the homepage. Now it's one
      // round-trip for ten queries, then a single conditional follow-up for
      // suggested people (which needs assoc names from this batch).
      // Also: a single event_attendees query — was hit twice before, once
      // without image_path (so the upcoming hero showed blank for events
      // missing image_path) and once with — split client-side by date.
      const todayStr = new Date().toISOString().split('T')[0];
      const [profileRes, attendeesRes, savedRes, notifRes, msgRes, connRes, eventsRes, userAssocsRes, userReviewsRes] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url, username, specialisation, country, bio').eq('id', uid).single(),
        supabase
          .from('event_attendees')
          .select('event_id, events:event_id(id, title, city, country, start_date, slug, association, image_path)')
          .eq('user_id', uid)
          .eq('is_going', true)
          .order('created_at', { ascending: false }) as any,
        supabase
          .from('saved_events')
          .select('event_id, events:event_id(id, title, city, country, start_date, slug, association, image_path)')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(5) as any,
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('is_read', false),
        supabase.from('messages' as any).select('id', { count: 'exact', head: true }).eq('receiver_id', uid).eq('is_read', false),
        supabase.from('connections').select('id', { count: 'exact', head: true }).or(`requester_id.eq.${uid},addressee_id.eq.${uid}`).eq('status', 'accepted'),
        supabase
          .from('events')
          .select('id, title, city, country, start_date, slug, association, image_path')
          .eq('approved', true)
          .eq('event_scope', 'main')
          .gte('start_date', todayStr)
          .order('start_date', { ascending: true })
          .limit(6),
        supabase.from('user_associations').select('association_name, association_slug').eq('user_id', uid),
        supabase.from('event_reviews').select('event_id').eq('user_id', uid),
      ]);

      // Profile + counts
      setProfile(profileRes.data);
      setUnreadNotifs(notifRes.count ?? 0);
      setUnreadMessages(msgRes.count ?? 0);
      setConnectionCount(connRes.count ?? 0);
      const userAssocs = (userAssocsRes.data ?? []) as UserAssociation[];
      setUserAssociations(userAssocs);
      setAssociationCount(userAssocs.length);

      // Split attendees by date — single query, two derivations
      const todayMs = Date.now();
      const allAttending = (attendeesRes.data ?? []).map((r: any) => r.events).filter(Boolean);
      setUpcomingGoing(allAttending.filter((e: any) => new Date(e.start_date).getTime() >= todayMs).slice(0, 5));
      const reviewedEventIds = new Set((userReviewsRes.data ?? []).map((r: any) => r.event_id));
      setPastAttended(
        allAttending
          .filter((e: any) => new Date(e.start_date).getTime() < todayMs)
          .map((e: any) => ({ ...e, hasReview: reviewedEventIds.has(e.id) }))
          .slice(0, 3),
      );

      setSavedEvents((savedRes.data ?? []).map((r: any) => r.events).filter(Boolean));

      // Upcoming events — fall back without scope filter only if main returns 0
      const upcoming = (eventsRes.data ?? []) as QuickEvent[];
      if (upcoming.length === 0 && !eventsRes.error) {
        const { data: fallback } = await supabase
          .from('events')
          .select('id, title, city, country, start_date, slug, association, image_path')
          .eq('approved', true)
          .gte('start_date', todayStr)
          .order('start_date', { ascending: true })
          .limit(6);
        setUpcomingAll((fallback ?? []) as QuickEvent[]);
      } else {
        setUpcomingAll(upcoming);
      }

      setLoading(false);

      // Conditional follow-up: suggested people from user's associations.
      // Deferred AFTER setLoading(false) so the page renders immediately and
      // this section pops in once it arrives — doesn't block first paint.
      const assocNames = userAssocs.map((a) => a.association_name);
      if (assocNames.length > 0) {
        supabase
          .from('user_associations')
          .select('user_id, profiles:user_id(id, full_name, avatar_url, username, specialisation)')
          .in('association_name', assocNames)
          .neq('user_id', uid)
          .limit(20)
          .then(({ data: assocMembers }: any) => {
            const seen = new Set<string>();
            const people = (assocMembers ?? [])
              .map((r: any) => r.profiles)
              .filter((p: any) => p && p.full_name && !seen.has(p.id) && (seen.add(p.id), true))
              .slice(0, 4);
            setSuggestedPeople(people);
          });
      }
    });
  }, []);

  // Don't render anything for logged-out users — marketing page shows instead
  if (!loading && !user) return null;

  // Show dashboard skeleton while loading — prevents flash to marketing page
  if (loading) return (
    <div className="min-h-screen animate-pulse bg-white px-4 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-slate-100" />
        <div>
          <div className="h-5 w-40 rounded bg-slate-100" />
          <div className="mt-1.5 h-3 w-56 rounded bg-slate-50" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-slate-50" />)}
      </div>
      <div className="mt-8 h-5 w-32 rounded bg-slate-100" />
      <div className="mt-4 space-y-3">
        {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl bg-slate-50" />)}
      </div>
    </div>
  );

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

          {/* Quick stats row — glassmorphism tiles with inset highlight + soft border */}
          <div className="mt-4 grid grid-cols-4 gap-1.5 lg:mt-6 lg:gap-3">
            <Link href={"/my-events" as Route} className="group relative flex flex-col items-center gap-0.5 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.04] px-2 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition active:scale-95 lg:flex-row lg:gap-3 lg:rounded-2xl lg:px-5 lg:py-4 lg:hover:border-white/20">
              <Calendar className="h-4 w-4 text-blue-400 lg:h-5 lg:w-5" />
              <span className="text-sm font-bold text-white lg:text-lg">{upcomingGoing.length}</span>
              <span className="text-[9px] text-slate-400 lg:text-xs">Going</span>
            </Link>
            <Link href={"/my-connections" as Route} className="group relative flex flex-col items-center gap-0.5 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.04] px-2 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition active:scale-95 lg:flex-row lg:gap-3 lg:rounded-2xl lg:px-5 lg:py-4 lg:hover:border-white/20">
              <Users className="h-4 w-4 text-purple-400 lg:h-5 lg:w-5" />
              <span className="text-sm font-bold text-white lg:text-lg">{connectionCount}</span>
              <span className="text-[9px] text-slate-400 lg:text-xs">Connections</span>
            </Link>
            <Link href={"/messages" as Route} className="group relative flex flex-col items-center gap-0.5 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.04] px-2 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition active:scale-95 lg:flex-row lg:gap-3 lg:rounded-2xl lg:px-5 lg:py-4 lg:hover:border-white/20">
              <MessageCircle className="h-4 w-4 text-cyan-400 lg:h-5 lg:w-5" />
              <span className="text-sm font-bold text-white lg:text-lg">{unreadMessages}</span>
              <span className="text-[9px] text-slate-400 lg:text-xs">Messages</span>
            </Link>
            <Link href={"/my-associations" as Route} className="group relative flex flex-col items-center gap-0.5 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.04] px-2 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition active:scale-95 lg:flex-row lg:gap-3 lg:rounded-2xl lg:px-5 lg:py-4 lg:hover:border-white/20">
              <Globe className="h-4 w-4 text-amber-400 lg:h-5 lg:w-5" />
              <span className="text-sm font-bold text-white lg:text-lg">{associationCount}</span>
              <span className="text-[9px] text-slate-400 lg:text-xs">Assocs</span>
            </Link>
          </div>
          </div>{/* close max-w-5xl */}
        </div>

        {/* Quick actions removed — stats row + bottom tab bar cover all navigation */}

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
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[1fr_22rem] lg:gap-10 lg:px-6 lg:py-8">
        <div>{/* Left column */}

        {/* ── Your events — first one is a hero card, rest are rows ── */}
        {upcomingGoing.length > 0 && (
          <div className="px-4 pt-5 lg:px-0">
            <SectionHeader
              eyebrow="Up next"
              title="Your events"
              accent="blue"
              cta={{ href: '/calendar', label: 'See all' }}
            />
            <div className="mt-3 space-y-2">
              <HeroEventCard event={upcomingGoing[0]} />
              {upcomingGoing.slice(1).map((event) => (
                <EventRow key={event.id} event={event} showCountdown />
              ))}
            </div>
          </div>
        )}

        {/* ── Saved events ── */}
        {savedEvents.length > 0 && (
          <div className="px-4 pt-6 lg:px-0">
            <SectionHeader eyebrow="Bookmarked" title="Saved" accent="amber" />
            <div className="mt-3 space-y-2">
              {savedEvents.map((event) => (
                <EventRow key={event.id} event={event} accent="amber" />
              ))}
            </div>
          </div>
        )}

        {/* ── Upcoming on the platform ── */}
        {upcomingAll.length > 0 && (
          <div className="px-4 pt-6 lg:px-0">
            <SectionHeader
              eyebrow="Coming up"
              title="On the platform"
              accent="indigo"
              cta={{ href: '/calendar', label: 'View all' }}
            />
            <div className="mt-3 space-y-2">
              {upcomingAll.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        </div>{/* close left column */}

        <div>{/* Right column */}
        {/* ── Mobile-only divider between left and right columns so the
              transition from "your stuff" to "for you" reads as a section
              break, not a continuation of the same list. ── */}
        <div className="mt-6 px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600/75">More for you</p>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          </div>
        </div>

        {/* ── Past events — review prompts ── */}
        {pastAttended.length > 0 && (
          <div className="px-4 pt-4 lg:px-0 lg:pt-0">
            <SectionHeader
              eyebrow="Your past"
              title="Leave a review"
              accent="emerald"
            />
            <p className="mt-1 text-[11px] text-slate-400">Help the community — share your experience</p>
            <div className="mt-3 space-y-2">
              {pastAttended.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}#reviews` as Route}
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
          <div className="px-4 pt-6 lg:px-0">
            <SectionHeader
              eyebrow="Memberships"
              title="Your associations"
              accent="cyan"
              cta={{ href: '/associations', label: 'Browse all' }}
            />
            <div className="mt-3 flex flex-wrap gap-2">
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
          <div className="px-4 pt-6 lg:px-0">
            <SectionHeader
              eyebrow="Suggested"
              title="People you may know"
              accent="purple"
              cta={{ href: '/people?tab=discover', label: 'See all' }}
            />
            <div className="mt-3 space-y-2">
              {suggestedPeople.map((person) => (
                <Link
                  key={person.id}
                  href={`/profile/${person.username}` as Route}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition active:scale-[0.98] lg:rounded-2xl lg:p-3.5 lg:hover:shadow-md lg:hover:border-blue-200"
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

        {/* ── Bottom finisher — gives the page a visual close instead of
              trailing off into the tab bar after the last list section. ── */}
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-10 lg:px-6 lg:pt-12 lg:pb-12">
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-5 py-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)] lg:rounded-3xl lg:px-8 lg:py-8">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300/80">Keep exploring</p>
              <h3 className="mt-2 text-xl font-bold leading-tight text-white lg:text-2xl">Find your next conference.</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300/90 lg:text-sm">Browse the full PI calendar, submit a new event, or grow your network.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/calendar" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 shadow-[0_8px_20px_-8px_rgba(255,255,255,0.4)] transition active:scale-95">
                  <Calendar className="h-3.5 w-3.5" /> Browse calendar
                </Link>
                <Link href={"/submit-event" as Route} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition active:scale-95">
                  + Submit event
                </Link>
                <Link href={"/people?tab=discover" as Route} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition active:scale-95">
                  <Users className="h-3.5 w-3.5" /> Find PIs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hide the marketing homepage sections when logged in — inject immediately */}
      {isLoggedIn && (
        <style dangerouslySetInnerHTML={{ __html: `
          .mesh-blob { display: none !important; }
          [data-homepage-section] { display: none !important; }
        `}} />
      )}
    </>
  );
}
