'use client';

import type { EventItem } from '@/lib/data/events';
import { getGoogleCalendarUrl, getIcsHref } from '@/lib/utils/calendar-links';

interface SaveDateLinksProps {
  event: EventItem;
  compact?: boolean;
}

export function SaveDateLinks({ event, compact = false }: SaveDateLinksProps) {
  return (
    <details className="group relative">
      <summary
        className={`list-none cursor-pointer rounded-full border border-white/14 bg-white/[0.04] text-slate-100 transition hover:border-white/24 hover:bg-white/[0.08] ${
          compact ? 'px-3 py-1.5 text-xs uppercase tracking-[0.16em]' : 'px-4 py-2 text-sm font-medium'
        }`}
      >
        Save date
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.6rem)] z-20 min-w-[12rem] rounded-[1.2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(10,16,26,0.98),rgba(7,12,20,0.98))] p-2 shadow-[0_24px_70px_-38px_rgba(0,0,0,0.95)]">
        <a
          href={getGoogleCalendarUrl(event)}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-white/[0.06] hover:text-white"
        >
          Add to Google Calendar
        </a>
        <a
          href={getIcsHref(event)}
          download={`${event.slug || event.id}.ics`}
          className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-white/[0.06] hover:text-white"
        >
          Download ICS
        </a>
      </div>
    </details>
  );
}
