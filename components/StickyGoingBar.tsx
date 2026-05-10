'use client';

import { useEffect, useState } from 'react';
import { ThumbsUp, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { hapticMedium, hapticSuccess } from '@/lib/capacitor';

export function StickyGoingBar({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isGoing, setIsGoing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        supabase.from('event_attendees').select('id').eq('event_id', eventId).eq('user_id', uid).eq('is_going', true).maybeSingle()
          .then(({ data: row }) => setIsGoing(!!row));
      }
    });

    // Show bar after scrolling past the hero (sooner on mobile).
    // Mobile scrolls the app content container, not window.
    const scrollTarget = document.querySelector<HTMLElement>('[data-app-content]') ?? window;
    const getScrollTop = () => scrollTarget === window ? window.scrollY : (scrollTarget as HTMLElement).scrollTop;
    const handleScroll = () => setVisible(getScrollTop() > 250);

    handleScroll();
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollTarget.removeEventListener('scroll', handleScroll);
  }, [eventId]);

  const toggle = async () => {
    if (!userId) return;
    setToggling(true);
    const supabase = createSupabaseBrowserClient();
    if (isGoing) {
      await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', userId);
      setIsGoing(false);
      hapticMedium();
    } else {
      await supabase.from('event_attendees').insert({ user_id: userId, event_id: eventId, is_going: true });
      setIsGoing(true);
      hapticSuccess();
    }
    setToggling(false);
  };

  if (!userId || !visible) return null;

  return (
    <div className="fixed bottom-[4.5rem] left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-lg lg:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{eventTitle}</p>
        </div>
        {isGoing ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 border border-emerald-200">
              <ThumbsUp className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" /> Going
            </span>
            <button type="button" onClick={toggle} disabled={toggling} className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={toggle}
            disabled={toggling}
            className="flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
          >
            <ThumbsUp className="h-3.5 w-3.5" /> I&apos;m going
          </button>
        )}
      </div>
    </div>
  );
}
