'use client';

import { useEffect, useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

type Attendee = { id: string; user_id: string; avatar_url: string | null; full_name: string | null };

export function AttendeeAvatars({ eventId }: { eventId: string }) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isGoing, setIsGoing] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    supabase
      .from('event_attendees')
      .select('id, user_id, profiles:user_id(full_name, avatar_url)')
      .eq('event_id', eventId)
      .eq('is_going', true)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, count }) => {
        const rows = (data ?? []).map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          avatar_url: r.profiles?.avatar_url ?? null,
          full_name: r.profiles?.full_name ?? null,
        }));
        setAttendees(rows);
        setTotal(count ?? rows.length);
      });
  }, [eventId]);

  useEffect(() => {
    if (!userId) return;
    setIsGoing(attendees.some((a) => a.user_id === userId));
  }, [userId, attendees]);

  const toggle = async () => {
    if (!userId) return;
    setToggling(true);
    const supabase = createSupabaseBrowserClient();

    if (isGoing) {
      await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', userId);
      setAttendees((prev) => prev.filter((a) => a.user_id !== userId));
      setTotal((t) => Math.max(0, t - 1));
      setIsGoing(false);
    } else {
      const { data } = await supabase
        .from('event_attendees')
        .insert({ user_id: userId, event_id: eventId, is_going: true })
        .select('id, user_id')
        .single();
      if (data) {
        const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', userId).single();
        setAttendees((prev) => [{ id: data.id, user_id: data.user_id, avatar_url: profile?.avatar_url ?? null, full_name: profile?.full_name ?? null }, ...prev]);
        setTotal((t) => t + 1);
        setIsGoing(true);
      }
    }
    setToggling(false);
  };

  const shown = attendees.slice(0, 5);
  const extra = total - shown.length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-950">Who&apos;s going</h3>
        {total > 0 && <span className="text-xs text-slate-400">{total} attending</span>}
      </div>

      {shown.length > 0 ? (
        <div className="mt-3 flex items-center">
          <div className="flex -space-x-2">
            {shown.map((a) => (
              <div key={a.id} className="overflow-hidden rounded-full border-2 border-white">
                <UserAvatar src={a.avatar_url} name={a.full_name} size={44} />
              </div>
            ))}
          </div>
          {extra > 0 && (
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">+{extra} more</span>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-400">No one has marked attendance yet.</p>
      )}

      {userId && (
        <button
          type="button"
          onClick={toggle}
          disabled={toggling}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all sm:py-3.5 ${
            isGoing
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600'
              : 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700'
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${isGoing ? 'fill-white' : ''}`} />
          {isGoing ? "You're going!" : "I'm going"}
        </button>
      )}
    </div>
  );
}
