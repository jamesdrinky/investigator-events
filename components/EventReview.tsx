'use client';

import { useEffect, useState } from 'react';
import { Star, Send, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

type Review = {
  id: string;
  rating: number;
  rating_content: number | null;
  rating_networking: number | null;
  rating_organisation: number | null;
  rating_venue: number | null;
  rating_value: number | null;
  would_recommend: boolean | null;
  review_text: string | null;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

const SUB_CATEGORIES = [
  { key: 'rating_content', label: 'Content & Speakers', icon: '🎤' },
  { key: 'rating_networking', label: 'Networking', icon: '🤝' },
  { key: 'rating_organisation', label: 'Organisation', icon: '📋' },
  { key: 'rating_venue', label: 'Venue & Location', icon: '📍' },
  { key: 'rating_value', label: 'Value for Money', icon: '💰' },
] as const;

type SubKey = (typeof SUB_CATEGORIES)[number]['key'];

const RATING_LABELS = ['', 'Poor', 'Below average', 'Good', 'Very good', 'Excellent'];
const RATING_EMOJI = ['', '😕', '😐', '🙂', '😊', '🤩'];

const REVIEW_FIELDS = 'id, rating, rating_content, rating_networking, rating_organisation, rating_venue, rating_value, would_recommend, review_text, created_at, profiles:user_id(full_name, avatar_url)';

/* ── Sub-rating dots (neon blue accent) ── */
function SubRatingInput({ value, onChange, label, icon }: { value: number; onChange: (v: number) => void; label: string; icon: string }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform hover:scale-110 active:scale-95"
          >
            <div
              className={`h-5 w-5 rounded-full border-2 transition-all duration-200 ${
                s <= active
                  ? 'border-blue-500 bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.5)]'
                  : 'border-slate-200 bg-white'
              }`}
            />
          </button>
        ))}
        {active > 0 && (
          <span className="ml-1.5 w-7 text-right text-xs font-semibold text-blue-600">{active}/5</span>
        )}
      </div>
    </div>
  );
}

/* ── Sub-rating display bar ── */
function SubRatingBar({ label, icon, avg }: { label: string; icon: string; avg: number }) {
  const pct = (avg / 5) * 100;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-sm">{icon}</span>
      <span className="w-32 flex-shrink-0 text-xs font-medium text-slate-600 sm:w-36">{label}</span>
      <div className="flex flex-1 items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="w-6 text-right text-xs font-bold text-slate-700">{avg.toFixed(1)}</span>
      </div>
    </div>
  );
}

