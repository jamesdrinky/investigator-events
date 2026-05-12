'use client';

import { useEffect, useRef, useState, MouseEvent } from 'react';
import { Check, Plus } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

type MiniAttendee = { user_id: string | null; avatar_url: string | null; full_name: string | null };

export function EventCardAttendees({ eventId }: { eventId: string }) {
  const [attendees, setAttendees] = useState<MiniAttendee[]>([]);
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isGoing, setIsGoing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Lazy fetch — only run the 4 queries when this card scrolls into view.
  // Was 4x queries x ~45 cards = ~180 Supabase round-trips on every
  // calendar page load, which made the page feel choppy.
  useEffect(() => {
    if (hasFetched) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasFetched(true);
          io.disconnect();
        }
      },
      // Load attendee data well ahead of the viewport so the row is
      // populated by the time a fast scroller reaches it (was 200px;
      // that wasn't enough to outrun a flick scroll on a calendar
      // with 45+ cards).
      { rootMargin: '1500px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasFetched]);

  useEffect(() => {
    if (!hasFetched) return;
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        supabase.from('profiles').select('avatar_url, full_name').eq('id', uid).single()
          .then(({ data: p }) => { setUserAvatar(p?.avatar_url ?? null); setUserName(p?.full_name ?? null); });
      }
    });

    supabase
      .from('event_attendees')
      .select('user_id, profiles:user_id(full_name, avatar_url)', { count: 'exact' })
      .eq('event_id', eventId)
      .eq('is_going', true)
      .limit(4)
      .then(({ data, count }) => {
        const rows = (data ?? []).map((r: any) => ({
          user_id: r.user_id ?? null,
          avatar_url: r.profiles?.avatar_url ?? null,
          full_name: r.profiles?.full_name ?? null,
        }));
        setAttendees(rows);
        setTotal(count ?? rows.length);
      });
  }, [eventId, hasFetched]);

  useEffect(() => {
    if (!userId || !hasFetched) return;
    const supabase = createSupabaseBrowserClient();
    supabase.from('event_attendees').select('id').eq('event_id', eventId).eq('user_id', userId).eq('is_going', true).maybeSingle()
      .then(({ data }) => setIsGoing(!!data));
  }, [userId, eventId, hasFetched]);

  const toggle = async (e: MouseEvent) => {
    e.preventDefault(); // Don't navigate to event page
    e.stopPropagation();
    if (!userId || toggling) return;
    setToggling(true);
    const supabase = createSupabaseBrowserClient();

    if (isGoing) {
      await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', userId);
      setIsGoing(false);
      setTotal((t) => Math.max(0, t - 1));
      setAttendees((prev) => prev.filter((a) => a.user_id !== userId));
    } else {
      await supabase.from('event_attendees').insert({ user_id: userId, event_id: eventId, is_going: true });
      setIsGoing(true);
      setTotal((t) => t + 1);
      setAttendees((prev) => [{ user_id: userId, avatar_url: userAvatar, full_name: userName }, ...prev].slice(0, 4));
    }
    setToggling(false);
  };

  return (
    // min-h reserves the row height so the card layout doesn't shift
    // when attendee data + going button populate after the lazy fetch.
    <div ref={rootRef} className="flex min-h-[32px] items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {/* Attendee avatars */}
      {total > 0 && (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1.5">
            {attendees.slice(0, 3).map((a, i) => (
              <div key={i} className="overflow-hidden rounded-full border-[1.5px] border-white shadow-sm">
                <UserAvatar src={a.avatar_url} name={a.full_name} size={20} />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-medium text-slate-400">{total}</span>
        </div>
      )}

      {/* Quick going toggle */}
      {userId && (
        <button
          type="button"
          onClick={toggle}
          disabled={toggling}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition ${
            isGoing
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
              : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
          }`}
        >
          {isGoing ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {isGoing ? 'Going' : 'Going?'}
        </button>
      )}
    </div>
  );
}
