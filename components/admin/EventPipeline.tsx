'use client';

// Admin "Pipeline" tab: manage monitored sources and review AI-drafted
// events before they go live. Approve publishes straight to the calendar.

import { useCallback, useEffect, useState } from 'react';
import { Check, Globe, Loader2, Plus, RefreshCw, Trash2, X } from 'lucide-react';

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

interface Source {
  id: string;
  name: string;
  url: string;
  association: string | null;
  country_hint: string | null;
  region_hint: string | null;
  active: boolean;
  last_scanned_at: string | null;
  last_status: string | null;
  last_error: string | null;
  drafts_found_total: number;
}

interface Draft {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  organiser: string | null;
  association: string | null;
  category: string | null;
  description: string | null;
  website: string | null;
  confidence: string | null;
  created_at: string;
  event_sources: { name: string } | null;
}

const inputCls =
  'w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20';

function DraftCard({ draft, onDone }: { draft: Draft; onDone: (id: string) => void }) {
  const [fields, setFields] = useState({
    title: draft.title ?? '',
    start_date: draft.start_date ?? '',
    end_date: draft.end_date ?? '',
    city: draft.city ?? '',
    region: draft.region ?? '',
    country: draft.country ?? '',
    organiser: draft.organiser ?? '',
    association: draft.association ?? '',
    category: draft.category ?? 'Conference',
    description: draft.description ?? '',
    website: draft.website ?? '',
  });
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const act = async (action: 'approve' | 'reject') => {
    setBusy(action);
    setError('');
    try {
      const res = await fetch('/api/admin/pipeline/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draft.id, action, fields: action === 'approve' ? { ...fields, end_date: fields.end_date || null } : undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      onDone(draft.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(null);
    }
  };

  const confidenceTone =
    draft.confidence === 'high'
      ? 'bg-emerald-100 text-emerald-700'
      : draft.confidence === 'medium'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-rose-100 text-rose-700';

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${confidenceTone}`}>
          {draft.confidence ?? 'unknown'} confidence
        </span>
        {draft.event_sources?.name && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            via {draft.event_sources.name}
          </span>
        )}
        <span className="ml-auto text-[11px] text-slate-400">
          found {new Date(draft.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Title</label>
          <input className={inputCls} value={fields.title} onChange={set('title')} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Start date</label>
          <input type="date" className={inputCls} value={fields.start_date} onChange={set('start_date')} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">End date</label>
          <input type="date" className={inputCls} value={fields.end_date} onChange={set('end_date')} />
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
            <option value="">Select region…</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Category</label>
          <select className={inputCls} value={fields.category} onChange={set('category')}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Organiser</label>
          <input className={inputCls} value={fields.organiser} onChange={set('organiser')} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Association</label>
          <input className={inputCls} value={fields.association} onChange={set('association')} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Website</label>
          <input className={inputCls} value={fields.website} onChange={set('website')} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Description</label>
          <textarea className={`${inputCls} min-h-[64px]`} value={fields.description} onChange={set('description')} />
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => act('approve')}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {busy === 'approve' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Approve &amp; publish
        </button>
        <button
          onClick={() => act('reject')}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {busy === 'reject' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          Reject
        </button>
        {fields.website && (
          <a
            href={fields.website}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            <Globe className="h-3.5 w-3.5" /> Check site
          </a>
        )}
      </div>
    </div>
  );
}

export function EventPipeline() {
  const [sources, setSources] = useState<Source[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [newSource, setNewSource] = useState({ name: '', url: '', association: '', countryHint: '', regionHint: '' });

  const load = useCallback(async () => {
    const [sourcesRes, draftsRes] = await Promise.all([
      fetch('/api/admin/pipeline/sources'),
      fetch('/api/admin/pipeline/drafts'),
    ]);
    if (sourcesRes.ok) setSources((await sourcesRes.json()).sources);
    if (draftsRes.ok) setDrafts((await draftsRes.json()).drafts);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addSource = async () => {
    setAdding(true);
    setAddError('');
    try {
      const res = await fetch('/api/admin/pipeline/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setNewSource({ name: '', url: '', association: '', countryHint: '', regionHint: '' });
      await load();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setAdding(false);
    }
  };

  const scanNow = async (id: string) => {
    setScanning(id);
    try {
      await fetch('/api/admin/pipeline/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await load();
    } finally {
      setScanning(null);
    }
  };

  const toggleActive = async (source: Source) => {
    await fetch('/api/admin/pipeline/sources', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: source.id, active: !source.active }),
    });
    await load();
  };

  const removeSource = async (id: string) => {
    if (!window.confirm('Remove this source? Its pending drafts stay in the queue.')) return;
    await fetch('/api/admin/pipeline/sources', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading pipeline…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Review queue */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Drafts awaiting review {drafts.length > 0 && <span className="text-blue-600">({drafts.length})</span>}
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Events the scanner found on monitored pages. Tidy the fields if needed, then approve to publish instantly.
        </p>
        <div className="mt-4 space-y-4">
          {drafts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
              Queue&apos;s clear — nothing waiting for review.
            </p>
          ) : (
            drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} onDone={(id) => setDrafts((d) => d.filter((x) => x.id !== id))} />
            ))
          )}
        </div>
      </div>

      {/* Sources */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Monitored sources</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Pages the scanner checks weekly (3 per night). Add association event pages, conference sites, anywhere events get announced.
        </p>

        <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input className={inputCls} placeholder="Name (e.g. WAD events page)" value={newSource.name} onChange={(e) => setNewSource((s) => ({ ...s, name: e.target.value }))} />
            <input className={inputCls} placeholder="https://…" value={newSource.url} onChange={(e) => setNewSource((s) => ({ ...s, url: e.target.value }))} />
            <input className={inputCls} placeholder="Association (optional)" value={newSource.association} onChange={(e) => setNewSource((s) => ({ ...s, association: e.target.value }))} />
            <input className={inputCls} placeholder="Country hint (optional)" value={newSource.countryHint} onChange={(e) => setNewSource((s) => ({ ...s, countryHint: e.target.value }))} />
            <select className={inputCls} value={newSource.regionHint} onChange={(e) => setNewSource((s) => ({ ...s, regionHint: e.target.value }))}>
              <option value="">Region hint (optional)</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {addError && <p className="mt-2 text-sm font-medium text-rose-600">{addError}</p>}
          <button
            onClick={addSource}
            disabled={adding || !newSource.name || !newSource.url}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add source
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {sources.map((source) => (
            <div key={source.id} className={`flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm ${source.active ? '' : 'opacity-55'}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{source.name}</p>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-blue-600 hover:underline">
                  {source.url}
                </a>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {source.last_scanned_at
                    ? `Last scan ${new Date(source.last_scanned_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — ${source.last_status}${source.last_error ? ` (${source.last_error})` : ''}`
                    : 'Not scanned yet'}
                  {' · '}
                  {source.drafts_found_total} draft{source.drafts_found_total === 1 ? '' : 's'} found
                </p>
              </div>
              <button
                onClick={() => scanNow(source.id)}
                disabled={scanning !== null}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {scanning === source.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Scan now
              </button>
              <button
                onClick={() => toggleActive(source)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                  source.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {source.active ? 'Active' : 'Paused'}
              </button>
              <button onClick={() => removeSource(source.id)} className="rounded-full p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {sources.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
              No sources yet — add the association pages you want watched.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
