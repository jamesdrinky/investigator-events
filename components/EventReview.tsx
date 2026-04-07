'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

type Review = {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

export function EventReview({ eventId, isPast }: { eventId: string; isPast: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });

    supabase
      .from('event_reviews')
      .select('id, rating, review_text, created_at, profiles:user_id(full_name, avatar_url)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Review[];
        setReviews(rows);
      });
  }, [eventId]);

  useEffect(() => {
    if (userId && reviews.length > 0) {
      // Check from supabase directly since join doesn't give user_id
      const supabase = createSupabaseBrowserClient();
      supabase
        .from('event_reviews')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()
        .then(({ data }) => setHasReviewed(!!data));
    }
  }, [userId, reviews, eventId]);

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
    }
    setSubmitting(false);
  };

  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-950">Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-900">{avg.toFixed(1)}</span>
            <span className="text-slate-400">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Submit form — only for past events, logged-in users who haven't reviewed */}
      {isPast && userId && !hasReviewed && (
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <p className="text-sm font-medium text-slate-700">Rate this event</p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    s <= (hover || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-200 text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            className="field-input mt-3 w-full text-sm"
            rows={3}
            placeholder="Share your experience (optional)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="button"
            disabled={rating === 0 || submitting}
            onClick={handleSubmit}
            className="btn-primary mt-3 px-5 py-2 text-sm disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="mt-5 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <UserAvatar src={r.profiles?.avatar_url} name={r.profiles?.full_name} size={32} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{r.profiles?.full_name ?? 'Anonymous'}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3 w-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                {r.review_text && <p className="mt-1 text-sm text-slate-600">{r.review_text}</p>}
                <p className="mt-1 text-[11px] text-slate-400">
                  {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">{isPast ? 'No reviews yet. Be the first!' : 'Reviews will be available after the event.'}</p>
      )}
    </div>
  );
}
