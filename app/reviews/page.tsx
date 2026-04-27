'use client';

import { useEffect, useState } from 'react';
import { Star, MessageSquare, ArrowRight } from 'lucide-react';
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

const FALLBACK_IMAGE = '/cities/fallback.jpg';

function fmtDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
      ))}
    </div>
  );
}

/* ── Reviewed event card — big, visual, easy to tap ── */
function ReviewedCard({ event }: { event: ReviewedEvent }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all hover:shadow-lg hover:border-slate-300/60"
    >
      {/* Image — always shown */}
      <div className="relative h-44 overflow-hidden bg-slate-100 sm:h-48">
        <Image
          src={event.image_path || FALLBACK_IMAGE}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Rating badge overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-slate-900">{event.avg_rating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({event.review_count})</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors sm:text-lg">
          {event.title}
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          {fmtDate(event.date)} &middot; {event.city}, {event.country}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {event.association ?? event.organiser}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <StarRating rating={event.avg_rating} />
          <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
            Read reviews <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Unreviewed event card — clear CTA to review ── */
function UnreviewedCard({ event, isLoggedIn }: { event: ReviewedEvent; isLoggedIn: boolean }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300/60"
    >
      <div className="flex">
        {/* Image */}
        <div className="relative h-auto w-28 flex-shrink-0 overflow-hidden bg-slate-100 sm:w-36">
          <Image
            src={event.image_path || FALLBACK_IMAGE}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors sm:text-base">
            {event.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 sm:text-sm">
            {fmtDate(event.date)} &middot; {event.city}, {event.country}
          </p>
          <p className="mt-0.5 text-xs text-slate-300">
            {event.association ?? event.organiser}
          </p>
          <div className="mt-3">
            {isLoggedIn ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-700 border border-amber-200/60 transition group-hover:bg-amber-100">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                Be the first to review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Star className="h-3 w-3 text-slate-300" />
                No reviews yet
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ReviewsPage() {
  const [events, setEvents] = useState<ReviewedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    supabase
      .from('events')
      .select('id, title, slug, city, country, date, end_date, organiser, association, category, image_path')
      .lt('date', new Date().toISOString().split('T')[0])
      .not('approved', 'eq', false)
      .order('date', { ascending: false })
      .then(async ({ data: eventsData }) => {
        if (!eventsData) { setLoading(false); return; }

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

  const reviewedEvents = events.filter((e) => e.review_count > 0)
    .sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count);
  const unreviewedEvents = events.filter((e) => e.review_count === 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      {/* Hero */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Event Reviews</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            What investigators<br className="hidden sm:block" /> are saying.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-500 sm:text-lg">
            Real feedback from real attendees. Find the events worth your time and budget.
          </p>

          {/* Stats */}
          {reviewedEvents.length > 0 && (
            <div className="mt-8 flex items-center gap-8">
              <div>
                <p className="text-3xl font-extrabold text-slate-900">{reviewedEvents.length}</p>
                <p className="mt-0.5 text-sm text-slate-400">Reviewed</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <p className="text-3xl font-extrabold text-slate-900">{events.reduce((s, e) => s + e.review_count, 0)}</p>
                <p className="mt-0.5 text-sm text-slate-400">Reviews</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
                <div>
                  <p className="text-3xl font-extrabold text-amber-500">
                    {(reviewedEvents.reduce((s, e) => s + e.avg_rating, 0) / reviewedEvents.length).toFixed(1)}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-400">Average</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-blue-600" />
          </div>
        ) : (
          <>
            {/* ── Reviewed events ── */}
            {reviewedEvents.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Top rated events</h2>
                <p className="mt-1.5 text-sm text-slate-400 sm:text-base">Events with attendee reviews — click to read more</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {reviewedEvents.map((event) => (
                    <ReviewedCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Awaiting reviews ── */}
            {unreviewedEvents.length > 0 && (
              <section className={reviewedEvents.length > 0 ? 'mt-14' : ''}>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Awaiting your review</h2>
                <p className="mt-1.5 text-sm text-slate-400 sm:text-base">
                  {userId ? 'Attended any of these? Your review helps the whole industry.' : 'Sign in to leave the first review.'}
                </p>
                <div className="mt-6 space-y-4">
                  {unreviewedEvents.map((event) => (
                    <UnreviewedCard key={event.id} event={event} isLoggedIn={!!userId} />
                  ))}
                </div>
              </section>
            )}

            {events.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
                <Star className="mx-auto h-12 w-12 text-slate-200" />
                <p className="mt-4 text-lg font-semibold text-slate-500">No past events to review yet</p>
                <p className="mt-2 text-sm text-slate-400">Check back after upcoming events have taken place.</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
