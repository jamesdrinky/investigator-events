'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { AssociationDirectoryItem } from '@/lib/data/associations';

interface AssociationsDirectoryProps {
  associations: AssociationDirectoryItem[];
  stats: {
    associationCount: number;
    countryCount: number;
    regionCount: number;
    liveCoverageAssociations: number;
  };
}

/* ── Dominant color per association slug (from logo analysis) ── */
const GLOW_COLORS: Record<string, string> = {
  'oedv':                          '99,102,241',   // indigo
  'eurodet':                       '34,197,94',    // green
  'ckds':                          '59,130,246',   // blue
  'fdde':                          '239,68,68',    // red
  'detective-association-of-finland': '59,130,246', // blue
  'syl':                           '168,85,247',   // purple
  'snarp':                         '59,130,246',   // blue
  'budeg':                         '37,99,235',    // deep blue
  'hungarian-detective-association': '234,179,8',   // gold
  'ibpi':                          '37,99,235',    // blue
  'federpol':                      '220,38,38',    // red
  'biznesa-drosiba':               '14,165,233',   // sky
  'nfes':                          '37,99,235',    // blue
  'psld':                          '220,38,38',    // red
  'lideppe':                       '139,92,246',   // violet
  'andr':                          '37,99,235',    // blue
  'pdpr':                          '220,38,38',    // red
  'ard':                           '59,130,246',   // blue
  'sad':                           '37,99,235',    // blue
  'dzrs':                          '34,197,94',    // green
};

const DEFAULT_GLOW = '99,102,241'; // indigo fallback

function getInitials(label: string) {
  const words = label.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}

function getGlow(slug: string) {
  return GLOW_COLORS[slug] ?? DEFAULT_GLOW;
}

export function AssociationsDirectory({ associations }: AssociationsDirectoryProps) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All');
  const [country, setCountry] = useState('All');

  const regions = useMemo(() => Array.from(new Set(associations.map((a) => a.region))), [associations]);
  const countries = useMemo(
    () => Array.from(new Set(associations.map((a) => a.country))).sort((a, b) => a.localeCompare(b)),
    [associations],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return associations
      .filter((a) => {
        const matchQ = q.length === 0 || a.name.toLowerCase().includes(q) || a.shortName.toLowerCase().includes(q) || a.country.toLowerCase().includes(q);
        const matchR = region === 'All' || a.region === region;
        const matchC = country === 'All' || a.country === country;
        return matchQ && matchR && matchC;
      })
      .sort((a, b) => b.eventCount - a.eventCount || a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
  }, [associations, country, query, region]);

  return (
    <div className="space-y-8">
      {/* ── Search / Filters ── */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-3 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.06)] sm:p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search association or country..."
            className="h-11 rounded-xl border border-slate-200/80 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white"
          />
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="h-11 rounded-xl border border-slate-200/80 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white">
            <option value="All">All regions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-11 rounded-xl border border-slate-200/80 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white">
            <option value="All">All countries</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* ── Association Cards Grid — glassmorphism glow cards ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((association) => {
            const glow = getGlow(association.slug);

            return (
              <div key={association.slug} className="group relative">
                {/* Bottom glow — color matched to logo */}
                <div
                  className="pointer-events-none absolute inset-x-4 -bottom-3 h-10 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-60"
                  style={{
                    background: `rgba(${glow},0.5)`,
                    boxShadow: `0 16px 48px 0 rgba(${glow},0.45)`,
                    filter: 'blur(16px)',
                  }}
                />

                <Link
                  href={association.hasPage ? `/associations/${association.slug}` : `/calendar?association=${encodeURIComponent(association.calendarAssociation)}`}
                  className="relative flex h-full flex-col items-center overflow-hidden rounded-xl border border-slate-200/60 bg-white p-4 text-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 sm:rounded-2xl sm:p-6"
                  style={{
                    boxShadow: '0 4px 16px -8px rgba(15,23,42,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 50px -12px rgba(${glow},0.2)`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px -8px rgba(15,23,42,0.06)';
                  }}
                >
                  {/* Top accent line — color matched */}
                  <div
                    className="absolute inset-x-0 top-0 h-[2px] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                    style={{ background: `rgba(${glow},0.6)` }}
                  />

                  {/* Logo */}
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-xl p-3 transition-colors duration-300 sm:h-24 sm:w-24 sm:rounded-2xl"
                    style={{ backgroundColor: `rgba(${glow},0.06)` }}
                  >
                    {association.logoSrc ? (
                      <Image
                        src={association.logoSrc}
                        alt={`${association.name} logo`}
                        width={96}
                        height={96}
                        className={`h-auto max-h-16 w-auto max-w-16 object-contain ${association.shortName === 'ABI' ? 'brightness-0' : ''}`}
                      />
                    ) : (
                      <span className="text-base font-bold uppercase tracking-[0.14em] text-slate-400">
                        {getInitials(association.shortName)}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="mt-4 text-sm font-bold leading-tight text-slate-950 line-clamp-2">
                    {association.name}
                  </h3>

                  {/* Tags */}
                  <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                    <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-medium text-slate-500">{association.country}</span>
                    <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-medium text-slate-500">{association.region}</span>
                  </div>

                  {/* Event count */}
                  {association.eventCount > 0 && (
                    <span
                      className="mt-3 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
                      style={{
                        backgroundColor: `rgba(${glow},0.1)`,
                        color: `rgba(${glow},1)`,
                      }}
                    >
                      {association.eventCount} {association.eventCount === 1 ? 'event' : 'events'}
                    </span>
                  )}

                  {/* CTA — pushed to bottom */}
                  <p
                    className="mt-auto pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300"
                    style={{ color: `rgba(${glow},0.5)` }}
                  >
                    <span className="group-hover:hidden">View events &rarr;</span>
                    <span
                      className="hidden group-hover:inline"
                      style={{ color: `rgba(${glow},0.9)` }}
                    >
                      View events &rarr;
                    </span>
                  </p>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600">
          No associations match this search. Try a broader region, a different country, or clear the search.
        </div>
      )}
    </div>
  );
}
