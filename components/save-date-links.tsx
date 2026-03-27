'use client';

import type { EventItem } from '@/lib/data/events';
import { canGenerateCalendarLinks, getGoogleCalendarUrl, getIcsHref } from '@/lib/utils/calendar-links';

interface SaveDateLinksProps {
  event: EventItem;
  compact?: boolean;
}

export function SaveDateLinks({ event, compact = false }: SaveDateLinksProps) {
  const canSave = canGenerateCalendarLinks(event);

  if (!canSave) {
    if (compact) {
      return null;
    }

    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500" aria-disabled="true">
        Calendar export unavailable
      </span>
    );
  }

  return (
    <details className="group relative">
      <summary
        className={`list-none cursor-pointer rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 ${
          compact ? 'px-3 py-1.5 text-xs uppercase tracking-[0.16em]' : 'px-4 py-2 text-sm font-medium'
        }`}
      >
        {compact ? 'Calendar' : 'Add to calendar'}
      </summary>
      <div className="absolute left-0 top-[calc(100%+0.6rem)] z-20 min-w-[12rem] rounded-[1rem] border border-slate-200 bg-white p-2 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.18)] sm:left-auto sm:right-0">
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
