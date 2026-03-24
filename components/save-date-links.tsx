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
        className={`list-none cursor-pointer rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 ${
          compact ? 'px-3 py-1.5 text-xs uppercase tracking-[0.16em]' : 'px-4 py-2 text-sm font-medium'
        }`}
      >
        Save date
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.6rem)] z-20 min-w-[12rem] rounded-[1.2rem] border border-slate-200 bg-white p-2 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.22)]">
        <a
          href={getGoogleCalendarUrl(event)}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
        >
          Add to Google Calendar
        </a>
        <a
          href={getIcsHref(event)}
          download={`${event.slug || event.id}.ics`}
          className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
        >
          Download ICS
        </a>
      </div>
    </details>
  );
}
