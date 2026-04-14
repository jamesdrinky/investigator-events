'use client';

import { useEffect, useState } from 'react';
import { Star, Send, ThumbsUp } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

type Review = {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

const RATING_LABELS = ['', 'Poor', 'Below average', 'Good', 'Very good', 'Excellent'];
const RATING_EMOJI = ['', '😕', '😐', '🙂', '😊', '🤩'];

export function EventReview({ eventId, isPast }: { eventId: string; isPast: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [showText, setShowText] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    supabase
      .from('event_reviews')
      .select('id, rating, review_text, created_at, profiles:user_id(full_name, avatar_url)')
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

  // Auto-show text field after rating
  useEffect(() => {
    if (rating > 0) setShowText(true);
  }, [rating]);

  const handleSubmit = async () => {
    if (!userId || rating === 0) return;
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('event_reviews')
      .insert({ user_id: userId, event_id: eventId, rating, review_text: text || null })
      .select('id, rating, review_text, created_at')
      .single();

    if (data) {
      const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', userId).single();
      setReviews((prev) => [{ ...data, profiles: profile } as unknown as Review, ...prev]);
      setRating(0);
      setText('');
      setHasReviewed(true);
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const activeRating = hover || rating;

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

      {/* ── Review form — logged in, past event, hasn't reviewed ── */}
      {isPast && userId && !hasReviewed && !submitted && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-amber-50/30 via-white to-blue-50/20">
          <div className="p-5 sm:p-6">
            <p className="text-center text-base font-bold text-slate-900">How was this event?</p>
            <p className="mt-1 text-center text-xs text-slate-400">Tap a star to rate</p>

            {/* Big tappable stars */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
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

            {/* Text area — slides in after rating */}
            {showText && (
              <div className="mt-4" style={{ animation: 'fadeSlideIn 0.3s ease forwards' }}>
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

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3 rounded-xl border border-slate-100 bg-white p-4">
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
              </div>
            </div>
          ))}
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
