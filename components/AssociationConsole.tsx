'use client';

// Client side of the Association Console: add events (into IE review),
// see what's live and what's pending, request edits/removals.

import { useState } from 'react';
import { BadgeCheck, Calendar, CalendarPlus, Check, CheckCircle2, Clock, Copy, ExternalLink, Globe, LayoutPanelTop, Loader2, MapPin, Pencil, Plus, Send, Star, Trash2, Users } from 'lucide-react';

const REGIONS = ['Europe', 'North America', 'Asia-Pacific', 'Middle East', 'Latin America', 'Africa'];
const CATEGORIES = [
  'Conference',
  'Annual Conference',
  'Association Meeting',
  'Regional Meeting',
  'Seminar',
  'Training',
  'Summit',
  'Expo',
  'Networking',
  'AGM',
];

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20';

interface LiveEvent {
  id: string;
  title: string;
  slug: string;
  date: string;
  endDate: string | null;
  city: string;
  country: string;
  region: string;
  category: string;
  description: string;
  website: string;
  upcoming: boolean;
  going: number;
  rating: number | null;
  reviewCount: number;
}

interface ConsoleStats {
  upcoming: number;
  members: number;
  totalGoing: number;
}

interface PendingSubmission {
  id: string;
  event_name: string;
  start_date: string;
  end_date: string | null;
  city: string;
  country: string;
  created_at: string;
}

function formatRange(start: string, end: string | null): string {
  const s = new Date(`${start}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (!end || end === start) return s;
  const e = new Date(`${end}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${s} – ${e}`;
}

export function RequestAccessCard({ slug, name }: { slug: string; name: string }) {
  const [note, setNote] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const send = async () => {
    setState('sending');
    try {
      const res = await fetch('/api/association-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-access', slug, note }),
      });
      if (res.ok) setState('sent');
      else setState('idle');
    } catch {
      setState('idle');
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200/60 bg-white p-8 shadow-lg">
      {state === 'sent' ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">Request sent</h1>
          <p className="mt-2 text-sm text-slate-500">
            The Investigator Events team will verify you with {name} and switch on your access — usually within a day.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-xl font-bold text-slate-900">Manage {name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your account isn&apos;t a manager of {name} yet. Request access and we&apos;ll verify you with the association.
          </p>
          <textarea
            className={`${inputCls} mt-4 min-h-[80px]`}
            placeholder={`Your role at ${name} (e.g. "Events secretary — you can confirm with our president")`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
          />
          <button onClick={send} disabled={state === 'sending'} className="btn-primary mt-4 w-full py-2.5 text-sm disabled:opacity-50">
            {state === 'sending' ? 'Sending…' : 'Request manager access'}
          </button>
        </>
      )}
    </div>
  );
}

function ChangeRequestButton({ slug, eventTitle, kind }: { slug: string; eventTitle: string; kind: 'edit' | 'remove' }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const send = async () => {
    setState('sending');
    try {
      const res = await fetch('/api/association-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-request', slug, eventTitle, kind, message }),
      });
      if (res.ok) setState('sent');
      else setState('idle');
    } catch {
      setState('idle');
    }
  };

  if (state === 'sent') {
    return <span className="text-[11px] font-bold text-emerald-600">Request sent ✓</span>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-500 transition hover:bg-slate-50"
      >
        {kind === 'edit' ? <Pencil className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
        {kind === 'edit' ? 'Request edit' : 'Request removal'}
      </button>
    );
  }

  return (
    <span className="flex w-full items-center gap-2">
      <input
        className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400"
        placeholder={kind === 'edit' ? 'What should change?' : 'Why remove it?'}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={1000}
        autoFocus
      />
      <button
        onClick={send}
        disabled={!message.trim() || state === 'sending'}
        className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50"
      >
        {state === 'sending' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
        Send
      </button>
    </span>
  );
}

function EventEditor({ slug, event }: { slug: string; event: LiveEvent }) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState({
    title: event.title,
    startDate: event.date,
    endDate: event.endDate ?? '',
    city: event.city,
    country: event.country,
    region: event.region,
    category: event.category,
    description: event.description,
    website: event.website,
  });
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setState('saving');
    setError('');
    try {
      const res = await fetch('/api/association-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-event', slug, eventId: event.id, fields: { ...fields, endDate: fields.endDate || '' } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Could not save');
      setState('saved');
      setTimeout(() => {
        setState('idle');
        setOpen(false);
        window.location.reload();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
      setState('idle');
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-blue-500"
      >
        <Pencil className="h-3 w-3" /> Edit
      </button>
    );
  }

  return (
    <div className="mt-3 w-full rounded-xl border border-blue-100 bg-blue-50/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Title</label>
          <input className={inputCls} value={fields.title} onChange={set('title')} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Start date</label>
          <input type="date" className={inputCls} value={fields.startDate} onChange={set('startDate')} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">End date</label>
          <input type="date" className={inputCls} value={fields.endDate} onChange={set('endDate')} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">City</label>
          <input className={inputCls} value={fields.city} onChange={set('city')} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Country</label>
          <input className={inputCls} value={fields.country} onChange={set('country')} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Region</label>
          <select className={inputCls} value={fields.region} onChange={set('region')}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Type</label>
          <select className={inputCls} value={fields.category} onChange={set('category')}>
            {[...new Set([fields.category, ...CATEGORIES])].filter(Boolean).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Event website</label>
          <input className={inputCls} value={fields.website} onChange={set('website')} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Description</label>
          <textarea className={`${inputCls} min-h-[90px]`} value={fields.description} onChange={set('description')} />
        </div>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={save}
          disabled={state === 'saving'}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {state === 'saving' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : state === 'saved' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          {state === 'saved' ? 'Saved — updating everywhere' : 'Save changes'}
        </button>
        <button onClick={() => setOpen(false)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50">
          Cancel
        </button>
        <p className="ml-auto text-[11px] text-slate-400">Changes go live immediately — the IE team is notified.</p>
      </div>
    </div>
  );
}

function BadgeSnippetButton({ eventSlug, rated }: { eventSlug: string; rated: boolean }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<a href="https://www.investigatorevents.com/events/${eventSlug}" target="_blank" rel="noopener"><img src="https://www.investigatorevents.com/api/badge/${eventSlug}" alt="${rated ? 'Rated by investigators on' : 'Listed on'} Investigator Events" height="52" style="height:52px"></a>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={copy}
      title="Copy the badge embed code for your event website"
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
        copied ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
      }`}
    >
      {copied ? <CheckCircle2 className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
      {copied ? 'Copied' : rated ? 'Rating badge' : 'Badge'}
    </button>
  );
}

