'use client';

import { useMemo, useState, useTransition } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { saveAssociationRelationshipAction } from '@/app/admin/actions';
import type { AssociationDossier, RelationshipLevel } from '@/lib/data/association-relationships';

const LEVELS: { id: RelationshipLevel; label: string; hint: string; on: string }[] = [
  { id: 'close', label: 'Close',  hint: 'You know them well — a short personal note',        on: 'bg-emerald-100 text-emerald-800 border-emerald-400' },
  { id: 'known', label: 'Known',  hint: 'Met before — a warm reminder of the connection',    on: 'bg-amber-100 text-amber-800 border-amber-400' },
  { id: 'cold',  label: 'Cold',   hint: 'No relationship — needs the full introduction',     on: 'bg-slate-200 text-slate-700 border-slate-400' },
  { id: 'skip',  label: 'Skip',   hint: "Don't contact",                                     on: 'bg-rose-100 text-rose-800 border-rose-400' },
];

type Row = {
  level: RelationshipLevel | null;
  contactName: string;
  contactEmail: string;
  note: string;
  status: 'idle' | 'saving' | 'saved' | 'error';
  error?: string;
};

export function AssociationRelationships({ dossiers }: { dossiers: AssociationDossier[] }) {
  const [rows, setRows] = useState<Record<string, Row>>(() => {
    const initial: Record<string, Row> = {};
    for (const d of dossiers) {
      initial[d.code] = {
        level: d.relationship?.level ?? null,
        contactName: d.relationship?.contactName ?? '',
        contactEmail: d.relationship?.contactEmail ?? d.pageEmail ?? '',
        note: d.relationship?.note ?? '',
        status: 'idle',
      };
    }
    return initial;
  });
  const [filter, setFilter] = useState<'all' | 'events' | 'todo'>('all');
  const [, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c: Record<string, number> = { close: 0, known: 0, cold: 0, skip: 0, todo: 0 };
    for (const d of dossiers) {
      const lvl = rows[d.code]?.level;
      if (lvl) c[lvl] += 1; else c.todo += 1;
    }
    return c;
  }, [rows, dossiers]);

  const visible = dossiers.filter((d) => {
    if (filter === 'events') return d.events.length > 0;
    if (filter === 'todo') return !rows[d.code]?.level;
    return true;
  });

  function persist(d: AssociationDossier, next: Row) {
    setRows((prev) => ({ ...prev, [d.code]: { ...next, status: 'saving' } }));
    startTransition(async () => {
      const result = await saveAssociationRelationshipAction({
        associationCode: d.code,
        associationName: d.name,
        level: next.level,
        contactName: next.contactName,
        contactEmail: next.contactEmail,
        note: next.note,
      });
      setRows((prev) => ({
        ...prev,
        [d.code]: result.ok
          ? { ...next, status: 'saved' }
          : { ...next, status: 'error', error: result.error },
      }));
    });
  }

  const update = (code: string, patch: Partial<Row>) =>
    setRows((prev) => ({ ...prev, [code]: { ...prev[code], ...patch, status: 'idle' } }));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900">Association relationships</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Mark how well we know each association. Outreach is written differently for each level — a note to
          someone Mike knows well shouldn&apos;t read like a cold approach. Fill in a contact where we don&apos;t
          have one; each row saves on its own as you go.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {LEVELS.map((l) => (
            <span key={l.id} className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${l.on}`}>
              {l.label} {counts[l.id]}
            </span>
          ))}
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {counts.todo} left
          </span>
          <span className="flex-1" />
          {([['all', `All ${dossiers.length}`], ['events', 'Has event'], ['todo', 'Unrated']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === id ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.map((d) => {
        const row = rows[d.code];
        const active = LEVELS.find((l) => l.id === row?.level);
        return (
          <div
            key={d.code}
            className="rounded-2xl border border-slate-200 bg-white p-5"
            style={active ? { boxShadow: 'inset 3px 0 0 currentColor' } : undefined}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-bold text-slate-900">{d.name}</span>
              {d.code !== d.name && <span className="font-mono text-xs text-slate-400">{d.code}</span>}
              {d.country && <span className="text-xs text-slate-400">{d.country}</span>}
              {d.events.length > 0 && (
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                  {d.events.length} upcoming
                </span>
              )}
              {d.hasVideo && <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[11px] font-semibold text-purple-700">has video</span>}
              {d.timesContacted > 0 && (
                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                  contacted {d.timesContacted}×
                </span>
              )}
              {d.memberCount > 0 && <span className="text-xs text-slate-400">{d.memberCount} members</span>}
            </div>

            <div className="mt-2 space-y-0.5 text-sm text-slate-600">
              {d.events[0] && (
                <p>
                  Next: <span className="font-medium text-slate-800">{d.events[0].title}</span>
                  {' — '}{d.events[0].date}{d.events[0].city ? `, ${d.events[0].city}` : ''}
                </p>
              )}
              {d.seniorMembers.length > 0 && (
                <p>
                  On the platform:{' '}
                  {d.seniorMembers.map((m, i) => (
                    <span key={m.name}>
                      {i > 0 && ', '}
                      <span className="font-medium text-slate-800">{m.name}</span>
                      {m.role ? ` — ${m.role}` : ''}
                    </span>
                  ))}
                </p>
              )}
              {d.organisers.length > 0 && (
                <p>Event organiser: <span className="font-medium text-slate-800">{d.organisers.join(', ')}</span></p>
              )}
              {!d.events.length && !d.seniorMembers.length && !d.organisers.length && (
                <p className="text-slate-400">Nothing on file beyond the association page.</p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {LEVELS.map((l) => {
                const on = row?.level === l.id;
                return (
                  <button
                    key={l.id}
                    title={l.hint}
                    onClick={() => persist(d, { ...row, level: on ? null : l.id })}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      on ? l.on : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {l.label}
                  </button>
                );
              })}
              <span className="flex-1" />
              <span className="flex items-center gap-1.5 text-xs">
                {row?.status === 'saving' && <><Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" /><span className="text-slate-400">Saving…</span></>}
                {row?.status === 'saved' && <><Check className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-600">Saved</span></>}
                {row?.status === 'error' && <><AlertCircle className="h-3.5 w-3.5 text-rose-600" /><span className="text-rose-600">{row.error}</span></>}
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <Field
                label="Who to write to"
                value={row?.contactName ?? ''}
                placeholder={d.seniorMembers[0]?.name ?? d.organisers[0] ?? 'Name'}
                onChange={(v) => update(d.code, { contactName: v })}
                onBlur={() => persist(d, rows[d.code])}
              />
              <Field
                label={d.pageEmail ? 'Email' : 'Email — none on file'}
                value={row?.contactEmail ?? ''}
                placeholder="name@association.org"
                onChange={(v) => update(d.code, { contactEmail: v })}
                onBlur={() => persist(d, rows[d.code])}
              />
              <Field
                label="Note for James"
                value={row?.note ?? ''}
                placeholder="Anything that changes the approach"
                onChange={(v) => update(d.code, { note: v })}
                onBlur={() => persist(d, rows[d.code])}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value, placeholder, onChange, onBlur }: {
  label: string; value: string; placeholder: string;
  onChange: (v: string) => void; onBlur: () => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white"
      />
    </div>
  );
}
