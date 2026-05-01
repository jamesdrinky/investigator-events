'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Copy, Trash2, Check, RefreshCw } from 'lucide-react';

interface AssociationPage {
  id: string;
  name: string;
  slug: string;
}

interface VerificationCode {
  id: string;
  code: string;
  is_active: boolean;
  expires_at: string;
  usage_count: number;
  created_at: string;
  association_name: string;
  association_slug: string;
  association_page_id: string;
}

export function VerificationCodeManager({ associations }: { associations: AssociationPage[] }) {
  const [codes, setCodes] = useState<VerificationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verification-codes');
      if (res.ok) {
        const data = await res.json();
        setCodes(data.codes ?? []);
      }
    } catch {
      // Network error — codes stay empty
    }
    setLoading(false);
  };

  useEffect(() => { loadCodes(); }, []);

  const generateCode = async (associationPageId: string) => {
    setGenerating(associationPageId);
    const res = await fetch('/api/admin/verification-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ association_page_id: associationPageId }),
    });
    if (res.ok) {
      await loadCodes();
    }
    setGenerating(null);
  };

  const deactivateCode = async (codeId: string) => {
    const res = await fetch('/api/admin/verification-codes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code_id: codeId }),
    });
    if (res.ok) await loadCodes();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeCodes = codes.filter((c) => c.is_active);
  const inactiveCodes = codes.filter((c) => !c.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Association Verification Codes
          </h2>
          <p className="text-sm text-slate-500">Generate codes for associations to share with their members. One active code per association.</p>
        </div>
        <button onClick={loadCodes} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {/* Generate new code */}
      <div className="rounded-xl border border-blue-200/60 bg-blue-50/30 p-4">
        <h3 className="text-sm font-bold text-slate-900">Generate new code</h3>
        <p className="mt-1 text-xs text-slate-500">This will deactivate any existing active code for the selected association and create a new one valid for 12 months.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {associations.map((a) => {
            const hasActive = activeCodes.some((c) => c.association_page_id === a.id);
            return (
              <button
                key={a.id}
                onClick={() => generateCode(a.id)}
                disabled={generating === a.id}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  hasActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                } disabled:opacity-50`}
              >
                {generating === a.id ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : hasActive ? (
                  <RefreshCw className="h-3 w-3" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
                {a.name}
                {hasActive && <span className="text-[9px] font-normal opacity-60">(rotate)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active codes */}
      {loading ? (
        <div className="py-8 text-center text-sm text-slate-400">Loading codes...</div>
      ) : activeCodes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-400">
          No active verification codes. Generate one above.
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-700">Active codes</h3>
          {activeCodes.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/20 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{c.association_name}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Active</span>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <code className="rounded bg-white px-2 py-0.5 font-mono text-sm font-bold tracking-wider text-slate-900 border border-slate-200">{c.code}</code>
                  <button onClick={() => copyCode(c.code)} className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700">
                    {copied === c.code ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Expires: {new Date(c.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' '} · {c.usage_count} verification{c.usage_count !== 1 ? 's' : ''}
                </p>
              </div>
              <button onClick={() => deactivateCode(c.id)} className="flex-shrink-0 rounded-lg border border-red-200 p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600" title="Deactivate">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inactive codes history */}
      {inactiveCodes.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-slate-400 hover:text-slate-600">
            Previous codes ({inactiveCodes.length})
          </summary>
          <div className="mt-2 space-y-1">
            {inactiveCodes.slice(0, 10).map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
                <span className="font-medium text-slate-500">{c.association_name}</span>
                <code className="font-mono tracking-wider">{c.code}</code>
                <span>{c.usage_count} uses</span>
                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">Inactive</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
