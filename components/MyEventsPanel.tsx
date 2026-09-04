'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ChevronRight, ChevronDown, Ticket } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';
import { getEventImage, getCityHeroImageUrl } from '@/lib/utils/city-media';

type MyEvent = {
  id: string;
  title: string;
  slug: string | null;
  city: string;
  country: string;
  start_date: string | null;
  end_date: string | null;
  image_path: string | null;
  category: string;
  is_past: boolean;
};

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function daysUntil(d: string | null) {
  if (!d) return '';
  const now = new Date();
  const target = new Date(d + 'T00:00:00Z');
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 0) return 'Past';
  if (diff <= 7) return `${diff} days`;
  if (diff <= 30) return `${Math.ceil(diff / 7)} weeks`;
  return `${Math.ceil(diff / 30)} months`;
}

export function MyEventsPanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  // Folded on load: the next event is the useful part, and eight of them
  // unfolded pushes the actual calendar off the screen.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return; }
      setUserId(data.user.id);

      const { data: profile } = await supabase.from('profiles').select('avatar_url, full_name').eq('id', data.user.id).maybeSingle();
      if (profile) {
        setAvatarUrl(profile.avatar_url);
        setFullName(profile.full_name);
      }

      const { data: attendingRows } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('user_id', data.user.id)
        .eq('is_going', true);

      const ids = (attendingRows ?? []).map((r) => r.event_id).filter((id): id is string => id !== null);
      if (ids.length === 0) { setLoading(false); return; }

      const { data: eventRows } = await supabase
        .from('events')
        .select('id, title, slug, city, country, start_date, end_date, image_path, category')
        .in('id', ids)
        .eq('approved', true)
        .order('start_date', { ascending: true });

      const today = new Date().toISOString().slice(0, 10);
      setEvents((eventRows ?? []).map((e) => ({
        ...e,
        is_past: (e.start_date ?? '') < today,
      })));
      setLoading(false);
    });
  }, []);

  if (loading || !userId) return null;
  if (events.length === 0) return null;

  const upcoming = events.filter((e) => !e.is_past);
  const past = events.filter((e) => e.is_past);
  const nextEvent = upcoming[0];
  // Same fallback chain the event page uses, so an event with no image_path
  // still gets a backdrop here instead of a flat panel.
  const nextEventCover = nextEvent
    ? (nextEvent.image_path && /^(\/(cities|events|images)\/|https?:\/\/)/.test(nextEvent.image_path)
        ? nextEvent.image_path
        : getEventImage(nextEvent.slug ?? '') ?? getCityHeroImageUrl(nextEvent.city ?? '') ?? null)
    : null;

  return (
    <div className="mb-8 sm:mb-12">
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)]">
        {/* Header — no submit button here: the page hero already has one, and
            two of them a hundred pixels apart reads as a mistake. */}
        <div className="flex items-baseline justify-between px-5 pb-3 pt-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Ticket className="h-4 w-4 text-blue-600" />
            <h2 className="text-[15px] font-bold tracking-[-0.01em] text-slate-900">My events</h2>
          </div>
          <p className="text-[11px] font-medium text-slate-400">
            {upcoming.length} upcoming{past.length > 0 ? ` · ${past.length} attended` : ''}
          </p>
        </div>

        {/* Next event — a real image card rather than a photo at 8% opacity.
            Same treatment as the home screen's Up Next card, which is the
            strongest thing in the app; no reason to invent a second style. */}
        {nextEvent && (
          <Link href={`/events/${nextEvent.slug}`} className="group relative block">
            {/* Full-bleed to the panel edges. Inset here made this card
                narrower than the search block and the featured card below it,
                so the page lost its left edge halfway down. */}
            <div className="relative overflow-hidden border-y border-slate-100 bg-slate-900">
              {nextEventCover ? (
                <Image
                  src={nextEventCover}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 640px"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
              ) : null}
              {/* Scrim: dark enough at the base for white text to hold up on
                  any photo, clear at the top so the image still reads. */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/10" />

              <div className="relative flex min-h-[13rem] flex-col justify-between p-4 sm:min-h-[15rem] sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {daysUntil(nextEvent.start_date)}
                  </span>
                  {nextEvent.category ? (
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
                      {nextEvent.category}
                    </span>
                  ) : null}
                </div>

                <div>
                  {/* Two lines, so an event does not lose its own name. */}
                  <h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-[-0.02em] text-white sm:text-xl">
                    {nextEvent.title}
                  </h3>
                  {/* One date, not two — the tile used to repeat what this line
                      already said. */}
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/75">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{nextEvent.city}, {nextEvent.country}</span>
                    <span aria-hidden className="text-white/40">·</span>
                    <span className="flex-shrink-0">{formatDate(nextEvent.start_date)}</span>
                  </p>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Everything after the next event folds away. */}
        {upcoming.length > 1 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 sm:px-6"
          >
            {expanded ? 'Show less' : `Show ${upcoming.length - 1} more`}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}

        {upcoming.length > 1 && expanded && (
          <div className="divide-y divide-slate-50">
            {upcoming.slice(1).map((e) => (
              <Link key={e.id} href={`/events/${e.slug}`} className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50/50 sm:px-6">
                <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                  <span className="text-sm font-bold leading-none">{new Date((e.start_date ?? '') + 'T00:00:00Z').getUTCDate()}</span>
                  <span className="text-[8px] font-semibold uppercase text-slate-400">{new Date((e.start_date ?? '') + 'T00:00:00Z').toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-600">{e.title}</p>
                  <p className="truncate text-[11px] text-slate-400">{e.city}, {e.country} · {daysUntil(e.start_date)}</p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-200 transition group-hover:text-blue-400" />
              </Link>
            ))}
          </div>
        )}

        {/* Browse more CTA */}
        <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
          <Link href="/calendar#events-list" scroll className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700">
            Browse all events <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
