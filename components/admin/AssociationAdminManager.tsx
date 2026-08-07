'use client';

// Grant/revoke association-console access: which IE users can manage which
// association's events. Lives in the admin Verification tab.

import { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Trash2, UserPlus } from 'lucide-react';

interface AdminRow {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  association_pages: { name: string; slug: string } | null;
  profile: { full_name: string | null; username: string | null } | null;
}

export function AssociationAdminManager({ associations }: { associations: { id: string; name: string }[] }) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [pageId, setPageId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/association-admins');
    if (res.ok) setRows((await res.json()).admins);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const grant = async () => {
    setBusy(true);
    setError('');
    setOk('');
    try {
      const res = await fetch('/api/admin/association-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, associationPageId: pageId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setOk(`${email} can now manage their association's events.`);
      setEmail('');
      setPageId('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (id: string) => {
    if (!window.confirm('Revoke this manager’s console access?')) return;
    await fetch('/api/admin/association-admins', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <ShieldCheck className="h-5 w-5 text-blue-600" /> Association managers
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Managers get the console at <span className="font-mono text-xs">/associations/&lt;slug&gt;/manage</span> — they
        add their own events (which land in Submissions for your verification) and request edits/removals.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          placeholder="User's account email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400"
          value={pageId}
          onChange={(e) => setPageId(e.target.value)}
        >
          <option value="">Choose association…</option>
          {associations.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <button
          onClick={grant}
          disabled={busy || !email.includes('@') || !pageId}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
          Grant access
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
      {ok && <p className="mt-2 text-sm font-medium text-emerald-600">{ok}</p>}

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="flex items-center gap-2 py-4 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
            No association managers yet.
          </p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3 rounded-xl border border-slate-200/60 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {row.profile?.full_name ?? row.profile?.username ?? row.user_id.slice(0, 8)}
                </p>
                <p className="text-xs text-slate-500">
                  manages <span className="font-semibold">{row.association_pages?.name ?? 'unknown association'}</span>
                  {row.association_pages?.slug && (
                    <>
                      {' · '}
                      <a
                        href={`/associations/${row.association_pages.slug}/manage`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        open console
                      </a>
                    </>
                  )}
                </p>
              </div>
              <button onClick={() => revoke(row.id)} className="rounded-full p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
