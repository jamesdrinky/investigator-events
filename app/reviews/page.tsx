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

/* ── Big featured reviewed card ── */
function FeaturedReviewCard({ event }: { event: ReviewedEvent }) {
  return (
    <Link
      href={`/events/${event.slug}#reviews`}
      className="group relative block overflow-hidden rounded-3xl shadow-xl transition-all hover:shadow-2xl"
    >
      <div className="relative h-64 sm:h-80">
        <Image src={event.image_path || FALLBACK_IMAGE} alt={event.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-5 w-5 ${s <= Math.round(event.avg_rating) ? 'fill-amber-400 text-amber-400' : 'fill-white/30 text-white/30'}`} />
              ))}
            </div>
            <span className="text-lg font-bold text-white">{event.avg_rating.toFixed(1)}</span>
            <span className="text-sm text-white/60">({event.review_count} review{event.review_count !== 1 ? 's' : ''})</span>
          </div>
          <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">{event.title}</h3>
          <p className="mt-2 text-sm text-white/70">{fmtDate(event.date)} &middot; {event.city}, {event.country}</p>
          <p className="mt-1 text-xs text-white/50">{event.association ?? event.organiser}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition group-hover:bg-white/25">
            Read reviews <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Grid reviewed card ── */
function ReviewedCard({ event, rank }: { event: ReviewedEvent; rank: number }) {
  return (
    <Link
      href={`/events/${event.slug}#reviews`}
      className="group block overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all hover:shadow-lg hover:border-slate-300/60"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100 sm:h-48">
        <Image src={event.image_path || FALLBACK_IMAGE} alt={event.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        {/* Rank badge */}
        <div className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-xs font-bold text-white backdrop-blur-sm">
          #{rank}
        </div>
        {/* Rating badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-slate-900">{event.avg_rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{event.title}</h3>
        <p className="mt-2 text-sm text-slate-400">{fmtDate(event.date)} &middot; {event.city}, {event.country}</p>
        <p className="mt-1 text-xs text-slate-300">{event.association ?? event.organiser}</p>
      </div>
    </Link>
  );
}

/* ── Unreviewed card ── */
function UnreviewedCard({ event, isLoggedIn }: { event: ReviewedEvent; isLoggedIn: boolean }) {
  return (
    <Link
      href={`/events/${event.slug}#reviews`}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200/60 bg-white transition-all hover:shadow-md hover:border-amber-200/60"
    >
      <div className="flex">
        <div className="relative h-auto w-28 flex-shrink-0 overflow-hidden bg-slate-100 sm:w-32">
          <Image src={event.image_path || FALLBACK_IMAGE} alt={event.title} fill className="object-cover" />
          {/* Amber side accent on hover */}
          <div className="absolute inset-y-0 right-0 w-1 bg-amber-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors sm:text-base">{event.title}</h3>
          <p className="mt-1.5 text-xs text-slate-400 sm:text-sm">{fmtDate(event.date)} &middot; {event.city}, {event.country}</p>
          <p className="mt-0.5 text-xs text-slate-300">{event.association ?? event.organiser}</p>
          {isLoggedIn && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-3.5 py-1.5 text-xs font-semibold text-amber-700 border border-amber-200/60 shadow-sm transition group-hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                Be the first to review
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center pr-4">
          <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-amber-500" />
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

        setEvents(eventsData.map((e: any) => {
          const stats = statsMap.get(e.id);
          return { ...e, review_count: stats?.count ?? 0, avg_rating: stats ? stats.total / stats.count : 0 };
        }));
        setLoading(false);
      });
  }, []);

  const reviewedEvents = events.filter((e) => e.review_count > 0)
    .sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count);
  const unreviewedEvents = events.filter((e) => e.review_count === 0);
  const totalReviews = events.reduce((s, e) => s + e.review_count, 0);
  const avgAll = reviewedEvents.length > 0 ? reviewedEvents.reduce((s, e) => s + e.avg_rating, 0) / reviewedEvents.length : 0;

  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero with dark gradient ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Event Reviews</p>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            What investigators<br className="hidden sm:block" /> are saying.
          </h1>
          <p className="mt-4 max-w-lg text-base text-slate-400 sm:text-lg">
            Real feedback from real attendees. Find the events worth your time and budget.
          </p>

          {/* Stats row */}
          {reviewedEvents.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{reviewedEvents.length}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-400 sm:text-sm">Events reviewed</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{totalReviews}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-400 sm:text-sm">Total reviews</p>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-6 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                  <p className="text-2xl font-extrabold text-amber-400 sm:text-3xl">{avgAll.toFixed(1)}</p>
                </div>
                <p className="mt-0.5 text-xs font-medium text-amber-400/60 sm:text-sm">Average rating</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{unreviewedEvents.length}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-400 sm:text-sm">Awaiting review</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          </div>
        ) : (
          <>
            {/* ── Top rated ── */}
            {reviewedEvents.length > 0 && (
              <section>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Top rated</h2>
                </div>
                <p className="mt-1.5 text-sm text-slate-400">Highest rated events by the community</p>

                {/* Featured first event */}
                <div className="mt-6">
                  <FeaturedReviewCard event={reviewedEvents[0]} />
                </div>

                {/* Rest in grid */}
                {reviewedEvents.length > 1 && (
                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {reviewedEvents.slice(1).map((event, i) => (
                      <ReviewedCard key={event.id} event={event} rank={i + 2} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── Awaiting reviews ── */}
            {unreviewedEvents.length > 0 && (
              <section className={reviewedEvents.length > 0 ? 'mt-16' : ''}>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Awaiting your review</h2>
                </div>
                <p className="mt-1.5 text-sm text-slate-400">
                  {userId ? 'Attended any of these? Your feedback helps the whole industry.' : 'Sign in to leave the first review.'}
                </p>
                <div className="mt-6 space-y-3">
                  {unreviewedEvents.map((event) => (
                    <UnreviewedCard key={event.id} event={event} isLoggedIn={!!userId} />
                  ))}
                </div>
              </section>
            )}

            {events.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
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
