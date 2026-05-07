'use client';

import { useEffect, useState } from 'react';
import { Star, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type ReviewedEvent = {
  id: string;
  title: string;
  slug: string;
  city: string;
  country: string;
  date: string;
  image_path: string | null;
  organiser: string;
  association: string | null;
  review_count: number;
  avg_rating: number;
};

const FALLBACK = '/cities/fallback.jpg';

function fmtDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default function ReviewsContent() {
  const [events, setEvents] = useState<ReviewedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    supabase
      .from('events')
      .select('id, title, slug, city, country, date, organiser, association, image_path')
      .lt('date', new Date().toISOString().split('T')[0])
      .not('approved', 'eq', false)
      .order('date', { ascending: false })
      .then(async ({ data: eventsData }) => {
        if (!eventsData) { setLoading(false); return; }
        const { data: reviewStats } = await supabase.from('event_reviews').select('event_id, rating');
        const statsMap = new Map<string, { count: number; total: number }>();
        (reviewStats ?? []).forEach((r: any) => {
          const existing = statsMap.get(r.event_id) ?? { count: 0, total: 0 };
          statsMap.set(r.event_id, { count: existing.count + 1, total: existing.total + r.rating });
        });
        setEvents(eventsData.map((e: any) => {
          const stats = statsMap.get(e.id);
          return { ...e, review_count: stats?.count ?? 0, avg_rating: stats ? stats.total / stats.count : 0 };
        }));
        setLoading(false);
      });
  }, []);

  const reviewed = events.filter((e) => e.review_count > 0).sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count);
  const unreviewed = events.filter((e) => e.review_count === 0);
  const totalReviews = events.reduce((s, e) => s + e.review_count, 0);
  const avgAll = reviewed.length > 0 ? reviewed.reduce((s, e) => s + e.avg_rating, 0) / reviewed.length : 0;

  if (loading) return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" /></div>;

  return (
    <div>
      {/* Stats */}
      {reviewed.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm">
            <p className="text-xl font-bold text-slate-900">{reviewed.length}</p>
            <p className="text-[11px] text-slate-400">Events reviewed</p>
          </div>
          <div className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm">
            <p className="text-xl font-bold text-slate-900">{totalReviews}</p>
            <p className="text-[11px] text-slate-400">Total reviews</p>
          </div>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <p className="text-xl font-bold text-amber-700">{avgAll.toFixed(1)}</p>
            </div>
            <p className="text-[11px] text-amber-600/60">Average rating</p>
          </div>
        </div>
      )}

      {/* Top rated */}
      {reviewed.length > 0 && (
        <section>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Top rated</h2>
          </div>
          <div className="mt-4 space-y-3">
            {reviewed.map((event, i) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-3 shadow-sm transition hover:shadow-md">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <Image src={event.image_path || FALLBACK} alt={event.title} fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 rounded-tr-lg bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white">#{i + 1}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600">{event.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">{event.city}, {event.country}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-700">{event.avg_rating.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400">({event.review_count})</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-300 group-hover:text-blue-400" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Awaiting review */}
      {unreviewed.length > 0 && (
        <section className={reviewed.length > 0 ? 'mt-8' : ''}>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Awaiting review</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">Attended any of these? Your feedback helps everyone.</p>
          <div className="mt-4 space-y-2">
            {unreviewed.slice(0, 10).map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition hover:border-amber-200/60 hover:shadow-sm">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <Image src={event.image_path || FALLBACK} alt={event.title} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-slate-900">{event.title}</h3>
                  <p className="text-[11px] text-slate-400">{fmtDate(event.date)}</p>
                </div>
                <span className="flex-shrink-0 text-[10px] font-semibold text-amber-600">Review</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <Star className="mx-auto h-10 w-10 text-slate-200" />
          <p className="mt-3 font-semibold text-slate-500">No past events to review yet</p>
        </div>
      )}
    </div>
  );
}
