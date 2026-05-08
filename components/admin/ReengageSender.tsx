'use client';

import { useState } from 'react';

interface SendReport {
  ok: boolean;
  dryRun: boolean;
  totals: {
    considered: number;
    sent: number;
    skippedAlreadySent: number;
    skippedNoEmail: number;
    skippedNotSubscribed: number;
    failed: number;
  };
  failures: { userId: string; error: string }[];
}

export function ReengageSender({ totalUsers }: { totalUsers: number }) {
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<SendReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (dryRun: boolean) => {
    if (!dryRun) {
      const ok = window.confirm(`Send the re-engagement email to ${totalUsers} users?\n\nUsers who already received this campaign will be skipped automatically.`);
      if (!ok) return;
    }
    setBusy(true);
    setReport(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/reengagement/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? `HTTP ${res.status}`);
      } else {
        setReport(data as SendReport);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Network error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-5">
      <p className="text-sm font-bold text-slate-900">Send re-engagement campaign</p>
      <p className="mt-1 text-sm text-slate-500">
        Sends a personalised email <strong>only to users who opted into the newsletter</strong> (GDPR). Variant chosen per user from profile completion (3 tiers) × LinkedIn-verified state. Already-sent users are skipped — running again is safe. Every email includes a one-click unsubscribe link and List-Unsubscribe headers.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run(true)}
          disabled={busy}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {busy ? 'Working…' : 'Dry run (no email sent)'}
        </button>
        <button
          type="button"
          onClick={() => run(false)}
          disabled={busy}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? 'Sending…' : `Send to all (${totalUsers})`}
        </button>
      </div>
      {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {report && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <p className="font-semibold">{report.dryRun ? 'Dry run complete' : 'Send complete'}</p>
          <p className="mt-1">
            Considered {report.totals.considered} · Sent {report.totals.sent} · Already had it {report.totals.skippedAlreadySent} · Not opted-in (skipped) {report.totals.skippedNotSubscribed} · No email {report.totals.skippedNoEmail} · Failed {report.totals.failed}
          </p>
          {report.failures.length > 0 && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer font-semibold">Show failures ({report.failures.length})</summary>
              <ul className="mt-1 space-y-1">
                {report.failures.map((f) => (
                  <li key={f.userId}>
                    <span className="font-mono text-[11px]">{f.userId.slice(0, 8)}</span>: {f.error}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
