'use client';

import { useState } from 'react';
import { Check, Copy, Megaphone, X } from 'lucide-react';

interface OrganizerShareKitProps {
  slug: string;
  title: string;
  dateLine: string;
  city: string;
  country: string;
  organiser: string;
}

/**
 * Admin-only flywheel tool. For each event it produces everything the
 * organizer-outreach loop needs, pre-filled: LinkedIn post templates in the
 * organizer's voice, an IE-voice post, the Mike-signed outreach email, and a
 * preview of the auto-generated OG share card. Copy, paste, send.
 */
export function OrganizerShareKit({ slug, title, dateLine, city, country, organiser }: OrganizerShareKitProps) {
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const url = `https://www.investigatorevents.com/events/${slug}`;
  const where = [city, country].filter(Boolean).join(', ');

  const templates: { key: string; label: string; hint: string; text: string }[] = [
    {
      key: 'organizer-announce',
      label: 'Organizer post — announcement',
      hint: 'For the organizer to share with their audience',
      text: `We're delighted that ${title} is featured on Investigator Events — the global calendar for the investigations profession.\n\nFull event details, and who else is attending, here:\n${url}\n\nSee you in ${city || where} — ${dateLine}.\n\n#privateinvestigator #investigations #networking`,
    },
    {
      key: 'organizer-countdown',
      label: 'Organizer post — countdown',
      hint: 'Closer to the event date',
      text: `${title} is coming to ${city || where} — ${dateLine}.\n\nSee the programme, connect with fellow attendees before the day, and let colleagues know you're going:\n${url}\n\n#investigations #${(country || 'events').replace(/\s+/g, '')}`,
    },
    {
      key: 'organizer-community',
      label: 'Organizer post — who else is going?',
      hint: 'Social-proof angle',
      text: `Who else is going? ${title} has a live page on Investigator Events — the industry's shared events calendar.\n\nSee who's attending and say hello before ${city || 'the event'}:\n${url}`,
    },
    {
      key: 'ie-voice',
      label: 'IE post — for Mike / IE channels',
      hint: 'Our own voice',
      text: `Spotlight: ${title} — ${where}, ${dateLine}.\n\nOne of the events we're tracking on Investigator Events, the global calendar for the investigations profession. Details, attendees, and discussion:\n${url}`,
    },
    {
      key: 'outreach-email',
      label: 'Outreach email — to the organizer (from Mike)',
      hint: 'Subject: ' + `${title} is featured on Investigator Events`,
      text: `Hi [name],\n\nI'm Mike LaCorte, one of the founders of Investigator Events — the global events calendar for the investigations profession, used by investigators across 18+ countries.\n\n${title} is now featured on the platform:\n${url}\n\nThree quick things, all free:\n\n1. Claim your page — reply to this email and we'll make sure the details, programme and imagery are exactly as you want them.\n\n2. Share it with your attendees — when the link is posted on LinkedIn it renders a full event card automatically. There's a ready-made post below you're welcome to copy.\n\n3. Partner with us — if you'd like to offer our members a discount code, we'll feature ${title} in our weekly newsletter and on the homepage in return.\n\nReady-made post:\n---\nWe're delighted that ${title} is featured on Investigator Events — the global calendar for the investigations profession. Full event details, and who else is attending: ${url}\n---\n\nWarm regards,\nMike LaCorte\nInvestigator Events · investigatorevents.com`,
    },
  ];

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      /* clipboard unavailable — user can select manually */
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-20 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-700 hover:shadow-xl sm:bottom-8 sm:right-24 sm:h-14 sm:w-14"
        title="Share kit (admin)"
      >
        <Megaphone className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Share kit</h2>
            <p className="text-xs text-slate-500">
              {title} · {organiser}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
            aria-label="Close share kit"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Share card (auto-generated — appears when the link is pasted anywhere)
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/events/${slug}/opengraph-image`}
              alt={`Share card for ${title}`}
              className="w-full rounded-xl border border-slate-200 shadow-sm"
            />
          </div>

          {templates.map((t) => (
            <div key={t.key} className="rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{t.label}</p>
                  <p className="truncate text-xs text-slate-500">{t.hint}</p>
                </div>
                <button
                  onClick={() => copy(t.key, t.text)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    copiedKey === t.key
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-900 text-white hover:bg-slate-700'
                  }`}
                >
                  {copiedKey === t.key ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === t.key ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap px-4 py-3 font-sans text-[13px] leading-relaxed text-slate-600">
                {t.text}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
