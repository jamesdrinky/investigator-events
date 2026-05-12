'use client';

import { useEffect, useState } from 'react';
import { ThumbsUp, X, ChevronDown, ChevronUp, Send } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

type Attendee = { id: string; user_id: string; username: string | null; avatar_url: string | null; full_name: string | null; specialisation: string | null };

export function AttendeeAvatars({ eventId }: { eventId: string }) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isGoing, setIsGoing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    supabase
      .from('event_attendees')
      .select('id, user_id, profiles:user_id(full_name, avatar_url, username, specialisation)', { count: 'exact' })
      .eq('event_id', eventId)
      .eq('is_going', true)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, count }) => {
        const rows = (data ?? []).map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          avatar_url: r.profiles?.avatar_url ?? null,
          full_name: r.profiles?.full_name ?? null,
          username: r.profiles?.username ?? null,
          specialisation: r.profiles?.specialisation ?? null,
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
        const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url, username, specialisation').eq('id', userId).single();
        setAttendees((prev) => [{
          id: data.id, user_id: data.user_id ?? userId,
          avatar_url: profile?.avatar_url ?? null, full_name: profile?.full_name ?? null,
          username: profile?.username ?? null, specialisation: profile?.specialisation ?? null,
        }, ...prev]);
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
      {/* Header + button row */}
      <div className="flex items-center gap-3">
        {userId && !isGoing && (
          <button
            type="button"
            onClick={toggle}
            disabled={toggling}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
          >
            <ThumbsUp className="h-4 w-4" />
            I&apos;m going
          </button>
        )}
        {userId && isGoing && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 border border-emerald-200">
              <ThumbsUp className="h-4 w-4 fill-emerald-600 text-emerald-600" />
              You&apos;re going
            </span>
            <button
              type="button"
              onClick={toggle}
              disabled={toggling}
              className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Attendee avatars row */}
      {shown.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-2"
          >
            <div className="flex -space-x-2">
              {shown.map((a) => (
                <div key={a.id} className="overflow-hidden rounded-full border-2 border-white shadow-sm transition group-hover:shadow-md">
                  <UserAvatar src={a.avatar_url} name={a.full_name} size={40} />
                </div>
              ))}
            </div>
            {extra > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">+{extra}</span>
            )}
            <span className="flex items-center gap-1 text-xs font-medium text-slate-400 transition group-hover:text-blue-600">
              {total} going {showAll ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </span>
          </button>
        </div>
      )}

      {/* Empty-state placeholder removed — the 'I'm going' button is the
          call to action. The grey-circles + repeat-the-button-copy
          placeholder felt redundant and noisy. */}

      {/* Expanded attendee list */}
      {showAll && attendees.length > 0 && (
        <div className="mt-4 space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {attendees.map((a) => {
            const isMe = a.user_id === userId;
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white hover:shadow-sm"
              >
                {a.username ? (
                  <Link href={`/profile/${a.username}`} className="flex-shrink-0">
                    <UserAvatar src={a.avatar_url} name={a.full_name} size={36} />
                  </Link>
                ) : (
                  <div className="flex-shrink-0">
                    <UserAvatar src={a.avatar_url} name={a.full_name} size={36} />
                  </div>
                )}
                {a.username ? (
                  <Link href={`/profile/${a.username}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{a.full_name ?? 'Investigator'}</p>
                    {a.specialisation && <p className="truncate text-[11px] text-slate-400">{a.specialisation}</p>}
                  </Link>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{a.full_name ?? 'Investigator'}</p>
                    {a.specialisation && <p className="truncate text-[11px] text-slate-400">{a.specialisation}</p>}
                  </div>
                )}
                {userId && !isMe && (
                  <Link
                    href={`/messages?to=${a.user_id}`}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    title={`Message ${a.full_name}`}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
