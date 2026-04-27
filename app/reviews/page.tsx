'use client';

import { useEffect, useState } from 'react';
import { Star, MessageSquare, ChevronRight } from 'lucide-react';
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
  end_date: string | null;
  organiser: string;
  association: string | null;
  category: string;
  image_path: string | null;
  review_count: number;
  avg_rating: number;
};

function fmtDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [events, setEvents] = useState<ReviewedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    // Fetch past events with review stats
    supabase
      .from('events')
      .select('id, title, slug, city, country, date, end_date, organiser, association, category, image_path')
      .lt('date', new Date().toISOString().split('T')[0])
      .not('approved', 'eq', false)
      .order('date', { ascending: false })
      .then(async ({ data: eventsData }) => {
        if (!eventsData) { setLoading(false); return; }

        // Fetch review counts and averages for all events
        const { data: reviewStats } = await supabase
          .from('event_reviews')
          .select('event_id, rating');

        const statsMap = new Map<string, { count: number; total: number }>();
        (reviewStats ?? []).forEach((r: any) => {
          const existing = statsMap.get(r.event_id) ?? { count: 0, total: 0 };
          statsMap.set(r.event_id, { count: existing.count + 1, total: existing.total + r.rating });
        });

        const enriched: ReviewedEvent[] = eventsData.map((e: any) => {
          const stats = statsMap.get(e.id);
          return {
            ...e,
            review_count: stats?.count ?? 0,
            avg_rating: stats ? stats.total / stats.count : 0,
          };
        });

        setEvents(enriched);
        setLoading(false);
      });
  }, []);

  const reviewedEvents = events.filter((e) => e.review_count > 0);
  const unreviewedEvents = events.filter((e) => e.review_count === 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      {/* Hero */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Reviews</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            What investigators are saying.
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-500 sm:text-lg">
            Real feedback from real attendees. Browse ratings and reviews to find the events worth your time and budget.
          </p>
          {reviewedEvents.length > 0 && (
            <div className="mt-6 flex items-center gap-6">
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{reviewedEvents.length}</p>
                <p className="text-xs font-medium text-slate-400">Reviewed events</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{events.reduce((s, e) => s + e.review_count, 0)}</p>
                <p className="text-xs font-medium text-slate-400">Total reviews</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-2xl font-extrabold text-amber-500">
                  {reviewedEvents.length > 0
                    ? (reviewedEvents.reduce((s, e) => s + e.avg_rating, 0) / reviewedEvents.length).toFixed(1)
                    : '—'}
                </p>
                <p className="text-xs font-medium text-slate-400">Avg rating</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          </div>
        ) : (
          <>
            {/* Reviewed events */}
            {reviewedEvents.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900">Top rated events</h2>
                <p className="mt-1 text-sm text-slate-400">Events with attendee reviews</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {reviewedEvents
                    .sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count)
                    .map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300/60"
                    >
                      {/* Image */}
                      {event.image_path && (
                        <div className="relative h-36 overflow-hidden bg-slate-100">
                          <Image
                            src={event.image_path}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <StarRating rating={event.avg_rating} size="md" />
                          <span className="text-sm font-bold text-slate-900">{event.avg_rating.toFixed(1)}</span>
                        </div>
                        {/* Title */}
                        <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        {/* Meta */}
                        <p className="mt-1.5 text-xs text-slate-400">
                          {fmtDate(event.date)} &middot; {event.city}, {event.country}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <MessageSquare className="h-3 w-3" />
                            <span>{event.review_count} review{event.review_count !== 1 ? 's' : ''}</span>
                          </div>
                          <span className="text-xs font-medium text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                            Read reviews <ChevronRight className="inline h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Awaiting reviews */}
            {unreviewedEvents.length > 0 && (
              <section className={reviewedEvents.length > 0 ? 'mt-12' : ''}>
                <h2 className="text-lg font-bold text-slate-900">Awaiting reviews</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {userId ? 'Attended any of these? Be the first to review.' : 'Sign in to leave the first review.'}
                </p>
                <div className="mt-5 space-y-3">
                  {unreviewedEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="group flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white p-3 transition-all hover:shadow-sm hover:border-slate-300/60 sm:p-4"
                    >
                      {event.image_path ? (
                        <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-16 sm:w-24">
                          <Image src={event.image_path} alt={event.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 sm:h-16 sm:w-24">
                          <Star className="h-5 w-5 text-slate-200" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {fmtDate(event.date)} &middot; {event.city}, {event.country}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-300">
                          {event.association ?? event.organiser} &middot; {event.category}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600 group-hover:inline-block">
                          Review
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:hidden" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {events.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                <Star className="mx-auto h-10 w-10 text-slate-200" />
                <p className="mt-3 text-sm font-semibold text-slate-500">No past events to review yet</p>
                <p className="mt-1 text-xs text-slate-400">Check back after upcoming events have taken place.</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
