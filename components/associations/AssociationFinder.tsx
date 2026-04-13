'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Globe, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { AssociationMap } from './AssociationMap';

interface Association {
  slug: string;
  shortName: string;
  name: string;
  country: string;
  region: string;
  website: string;
  logoSrc?: string;
  hasPage: boolean;
}

const REGIONS = ['Europe', 'North America', 'Asia-Pacific', 'Middle East', 'Latin America', 'Africa'] as const;

// Country aliases so people can search common names
const COUNTRY_ALIASES: Record<string, string[]> = {
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Britain', 'Great Britain', 'UK', 'GB'],
  'United States': ['USA', 'US', 'America', 'California', 'Texas', 'Florida', 'New York', 'Illinois', 'Chicago', 'Los Angeles'],
  'Czech Republic': ['Czechia'],
  'Russian Federation': ['Russia'],
};

export function AssociationFinder({ associations }: { associations: Association[] }) {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [mapFlash, setMapFlash] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const countries = useMemo(() => {
    const set = new Set(associations.map((a) => a.country));
    return Array.from(set).sort();
  }, [associations]);

  // Map data — count associations per country
  const mapData = useMemo(() => {
    const counts = new Map<string, number>();
    associations.forEach((a) => {
      counts.set(a.country, (counts.get(a.country) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([country, count]) => ({ country, count }));
  }, [associations]);

  // International associations (those with "International" or "World" in region/name handling)
  const international = useMemo(() =>
    associations.filter((a) => ['wad', 'ikd', 'cii', 'intellenet'].includes(a.slug)),
    [associations]
  );

  const filtered = useMemo(() => {
    let list = associations.filter((a) => !['wad', 'ikd', 'cii', 'intellenet'].includes(a.slug));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => {
        // Direct match on country, name, shortName
        if (a.country.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.shortName.toLowerCase().includes(q)) return true;
        // Check country aliases
        const aliases = COUNTRY_ALIASES[a.country];
        if (aliases && aliases.some((alias) => alias.toLowerCase().includes(q))) return true;
        // Check region
        if (a.region.toLowerCase().includes(q)) return true;
        return false;
      });
    }
    if (selectedRegion) {
      list = list.filter((a) => a.region === selectedRegion);
    }
    return list;
  }, [associations, search, selectedRegion]);

  // Group by country
  const grouped = useMemo(() => {
    const map = new Map<string, Association[]>();
    filtered.forEach((a) => {
      const existing = map.get(a.country) ?? [];
      existing.push(a);
      map.set(a.country, existing);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div>
      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by country or association name..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedRegion(null)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
              !selectedRegion ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(selectedRegion === r ? null : r)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                selectedRegion === r ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive map */}
      <div className="mt-6">
        <AssociationMap
          associations={mapData}
          selectedRegion={selectedRegion}
          onCountryClick={(country) => {
            setSearch(country);
            setSelectedRegion(null);
            setMapFlash(true);
            setTimeout(() => setMapFlash(false), 1500);
            // Scroll to results
            setTimeout(() => {
              resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          selectedCountry={search && countries.includes(search) ? search : undefined}
        />
        <p className="mt-2 text-center text-[11px] text-slate-400">Click a highlighted country to see associations below</p>
      </div>

      {/* International associations — always show */}
      <div className="mt-8">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-violet-500" />
          <h3 className="text-base font-bold text-slate-950">International associations</h3>
          {search && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">Available everywhere</span>}
        </div>
        <p className="mt-1 text-sm text-slate-500">Open to investigators worldwide. The cross-border networks that make international investigations possible.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {international.map((a) => (
            <AssociationCard key={a.slug} association={a} />
          ))}
        </div>
      </div>

      {/* Regional results */}
      <div ref={resultsRef} className={`mt-10 scroll-mt-24 rounded-2xl transition-all duration-700 ${mapFlash ? 'ring-2 ring-blue-400 ring-offset-4 bg-blue-50/20' : ''}`}>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          <h3 className="text-base font-bold text-slate-950">
            {search ? `Results for "${search}"` : selectedRegion ? `${selectedRegion} associations` : 'All national and regional associations'}
          </h3>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {grouped.length} {grouped.length === 1 ? 'country' : 'countries'} · {filtered.length} associations
        </p>

        {grouped.length > 0 ? (
          <div className="mt-6 space-y-6">
            {grouped.map(([country, assocs]) => (
              <div key={country}>
                <h4 className="text-sm font-bold text-slate-700">{country}</h4>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {assocs.map((a) => (
                    <AssociationCard key={a.slug} association={a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-200/60 bg-slate-50 py-10 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-200" />
            <p className="mt-3 text-sm font-medium text-slate-400">No associations found for "{search}"</p>
            <p className="mt-1 text-xs text-slate-300">Try a different country or region. International associations above are open to all.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AssociationCard({ association: a }: { association: Association }) {
  return (
    <div className="group overflow-hidden rounded-[1.2rem] border border-slate-200/60 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3.5 p-4">
        {a.logoSrc ? (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white p-1.5">
            <Image src={a.logoSrc} alt={a.shortName} width={40} height={40} className="h-auto max-h-8 w-auto object-contain" />
          </div>
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 text-sm font-bold text-blue-400">
            {a.shortName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{a.name === a.shortName ? a.shortName : `${a.shortName} — ${a.name}`}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3" /> {a.country} · {a.region}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2.5">
        <Link
          href={a.hasPage ? `/associations/${a.slug}` : `/calendar?association=${encodeURIComponent(a.shortName)}`}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:gap-2"
        >
          {a.hasPage ? 'See our page' : 'View events'} <ArrowRight className="h-3 w-3" />
        </Link>
        <span className="mx-0.5 text-slate-200">|</span>
        <a href={a.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline">
          <ShieldCheck className="h-3 w-3" /> Join now <ExternalLink className="h-2.5 w-2.5 ml-0.5 opacity-50" />
        </a>
      </div>
    </div>
  );
}
