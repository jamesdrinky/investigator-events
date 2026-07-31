'use client';

import { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface CountryOption {
  slug: string;
  name: string;
  upcoming: number;
}

export function WidgetBuilder({ countries }: { countries: CountryOption[] }) {
  const [country, setCountry] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [limit, setLimit] = useState(5);
  const [copied, setCopied] = useState(false);

  const src = useMemo(() => {
    const params = new URLSearchParams();
    if (country) params.set('country', country);
    if (theme === 'dark') params.set('theme', 'dark');
    if (limit !== 5) params.set('limit', String(limit));
    const qs = params.toString();
    return `https://www.investigatorevents.com/embed/upcoming${qs ? `?${qs}` : ''}`;
  }, [country, theme, limit]);

  // Rough height: ~86px per event row + powered-by footer.
  const height = limit * 86 + 40;
  const snippet = `<iframe src="${src}" width="100%" height="${height}" frameborder="0" style="border:0;border-radius:12px;" title="Upcoming investigator events"></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      trackEvent('widget_snippet_copied', { country: country || 'global', theme });
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* manual selection still works */
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">1 · Configure</h2>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Filter by country <span className="font-normal normal-case">(optional)</span>
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          >
            <option value="">All countries (global)</option>
            {countries.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.upcoming} upcoming)
              </option>
            ))}
          </select>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Theme</label>
              <div className="mt-1.5 flex gap-2">
                {(['light', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition ${
                      theme === t
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Events shown</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              >
                {[3, 5, 8, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">2 · Copy the code onto your site</h2>
            <button
              onClick={copy}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-700'
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-slate-950 px-4 py-3 text-[12px] leading-relaxed text-slate-200">
            {snippet}
          </pre>
          <p className="mt-3 text-xs text-slate-500">
            Works on any website — WordPress, Squarespace, Wix, custom builds. The list updates
            itself; you never touch it again.
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Live preview</p>
        <div className={`overflow-hidden rounded-2xl border shadow-sm ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <iframe key={src} src={src} width="100%" height={height} style={{ border: 0 }} title="Upcoming investigator events" />
        </div>
      </div>
    </div>
  );
}
