'use client';

import { useState } from 'react';

interface SampleReport {
  ok: boolean;
  sent: number;
  failed: number;
  samples: { tier: string; name: string | null; email: string | null; completion: number }[];
  errors: { recipient: string; tier: string; error: string }[];
}

export function ReengageSampleSender() {
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<SampleReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setReport(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/reengagement/sample', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) setError(data?.error ?? `HTTP ${res.status}`);
      else setReport(data as SampleReport);
    } catch (e: any) {
      setError(e?.message ?? 'Network error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-5">
      <p className="text-sm font-bold text-slate-900">Send sample emails for review</p>
      <p className="mt-1 text-sm text-slate-500">
        Sends 3 random samples per tier (A, B, C) to <strong>james@drinky.com</strong> and <strong>m.lacorte@conflictinternational.com</strong>. Each email has a sample banner showing the recipient + tier + completion score. The actual recipients are <em>not</em> emailed — they already got their own copy.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {busy ? 'Sending samples…' : 'Send samples to me + Mike'}
      </button>
      {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {report && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <p className="font-semibold">Samples sent</p>
          <p className="mt-1">Delivered {report.sent} · Failed {report.failed}</p>
          {report.samples.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs">
              {report.samples.map((s, i) => (
                <li key={i}>
                  Tier {s.tier} — {s.name ?? '(no name)'} ({s.completion}%)
                </li>
              ))}
            </ul>
          )}
          {report.errors.length > 0 && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer font-semibold">Errors ({report.errors.length})</summary>
              <ul className="mt-1 space-y-1">
                {report.errors.map((e, i) => (
                  <li key={i}>{e.recipient} (Tier {e.tier}): {e.error}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
