'use client';

import { useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const SWATCHES = [
  { name: 'Investigator Blue', hex: '2563eb' },
  { name: 'Navy', hex: '1e3a5f' },
  { name: 'Emerald', hex: '059669' },
  { name: 'Crimson', hex: 'dc2626' },
  { name: 'Royal Purple', hex: '7c3aed' },
  { name: 'Amber', hex: 'd97706' },
];

/**
 * The immersion moment of the partner pitch: the association restyles THEIR
 * calendar, on a mock of THEIR site, while looking at it. Nav + accents
 * follow the chosen colour so the whole mock feels like their brand.
 */
export function PartnerLiveDemo({
  shortName,
  fakeDomain,
  embedFilter,
  defaultAccent = '1e3a5f',
  eventCount = 4,
}: {
  shortName: string;
  fakeDomain: string;
  embedFilter: string;
  /** Detected from their logo server-side — the page loads already in their colour. */
  defaultAccent?: string;
  /** How many events the filter actually yields — sizes the frame to fit. */
  eventCount?: number;
}) {
  const [accent, setAccent] = useState(defaultAccent);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const limit = Math.min(4, Math.max(1, eventCount));
  const frameHeight = limit * 98 + 64;

  const src = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (theme === 'dark') params.set('theme', 'dark');
    if (accent !== '2563eb') params.set('accent', accent);
    return `/embed/upcoming?${embedFilter}&${params.toString()}`;
  }, [embedFilter, theme, accent, limit]);

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Try your colours:</span>
        <div className="flex items-center gap-2">
          {SWATCHES.map((s) => (
            <button
              key={s.hex}
              onClick={() => setAccent(s.hex)}
              title={s.name}
              aria-label={s.name}
              className={`h-7 w-7 rounded-full transition hover:scale-110 ${
                accent === s.hex ? 'ring-2 ring-slate-900 ring-offset-2' : ''
              }`}
              style={{ backgroundColor: `#${s.hex}` }}
            />
          ))}
          <label
            className="relative flex h-7 cursor-pointer items-center rounded-full border border-slate-300 px-2.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-100"
            title="Pick any colour"
          >
            <span className="mr-1 h-3.5 w-3.5 rounded-full border border-slate-300" style={{ backgroundColor: `#${accent}` }} />
            Any
            <input
              type="color"
              value={`#${accent}`}
              onChange={(e) => setAccent(e.target.value.replace('#', ''))}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-600 transition hover:bg-slate-100"
        >
          {theme === 'light' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </div>

      {/* Mock browser, tinted to their chosen colour */}
      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-slate-400">
            https://{fakeDomain}/events
          </span>
        </div>
        <div className="flex items-center gap-5 px-5 py-3.5 transition-colors duration-300" style={{ backgroundColor: `#${accent}` }}>
          <span className="truncate text-[15px] font-extrabold text-white">{shortName}</span>
          <span className="hidden text-xs font-medium text-white/70 sm:inline">About</span>
          <span className="hidden text-xs font-medium text-white/70 sm:inline">Members</span>
          <span className="text-xs font-semibold text-white underline decoration-white/50 underline-offset-4">Events</span>
          <span className="hidden text-xs font-medium text-white/70 sm:inline">Contact</span>
        </div>
        <div className={`p-5 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a1120]' : 'bg-white'}`}>
          <p
            className="mb-2 text-[11px] font-extrabold uppercase tracking-widest transition-colors duration-300"
            style={{ color: `#${accent}` }}
          >
            Upcoming events
          </p>
          <iframe
            key={src}
            src={src}
            width="100%"
            height={frameHeight}
            style={{ border: 0, borderRadius: 16 }}
            title={`Upcoming ${shortName} events`}
          />
        </div>
      </div>
    </div>
  );
}
