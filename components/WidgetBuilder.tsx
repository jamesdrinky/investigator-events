'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Globe, Moon, Sun } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface CountryOption {
  slug: string;
  name: string;
  upcoming: number;
}

interface AssociationOption {
  key: string; // filter value passed to the embed
  name: string;
  upcoming: number;
}

const SWATCHES = [
  { name: 'Investigator Blue', hex: '2563eb' },
  { name: 'Navy', hex: '1e3a5f' },
  { name: 'Emerald', hex: '059669' },
  { name: 'Crimson', hex: 'dc2626' },
  { name: 'Royal Purple', hex: '7c3aed' },
  { name: 'Amber', hex: 'd97706' },
];

export function WidgetBuilder({
  countries,
  associations,
}: {
  countries: CountryOption[];
  associations: AssociationOption[];
}) {
  const [siteName, setSiteName] = useState('Your Association');
  const [assoc, setAssoc] = useState('');
  const [country, setCountry] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accent, setAccent] = useState('2563eb');
  const [limit, setLimit] = useState(4);
  const [copied, setCopied] = useState(false);

  const src = useMemo(() => {
    const params = new URLSearchParams();
    if (assoc) params.set('association', assoc);
    else if (country) params.set('country', country);
    if (theme === 'dark') params.set('theme', 'dark');
    if (accent.toLowerCase() !== '2563eb') params.set('accent', accent);
    if (limit !== 5) params.set('limit', String(limit));
    const qs = params.toString();
    return `https://www.investigatorevents.com/embed/upcoming${qs ? `?${qs}` : ''}`;
  }, [assoc, country, theme, accent, limit]);

  // ~98px per photo row + powered-by footer + body padding.
  const height = limit * 98 + 64;
  const snippet = `<iframe src="${src}" width="100%" height="${height}" frameborder="0" style="border:0;border-radius:16px;" title="Upcoming investigator events"></iframe>`;

  const fakeDomain =
    siteName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 24) || 'yourassociation';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      trackEvent('widget_snippet_copied', { filter: assoc || country || 'global', theme, accent });
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* manual selection still works */
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[380px,1fr]">
      {/* ── Controls ── */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Make it yours</p>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Your organisation&apos;s name
          </label>
          <input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            maxLength={40}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            placeholder="Your Association"
          />

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Show events from
          </label>
          <select
            value={assoc ? `a:${assoc}` : country ? `c:${country}` : ''}
            onChange={(e) => {
              const v = e.target.value;
              if (v.startsWith('a:')) {
                setAssoc(v.slice(2));
                setCountry('');
              } else if (v.startsWith('c:')) {
                setCountry(v.slice(2));
                setAssoc('');
              } else {
                setAssoc('');
                setCountry('');
              }
            }}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          >
            <option value="">🌍 All events (global)</option>
            <optgroup label="Just one association">
              {associations.map((a) => (
                <option key={a.key} value={`a:${a.key}`}>
                  {a.name} ({a.upcoming} upcoming)
                </option>
              ))}
            </optgroup>
            <optgroup label="Just one country">
              {countries.map((c) => (
                <option key={c.slug} value={`c:${c.slug}`}>
                  {c.name} ({c.upcoming} upcoming)
                </option>
              ))}
            </optgroup>
          </select>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Accent colour
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {SWATCHES.map((s) => (
              <button
                key={s.hex}
                onClick={() => setAccent(s.hex)}
                title={s.name}
                aria-label={s.name}
                className={`h-8 w-8 rounded-full transition hover:scale-110 ${
                  accent === s.hex ? 'ring-2 ring-slate-900 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: `#${s.hex}` }}
              />
            ))}
            <label
              className="relative flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              title="Pick any colour"
            >
              <span
                className="h-4 w-4 rounded-full border border-slate-200"
                style={{ backgroundColor: `#${accent}` }}
              />
              Custom
              <input
                type="color"
                value={`#${accent}`}
                onChange={(e) => setAccent(e.target.value.replace('#', ''))}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Theme</label>
              <div className="mt-1.5 flex gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    theme === 'light'
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" /> Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    theme === 'dark'
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" /> Dark
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Events</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              >
                {[3, 4, 5, 8, 10].map((n) => (
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
            <p className="text-sm font-bold text-slate-900">The code for your web person</p>
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
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-slate-950 px-4 py-3 text-[11.5px] leading-relaxed text-slate-200">
            {snippet}
          </pre>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            One paste on any platform — WordPress, Squarespace, Wix, custom. It updates itself
            forever. <span className="font-semibold text-slate-700">Prefer us to handle it?</span>{' '}
            Email{' '}
            <a href="mailto:info@investigatorevents.com" className="font-semibold text-blue-600 hover:underline">
              info@investigatorevents.com
            </a>{' '}
            with your web person&apos;s address and we&apos;ll sort everything with them directly.
          </p>
        </div>
      </div>

      {/* ── Live preview inside a mock browser ── */}
      <div className="min-w-0">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          <Globe className="h-3.5 w-3.5" /> Live preview — how it looks on your website
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-slate-400">
              https://www.{fakeDomain}.org/events
            </span>
          </div>
          {/* Their site */}
          <div style={{ backgroundColor: `#${accent}` }} className="flex items-center gap-5 px-5 py-3.5">
            <span className="truncate text-[15px] font-extrabold text-white">{siteName || 'Your Association'}</span>
            <span className="hidden text-xs font-medium text-white/70 sm:inline">About</span>
            <span className="hidden text-xs font-medium text-white/70 sm:inline">Members</span>
            <span className="text-xs font-semibold text-white">Events</span>
            <span className="hidden text-xs font-medium text-white/70 sm:inline">Contact</span>
          </div>
          <div className="flex flex-col gap-5 bg-white p-5 sm:flex-row">
            <div className="hidden flex-1 sm:block">
              <div className="mb-4 h-5 w-1/2 rounded-md bg-slate-200" />
              {[85, 70, 90, 60, 0, 75, 88, 55].map((w, i) =>
                w === 0 ? (
                  <div key={i} className="h-3" />
                ) : (
                  <div key={i} className="mb-2.5 h-3 rounded bg-slate-100" style={{ width: `${w}%` }} />
                )
              )}
            </div>
            <div className="w-full sm:w-[360px]">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest" style={{ color: `#${accent}` }}>
                Upcoming events
              </p>
              <iframe
                key={src}
                src={src}
                width="100%"
                height={height}
                style={{ border: 0, borderRadius: 16 }}
                title="Upcoming investigator events"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