export function EventReview({ eventId, isPast }: { eventId: string; isPast: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [subRatings, setSubRatings] = useState<Record<SubKey, number>>({
    rating_content: 0,
    rating_networking: 0,
    rating_organisation: 0,
    rating_venue: 0,
    rating_value: 0,
  });
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [text, setText] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    supabase
      .from('event_reviews')
      .select(REVIEW_FIELDS)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setReviews((data ?? []) as unknown as Review[]));
  }, [eventId]);

  useEffect(() => {
    if (userId) {
      const supabase = createSupabaseBrowserClient();
      supabase.from('event_reviews').select('id').eq('event_id', eventId).eq('user_id', userId).maybeSingle()
        .then(({ data }) => setHasReviewed(!!data));
    }
  }, [userId, eventId]);

  // Auto-show details after overall rating
  useEffect(() => {
    if (rating > 0) setShowDetails(true);
  }, [rating]);

  const handleSubmit = async () => {
    if (!userId || rating === 0) return;
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('event_reviews')
      .insert({
        user_id: userId,
        event_id: eventId,
        rating,
        rating_content: subRatings.rating_content || null,
        rating_networking: subRatings.rating_networking || null,
        rating_organisation: subRatings.rating_organisation || null,
        rating_venue: subRatings.rating_venue || null,
        rating_value: subRatings.rating_value || null,
        would_recommend: wouldRecommend,
        review_text: text || null,
      })
      .select(REVIEW_FIELDS)
      .single();

    if (data) {
      setReviews((prev) => [data as unknown as Review, ...prev]);
      setRating(0);
      setText('');
      setHasReviewed(true);
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  // Computed stats
  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const activeRating = ratingHover || rating;

  const subAvg = (key: SubKey) => {
    const rated = reviews.filter((r) => r[key] != null);
    return rated.length > 0 ? rated.reduce((s, r) => s + (r[key] ?? 0), 0) / rated.length : 0;
  };

  const recommendPct = (() => {
    const voted = reviews.filter((r) => r.would_recommend != null);
    if (voted.length === 0) return null;
    return Math.round((voted.filter((r) => r.would_recommend).length / voted.length) * 100);
  })();

  return (
    <div>
      {/* Header with average */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-950">Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-900">{avg.toFixed(1)}</span>
            <span className="text-sm text-slate-400">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* ── Aggregate breakdown ── */}
      {reviews.length > 0 && reviews.some((r) => r.rating_content != null) && (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
          <div className="space-y-0.5">
            {SUB_CATEGORIES.map((cat) => {
              const a = subAvg(cat.key);
              return a > 0 ? <SubRatingBar key={cat.key} label={cat.label} icon={cat.icon} avg={a} /> : null;
            })}
          </div>
          {recommendPct !== null && (
            <div className="mt-3 flex items-center gap-2 border-t border-slate-200/60 pt-3">
              <ThumbsUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600">{recommendPct}%</span>
              <span className="text-xs text-slate-500">would recommend this event</span>
            </div>
          )}
        </div>
      )}

      {/* ── Review form — logged in, past event, hasn't reviewed ── */}
      {isPast && userId && !hasReviewed && !submitted && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-amber-50/30 via-white to-blue-50/20">
          <div className="p-5 sm:p-6">
            <p className="text-center text-base font-bold text-slate-900">How was this event?</p>
            <p className="mt-1 text-center text-xs text-slate-400">Tap a star to rate overall</p>

            {/* Big tappable gold stars — overall */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setRatingHover(s)}
                  onMouseLeave={() => setRatingHover(0)}
                  className="rounded-xl p-2 transition-all duration-200 hover:scale-110 active:scale-95"
                  style={{
                    background: s <= activeRating ? 'rgba(251,191,36,0.1)' : 'transparent',
                  }}
                >
                  <Star
                    className={`h-10 w-10 transition-all duration-200 sm:h-12 sm:w-12 ${
                      s <= activeRating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]'
                        : 'fill-slate-200 text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Rating label */}
            {activeRating > 0 && (
              <div className="mt-2 text-center">
                <span className="text-2xl">{RATING_EMOJI[activeRating]}</span>
                <p className="mt-1 text-sm font-semibold text-slate-700">{RATING_LABELS[activeRating]}</p>
              </div>
            )}

            {/* Sub-ratings + text — slides in after overall rating */}
            {showDetails && (
              <div className="mt-5" style={{ animation: 'fadeSlideIn 0.3s ease forwards' }}>
                {/* Sub-category ratings */}
                <div className="rounded-xl border border-slate-200/60 bg-white p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Rate specific areas</p>
                  <div className="divide-y divide-slate-100">
                    {SUB_CATEGORIES.map((cat) => (
                      <SubRatingInput
                        key={cat.key}
                        icon={cat.icon}
                        label={cat.label}
                        value={subRatings[cat.key]}
                        onChange={(v) => setSubRatings((prev) => ({ ...prev, [cat.key]: v }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Would recommend */}
                <div className="mt-4 rounded-xl border border-slate-200/60 bg-white p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-700">Would you recommend this event?</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setWouldRecommend(true)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                        wouldRecommend === true
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                          : 'border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setWouldRecommend(false)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                        wouldRecommend === false
                          ? 'border-red-400 bg-red-50 text-red-600 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                          : 'border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      No
                    </button>
                  </div>
                </div>

                {/* Written review */}
                <div className="mt-4">
                  <textarea
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                    rows={3}
                    placeholder="Tell others about your experience... (optional)"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">Your review helps other investigators decide.</p>
                    <button
                      type="button"
                      disabled={rating === 0 || submitting}
                      onClick={handleSubmit}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {submitting ? 'Posting...' : 'Post review'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success message */}
      {submitted && (
        <div className="mt-5 rounded-2xl border border-emerald-200/60 bg-emerald-50/30 p-5 text-center">
          <ThumbsUp className="mx-auto h-8 w-8 text-emerald-500" />
          <p className="mt-2 text-sm font-bold text-slate-900">Thanks for your review!</p>
          <p className="mt-1 text-xs text-slate-500">It helps the whole profession make better decisions about events.</p>
        </div>
      )}

      {/* Sign in prompt */}
      {isPast && !userId && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-amber-50/30 via-white to-blue-50/20 p-6 text-center">
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-8 w-8 fill-slate-200 text-slate-200" />
            ))}
          </div>
          <p className="mt-3 text-base font-bold text-slate-900">Attended this event?</p>
          <p className="mt-1 text-sm text-slate-500">Sign in to leave a review and help others decide.</p>
          <a href="/signin" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            Sign in to review
          </a>
        </div>
      )}

      {/* Future event message */}
      {!isPast && (
        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-center">
          <Star className="mx-auto h-8 w-8 text-slate-200" />
          <p className="mt-2 text-sm text-slate-400">Reviews will be available after the event.</p>
        </div>
      )}

      {/* ── Reviews list ── */}
      {reviews.length > 0 && (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => {
            const hasSubRatings = r.rating_content != null || r.rating_networking != null;
            const isExpanded = expandedReview === r.id;

            return (
              <div key={r.id} className="rounded-xl border border-slate-100 bg-white p-4">
                <div className="flex gap-3">
                  <UserAvatar src={r.profiles?.avatar_url} name={r.profiles?.full_name} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{r.profiles?.full_name ?? 'Anonymous'}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-300">{timeAgoShort(r.created_at)}</span>
                    </div>
                    {r.review_text && <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{r.review_text}</p>}

                    {/* Recommend badge */}
                    {r.would_recommend != null && (
                      <div className="mt-2 inline-flex items-center gap-1">
                        {r.would_recommend ? (
                          <>
                            <ThumbsUp className="h-3 w-3 text-emerald-500" />
                            <span className="text-[11px] font-medium text-emerald-600">Recommends</span>
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="h-3 w-3 text-slate-400" />
                            <span className="text-[11px] font-medium text-slate-400">Doesn&apos;t recommend</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Expandable sub-ratings */}
                    {hasSubRatings && (
                      <button
                        type="button"
                        onClick={() => setExpandedReview(isExpanded ? null : r.id)}
                        className="mt-2 flex items-center gap-1 text-[11px] font-medium text-blue-500 hover:text-blue-600"
                      >
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {isExpanded ? 'Hide' : 'View'} detailed ratings
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded sub-ratings */}
                {hasSubRatings && isExpanded && (
                  <div className="mt-3 ml-12 rounded-lg bg-slate-50 p-3">
                    {SUB_CATEGORIES.map((cat) => {
                      const val = r[cat.key];
                      if (val == null) return null;
                      return (
                        <div key={cat.key} className="flex items-center justify-between py-1">
                          <span className="text-[11px] text-slate-500">{cat.icon} {cat.label}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <div
                                key={s}
                                className={`h-2.5 w-2.5 rounded-full ${
                                  s <= val ? 'bg-blue-500 shadow-[0_0_4px_rgba(37,99,235,0.4)]' : 'bg-slate-200'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-[10px] font-semibold text-slate-500">{val}/5</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function timeAgoShort(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
