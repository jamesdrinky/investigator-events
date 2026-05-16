'use client';

import { useEffect, useState } from 'react';
import { Calendar, MapPin, ChevronRight, Star, Plus, Trash2, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

interface EventItem {
  id: string;
  title: string;
  city: string;
  country: string;
  start_date: string;
  slug: string;
  association: string | null;
  image_path: string | null;
}

function getCountdown(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'Past';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `${days} days`;
  if (days <= 30) return `${Math.ceil(days / 7)} weeks`;
  return `${Math.ceil(days / 30)} months`;
}

export default function MyEventsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [goingEvents, setGoingEvents] = useState<EventItem[]>([]);
  const [pastEvents, setPastEvents] = useState<EventItem[]>([]);
  const [recommended, setRecommended] = useState<EventItem[]>([]);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return; }
      const uid = data.user.id;
      setUserId(uid);

      const [goingRes, reviewsRes, assocsRes] = await Promise.all([
        supabase
          .from('event_attendees')
          .select('event_id, events:event_id(id, title, city, country, start_date, slug, association, image_path)')
          .eq('user_id', uid)
          .eq('is_going', true) as any,
        supabase.from('event_reviews').select('event_id').eq('user_id', uid),
        supabase.from('user_associations').select('association_name').eq('user_id', uid),
      ]);

      setReviewedIds(new Set((reviewsRes.data ?? []).map((r: any) => r.event_id)));

      const all = (goingRes.data ?? []).map((r: any) => r.events).filter(Boolean) as EventItem[];
      const now = new Date();
      setGoingEvents(all.filter(e => new Date(e.start_date) >= now).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()));
      setPastEvents(all.filter(e => new Date(e.start_date) < now).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()));

      // Recommended: events from user's associations they're not already going to
      const goingIds = new Set(all.map(e => e.id));
      const assocNames = (assocsRes.data ?? []).map((a: any) => a.association_name);
      if (assocNames.length > 0) {
        const { data: recEvents } = await supabase
          .from('events')
          .select('id, title, city, country, start_date, slug, association, image_path')
          .eq('approved', true)
          .in('association', assocNames)
          .gte('start_date', now.toISOString().split('T')[0])
          .order('start_date', { ascending: true })
          .limit(10);
        setRecommended((recEvents ?? []).filter((e: any) => !goingIds.has(e.id)) as EventItem[]);
      } else {
        // Fallback: show upcoming events
        const { data: upcoming } = await supabase
          .from('events')
          .select('id, title, city, country, start_date, slug, association, image_path')
          .eq('approved', true)
          .eq('event_scope', 'main')
          .gte('start_date', now.toISOString().split('T')[0])
          .order('start_date', { ascending: true })
          .limit(6);
        setRecommended((upcoming ?? []).filter((e: any) => !goingIds.has(e.id)) as EventItem[]);
      }

      setLoading(false);
    });
  }, []);

  const removeEvent = async (eventId: string) => {
    if (!userId) return;
    setRemoving(eventId);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', userId);
    setGoingEvents(prev => prev.filter(e => e.id !== eventId));
    setRemoving(null);
  };

  const addEvent = async (eventId: string) => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from('event_attendees').insert({ user_id: userId, event_id: eventId, is_going: true });
    const event = recommended.find(e => e.id === eventId);
    if (event) {
      setGoingEvents(prev => [...prev, event].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()));
      setRecommended(prev => prev.filter(e => e.id !== eventId));
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
        <div className="container-shell py-8">
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />)}
          </div>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
        <div className="container-shell py-20 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Sign in to see your events</h2>
          <p className="mt-2 text-sm text-slate-500">Track which events you're attending and get personalised recommendations.</p>
          <Link href="/signin" className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white">Sign in</Link>
        </div>
      </main>
    );
  }

  const hasImage = (e: EventItem) => e.image_path && /^(\/(cities|events|images)\/|https?:\/\/)/.test(e.image_path);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pt-16 lg:pt-20">
      {/* Futuristic gradient orb backdrop */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_65%)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-10 -right-20 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.14),transparent_65%)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

      <div className="container-shell relative max-w-3xl py-6 lg:py-10">
        {/* Page-level Back removed — global MobileBackButton already shows */}
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600 backdrop-blur-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)] animate-pulse" />
          Your calendar
        </span>
        <h1 className="mt-3 text-[2rem] font-bold leading-[0.95] tracking-[-0.04em] text-slate-950 lg:text-[2.75rem]">
          My{' '}
          <span
            className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
            style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
          >
            Events
          </span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 lg:text-base">Events you're attending and personalised recommendations</p>

        {/* ── Upcoming events you're going to ── */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Calendar className="h-4 w-4" /> Going ({goingEvents.length})
          </h2>

          {goingEvents.length === 0 ? (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
              <Calendar className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-base font-semibold text-slate-900">No upcoming events yet</p>
              <p className="mt-1 text-sm text-slate-500">Browse the calendar and mark events you plan to attend.</p>
              <Link href="/calendar" className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                <Plus className="h-4 w-4" /> Browse events
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {goingEvents.map(event => {
                const countdown = getCountdown(event.start_date);
                return (
                  <div key={event.id} className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white p-3 shadow-sm">
                    <Link href={`/events/${event.slug}` as Route} className="flex flex-1 items-center gap-3">
                      {hasImage(event) ? (
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                          <img src={event.image_path!} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50">
                          <span className="text-[9px] font-bold uppercase text-blue-500">{new Date(event.start_date).toLocaleDateString('en-GB', { month: 'short' })}</span>
                          <span className="text-base font-bold leading-none text-blue-700">{new Date(event.start_date).getDate()}</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{event.title}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {event.city}, {event.country}</p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                          <Clock className="h-3 w-3" /> {countdown}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={() => removeEvent(event.id)}
                      disabled={removing === event.id}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                      title="Remove from going"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Recommended for you ── */}
        {recommended.length > 0 && (
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              <TrendingUp className="h-4 w-4" /> Recommended for you
            </h2>
            <p className="mt-1 text-xs text-slate-400">Based on your associations</p>
            <div className="mt-3 space-y-2">
              {recommended.slice(0, 6).map(event => (
                <div key={event.id} className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white p-3 shadow-sm">
                  <Link href={`/events/${event.slug}` as Route} className="flex flex-1 items-center gap-3">
                    {hasImage(event) ? (
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                        <img src={event.image_path!} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100">
                        <span className="text-[9px] font-bold uppercase text-slate-400">{new Date(event.start_date).toLocaleDateString('en-GB', { month: 'short' })}</span>
                        <span className="text-base font-bold leading-none text-slate-600">{new Date(event.start_date).getDate()}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{event.title}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {event.city}, {event.country}</p>
                      {event.association && <p className="mt-0.5 text-[11px] text-blue-600">{event.association}</p>}
                    </div>
                  </Link>
                  <button
                    onClick={() => addEvent(event.id)}
                    className="flex h-8 flex-shrink-0 items-center gap-1 rounded-full bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3" /> Going
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Past events — review prompts ── */}
        {pastEvents.length > 0 && (
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              <Star className="h-4 w-4" /> Past events
            </h2>
            <div className="mt-3 space-y-2">
              {pastEvents.map(event => {
                const reviewed = reviewedIds.has(event.id);
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}` as Route}
                    className={`flex items-center gap-3 rounded-xl border p-3 shadow-sm transition active:scale-[0.98] ${
                      reviewed
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-amber-200 bg-gradient-to-r from-amber-50/80 to-orange-50/50 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                    }`}
                  >
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${reviewed ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      <Star className={`h-4 w-4 ${reviewed ? 'fill-emerald-500 text-emerald-500' : 'text-amber-500'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{event.title}</p>
                      <p className="text-[11px] text-slate-500">{reviewed ? 'Reviewed' : 'Leave a review'}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 flex-shrink-0 ${reviewed ? 'text-emerald-400' : 'text-amber-400'}`} />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Browse more ── */}
        <div className="mt-10 text-center">
          <Link href="/calendar" className="text-sm font-medium text-blue-600 hover:text-blue-700">Browse full event calendar →</Link>
        </div>
      </div>
    </main>
  );
}
