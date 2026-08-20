'use client';

import { useState } from 'react';

/** Copy-ready boilerplate block with a one-click copy button, for the press page. */
export default function PressCopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. non-secure context) — text stays selectable.
    }
  }

  return (
    <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-500">{label}</p>
        <button
          type="button"
          onClick={copy}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition ${
            copied
              ? 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200'
              : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-200/70'
          }`}
        >
          {copied ? (
            <>
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M7 3a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2H7z" />
                <path d="M5 7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-1H7a2 2 0 01-2-2V7z" opacity="0.5" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <p className="mt-4 select-all text-[15px] leading-[1.75] text-slate-700">{text}</p>
    </div>
  );
}