export function AssociationConsole({
  slug,
  name,
  logoUrl,
  liveEvents,
  pendingSubmissions,
  stats,
}: {
  slug: string;
  name: string;
  logoUrl: string | null;
  liveEvents: LiveEvent[];
  pendingSubmissions: PendingSubmission[];
  stats: ConsoleStats;
}) {
  const [showForm, setShowForm] = useState(liveEvents.length === 0 && pendingSubmissions.length === 0);
  const [fields, setFields] = useState({
    eventName: '',
    startDate: '',
    endDate: '',
    city: '',
    country: '',
    region: '',
    category: 'Conference',
    website: '',
    notes: '',
  });
  const [pending, setPending] = useState<PendingSubmission[]>(pendingSubmissions);
  const [state, setState] = useState<'idle' | 'sending'>('idle');
  const [error, setError] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/association-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit-event', slug, fields }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Could not submit');
      setPending((p) => [
        {
          id: `local-${Date.now()}`,
          event_name: fields.eventName,
          start_date: fields.startDate,
          end_date: fields.endDate || null,
          city: fields.city,
          country: fields.country,
          created_at: new Date().toISOString(),
        },
        ...p,
      ]);
      setFields({ eventName: '', startDate: '', endDate: '', city: '', country: '', region: '', category: 'Conference', website: '', notes: '' });
      setJustSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    } finally {
      setState('idle');
    }
  };

  const canSubmit = fields.eventName && fields.startDate && fields.city && fields.country && fields.region && fields.website;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-14 w-14 rounded-2xl border border-slate-200 object-contain" />
        ) : null}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">Event console</p>
          <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
          <p className="text-sm text-slate-500">
            Add an event once — after Investigator Events verifies it, it appears on your website widget, the
            global calendar, and every member&apos;s subscribed calendar automatically.
          </p>
        </div>
      </div>

      {/* The numbers */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 text-center shadow-sm">
          <Calendar className="mx-auto h-4 w-4 text-blue-500" />
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900">{stats.upcoming}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Upcoming events</p>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 text-center shadow-sm">
          <Users className="mx-auto h-4 w-4 text-purple-500" />
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900">{stats.members}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Your members on IE</p>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900">{stats.totalGoing}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">RSVPs across events</p>
        </div>
      </div>

      {/* Everything the association gets, one row */}
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`/associations/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <Globe className="h-3.5 w-3.5 text-blue-500" /> Your public page
        </a>
        <a
          href={`/embed/upcoming?association=${encodeURIComponent(slug)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <LayoutPanelTop className="h-3.5 w-3.5 text-purple-500" /> Your website widget
        </a>
        <a
          href={`webcal://www.investigatorevents.com/api/ics?association=${encodeURIComponent(slug)}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <CalendarPlus className="h-3.5 w-3.5 text-emerald-500" /> Your calendar feed
        </a>
      </div>

      {justSubmitted && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Submitted — it goes live everywhere as soon as the Investigator Events team verifies it (usually same day).
        </div>
      )}

      {/* Add event */}
      <div className="mt-8 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Add an event</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs">
              <Plus className="h-3.5 w-3.5" /> New event
            </button>
          )}
        </div>

        {showForm && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Event name</label>
              <input className={inputCls} value={fields.eventName} onChange={set('eventName')} placeholder="e.g. Annual Conference 2027" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Start date</label>
              <input type="date" className={inputCls} value={fields.startDate} onChange={set('startDate')} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">End date (optional)</label>
              <input type="date" className={inputCls} value={fields.endDate} onChange={set('endDate')} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">City</label>
              <input className={inputCls} value={fields.city} onChange={set('city')} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Country</label>
              <input className={inputCls} value={fields.country} onChange={set('country')} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Region</label>
              <select className={inputCls} value={fields.region} onChange={set('region')}>
                <option value="">Select region…</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</label>
              <select className={inputCls} value={fields.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Event website</label>
              <input className={inputCls} value={fields.website} onChange={set('website')} placeholder="https://…" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Anything else (optional)</label>
              <textarea className={`${inputCls} min-h-[70px]`} value={fields.notes} onChange={set('notes')} placeholder="Description, speakers, pricing — we'll use it on the event page." />
            </div>
            {error && <p className="text-sm font-medium text-rose-600 sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2">
              <button onClick={submit} disabled={!canSubmit || state === 'sending'} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-50">
                {state === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit for verification
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-bold text-slate-900">In review</h2>
          <div className="mt-3 space-y-2">
            {pending.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-amber-200/70 bg-amber-50/50 px-4 py-3">
                <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{s.event_name}</p>
                  <p className="text-xs text-slate-500">
                    {formatRange(s.start_date, s.end_date)} · {s.city}, {s.country}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  awaiting verification
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live events */}
      <div className="mt-6">
        <h2 className="text-base font-bold text-slate-900">Your events on Investigator Events</h2>
        <div className="mt-3 space-y-2">
          {liveEvents.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
              Nothing listed yet — add your first event above.
            </p>
          ) : (
            liveEvents.map((e) => (
              <div key={e.id} className={`rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm ${e.upcoming ? '' : 'opacity-60'}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{e.title}</p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatRange(e.date, e.endDate)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {e.city}, {e.country}
                      </span>
                      {e.going > 0 && (
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-600">
                          <Users className="h-3 w-3" /> {e.going} going
                        </span>
                      )}
                      {e.rating !== null && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {e.rating.toFixed(1)} ({e.reviewCount})
                        </span>
                      )}
                      {!e.upcoming && <span className="font-semibold text-slate-400">past</span>}
                    </p>
                  </div>
                  <a
                    href={`/events/${e.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-blue-600 transition hover:bg-blue-50"
                  >
                    <ExternalLink className="h-3 w-3" /> View
                  </a>
                  <EventEditor slug={slug} event={e} />
                  <ChangeRequestButton slug={slug} eventTitle={e.title} kind="remove" />
                  <BadgeSnippetButton eventSlug={e.slug} rated={e.rating !== null} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Need your events on your own website too? The free widget shows exactly this list, always up to date —{' '}
        <a href="/widget" className="font-semibold text-blue-600 hover:underline">
          get the embed code
        </a>
        .
      </p>
    </div>
  );
}
