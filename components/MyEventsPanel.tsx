'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, ChevronRight, Ticket, Plus } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

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

  return (
    <div className="mb-8 sm:mb-12">
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">My Events</h2>
              <p className="text-[11px] text-slate-400">{upcoming.length} upcoming{past.length > 0 ? ` · ${past.length} attended` : ''}</p>
            </div>
          </div>
          <Link href="/submit-event" className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:shadow-sm">
            <Plus className="h-3.5 w-3.5" /> Submit event
          </Link>
        </div>

        {/* Next event highlight */}
        {nextEvent && (
          <Link href={`/events/${nextEvent.slug}`} className="group relative block overflow-hidden border-b border-slate-100">
            {/* Background image */}
            {nextEvent.image_path && (
              <div className="absolute inset-0">
                <Image src={nextEvent.image_path} alt="" fill className="object-cover opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.15]" />
              </div>
            )}
            <div className="relative flex items-center gap-4 px-5 py-5 sm:gap-5 sm:px-6">
              {/* Countdown */}
              <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 sm:h-20 sm:w-20">
                <span className="text-xl font-bold sm:text-2xl">{new Date((nextEvent.start_date ?? '') + 'T00:00:00Z').getUTCDate()}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{new Date((nextEvent.start_date ?? '') + 'T00:00:00Z').toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })}</span>
              </div>
              {/* Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">{daysUntil(nextEvent.start_date)}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500">{nextEvent.category}</span>
                </div>
                <h3 className="mt-1.5 truncate text-base font-bold text-slate-900 group-hover:text-blue-600 sm:text-lg">{nextEvent.title}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {nextEvent.city}, {nextEvent.country}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(nextEvent.start_date)}</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
            </div>
          </Link>
        )}

        {/* Rest of upcoming events */}
        {upcoming.length > 1 && (
          <div className="divide-y divide-slate-50">
            {upcoming.slice(1).map((e) => (
              <Link key={e.id} href={`/events/${e.slug}`} className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50/50 sm:px-6">
                <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                  <span className="text-sm font-bold leading-none">{new Date((e.start_date ?? '') + 'T00:00:00Z').getUTCDate()}</span>
                  <span className="text-[8px] font-semibold uppercase text-slate-400">{new Date((e.start_date ?? '') + 'T00:00:00Z').toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600">{e.title}</p>
                  <p className="truncate text-[11px] text-slate-400">{e.city}, {e.country} · {daysUntil(e.start_date)}</p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-200 transition group-hover:text-blue-400" />
              </Link>
            ))}
          </div>
        )}

        {/* Browse more CTA */}
        <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
          <Link href="/calendar" className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700">
            Browse all events <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
