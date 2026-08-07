'use client';

// "Every event from all your associations, in your own calendar" — one-click
// personal feed subscription for signed-in members.

import { useEffect, useState } from 'react';
import { CalendarPlus, Check, Copy } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface FeedLinks {
  associations: number;
  url: string;
  webcal: string;
  google: string;
}

export function MyCalendarSync() {
  const [links, setLinks] = useState<FeedLinks | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/my-calendar')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => json && setLinks(json))
      .catch(() => {});
  }, []);

  // Signed out, errored, or no associations yet → stay invisible.
  if (!links || links.associations === 0) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(links.url);
      trackEvent('calendar_feed_copied', { filter: 'my-associations' });
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50/70 to-purple-50/50 p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <CalendarPlus className="h-4 w-4 text-blue-600" />
            Your associations, in your calendar
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            One subscription puts every event from your {links.associations}{' '}
            association{links.associations === 1 ? '' : 's'} into your own calendar — and keeps it updated
            forever.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={links.google}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('calendar_feed_copied', { filter: 'my-associations-google' })}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
          >
            Google Calendar
          </a>
          <a
            href={links.webcal}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Apple / Outlook
          </a>
          <button
            onClick={copy}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition ${
              copied ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy URL'}
          </button>
        </div>
      </div>
    </div>
  );
}
