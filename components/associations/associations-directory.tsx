'use client';

import { motion } from 'framer-motion';
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

const regionAccent: Record<string, { glow: string; line: string; badge: string }> = {
  Europe: {
    glow: 'from-sky-100 via-transparent to-transparent',
    line: 'from-sky-500/80 to-cyan-400/70',
    badge: 'border-sky-200 bg-sky-50 text-sky-700'
  },
  'Middle East': {
    glow: 'from-cyan-100 via-transparent to-transparent',
    line: 'from-cyan-500/80 to-blue-400/70',
    badge: 'border-cyan-200 bg-cyan-50 text-cyan-700'
  },
  'North America': {
    glow: 'from-emerald-100 via-transparent to-transparent',
    line: 'from-emerald-500/80 to-sky-500/70',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  'Asia-Pacific': {
    glow: 'from-violet-100 via-transparent to-transparent',
    line: 'from-violet-500/80 to-sky-500/70',
    badge: 'border-violet-200 bg-violet-50 text-violet-700'
  },
  'Latin America': {
    glow: 'from-violet-100 via-transparent to-transparent',
    line: 'from-violet-500/80 to-blue-400/70',
    badge: 'border-violet-200 bg-violet-50 text-violet-700'
  },
  Africa: {
    glow: 'from-green-100 via-transparent to-transparent',
    line: 'from-green-500/80 to-emerald-400/70',
    badge: 'border-green-200 bg-green-50 text-green-700'
  }
};

function getInitials(label: string) {
  const words = label.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function AssociationsDirectory({ associations, stats }: AssociationsDirectoryProps) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All');
  const [liveOnly, setLiveOnly] = useState(false);

  const regions = useMemo(() => Array.from(new Set(associations.map((association) => association.region))), [associations]);

  const filteredAssociations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return associations
      .filter((association) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          association.name.toLowerCase().includes(normalizedQuery) ||
          association.shortName.toLowerCase().includes(normalizedQuery) ||
          association.country.toLowerCase().includes(normalizedQuery);
        const matchesRegion = region === 'All' || association.region === region;
        const matchesCoverage = !liveOnly || association.eventCount > 0;

        return matchesQuery && matchesRegion && matchesCoverage;
      })
      .sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
  }, [associations, liveOnly, query, region]);

  const featuredAssociation = useMemo(() => {
    return [...associations].sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name))[0] ?? null;
  }, [associations]);

  const representedRegions = useMemo(() => {
    return regions.map((item) => ({
      name: item,
      count: associations.filter((association) => association.region === item).length
    }));
  }, [associations, regions]);

  const representedCountries = useMemo(() => {
    return Array.from(new Set(associations.map((association) => association.country))).slice(0, 8);
  }, [associations]);

  const logoWall = useMemo(() => associations.slice(0, 12), [associations]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {featuredAssociation ? (
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(54,168,255,0.08),transparent_20%),radial-gradient(circle_at_83%_24%,rgba(168,85,247,0.06),transparent_18%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow">Association Network</p>
              <h2 className="section-title">A stronger visual read on the bodies shaping the investigator events market</h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                A curated view of the associations behind the ecosystem, organised by country and region so the platform
                reads as a live international network rather than a simple event list.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {representedCountries.map((country) => (
                  <span key={country} className="country-chip">
                    {country}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-sky-700">Featured signal</p>
                  <h3 className="mt-2 font-[var(--font-serif)] text-3xl text-slate-950">{featuredAssociation.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {featuredAssociation.country} · {featuredAssociation.region}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${regionAccent[featuredAssociation.region]?.badge ?? 'border-slate-200 bg-white text-slate-700'}`}>
                  {featuredAssociation.region}
                </span>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex h-28 items-center justify-center rounded-[1.1rem] border border-slate-200 bg-white px-6">
                  {featuredAssociation.logoSrc ? (
                    <Image
                      src={featuredAssociation.logoSrc}
                      alt={`${featuredAssociation.name} logo`}
                      width={260}
                      height={110}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[0.95rem] border border-slate-200/80 bg-white/80">
                      <span className="text-xl font-semibold tracking-[0.22em] text-slate-700">{getInitials(featuredAssociation.shortName)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {featuredAssociation.eventCount > 0 ? (
                  <span className="city-chip">{featuredAssociation.eventCount} linked event{featuredAssociation.eventCount === 1 ? '' : 's'}</span>
                ) : null}
                <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(148,163,184,0),rgba(148,163,184,0.35),rgba(148,163,184,0))]" />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a href={featuredAssociation.website} target="_blank" rel="noreferrer" className="btn-primary px-5 py-2.5">
                  Visit site
                </a>
                <Link href={`/calendar?association=${encodeURIComponent(featuredAssociation.calendarAssociation)}`} className="btn-secondary px-5 py-2.5">
                  View events
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(52,179,255,0.08),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(41,211,163,0.06),transparent_18%)]" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-sky-700">Association brands</p>
              <p className="mt-1 text-sm text-slate-600">A first read on the organisations already represented on the platform.</p>
            </div>
            <span className="global-chip">network view</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {logoWall.map((association) => (
              <div key={association.slug} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-20 items-center justify-center rounded-[0.95rem] border border-slate-200 bg-white px-4">
                  {association.logoSrc ? (
                    <Image
                      src={association.logoSrc}
                      alt={`${association.name} logo`}
                      width={180}
                      height={80}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-sm font-semibold tracking-[0.18em] text-slate-700">{getInitials(association.shortName)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Associations', value: stats.associationCount, note: 'real organisations' },
          { label: 'Countries', value: stats.countryCount, note: 'represented on the page' },
          { label: 'Regions', value: stats.regionCount, note: 'current network footprint' },
          { label: 'Live-linked', value: stats.liveCoverageAssociations, note: 'already tied to events' }
        ].map((item, index) => (
          <motion.article
            key={item.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white px-5 py-5 shadow-sm"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_42%,rgba(54,168,255,0.03))]" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="font-[var(--font-serif)] text-4xl leading-none text-slate-950">{item.value}</p>
                <div className="h-8 w-8 rounded-full border border-slate-200 bg-sky-50" />
              </div>
              <p className="mt-3 text-sm text-slate-600">{item.note}</p>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row">
            <label className="flex-1">
              <span className="sr-only">Search associations</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-sm text-slate-500">Search</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="association or country"
                  className="field-input mt-0 h-12 w-full rounded-full pl-24 pr-5"
                />
              </div>
            </label>

            <label className="min-w-[12rem]">
              <span className="sr-only">Filter by region</span>
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="field-input mt-0 h-12 w-full rounded-full px-5"
              >
                <option value="All">All regions</option>
                {regions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setLiveOnly((current) => !current)}
              className={`inline-flex items-center rounded-full border px-4 py-2 text-sm transition ${
                liveOnly ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-700'
              }`}
            >
              {liveOnly ? 'Live-linked only' : 'Show live-linked only'}
            </button>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              {filteredAssociations.length} visible
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2.5">
        {representedRegions.map((item) => (
          <div key={item.name} className="country-chip border-slate-200 bg-white">
            <span>{item.name}</span>
            <span className="text-slate-500">{item.count}</span>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAssociations.map((association, index) => {
          const accent = regionAccent[association.region] ?? regionAccent.Europe;

          return (
            <motion.article
              key={association.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.32, delay: index * 0.025, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex min-h-[24rem] flex-col overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300"
            >
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${accent.glow}`} />
              <div className="relative flex h-full flex-col">
                <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-36 items-center justify-center rounded-[1.15rem] border border-slate-200 bg-white px-6 py-5">
                    {association.logoSrc ? (
                      <Image
                        src={association.logoSrc}
                        alt={`${association.name} logo`}
                        width={280}
                        height={120}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-[0.95rem] border border-slate-200 bg-white">
                        <div className="text-center">
                          <p className="text-xl font-semibold tracking-[0.22em] text-slate-800">{getInitials(association.shortName)}</p>
                          <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">Association</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{association.shortName}</p>
                    <h3 className="mt-2 text-[1.65rem] font-semibold leading-tight text-slate-950">{association.name}</h3>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${accent.badge}`}>
                    {association.region}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span>{association.country}</span>
                  <span className="text-slate-400">/</span>
                  <span>{association.region}</span>
                  {association.eventCount > 0 ? (
                    <>
                      <span className="text-slate-400">/</span>
                      <span className="city-chip">{association.eventCount} linked</span>
                    </>
                  ) : null}
                </div>

                <div className="mt-auto pt-6">
                  <div className={`mb-4 h-px bg-gradient-to-r ${accent.line} via-slate-200 to-transparent`} />
                  <div className="flex flex-wrap gap-3">
                    <a href={association.website} target="_blank" rel="noreferrer" className="btn-primary px-5 py-2.5">
                      Visit site
                    </a>
                    <Link href={`/calendar?association=${encodeURIComponent(association.calendarAssociation)}`} className="btn-secondary px-5 py-2.5">
                      View events
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </section>

      {filteredAssociations.length === 0 ? (
        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h3 className="font-[var(--font-serif)] text-3xl text-slate-950">No associations match the current view</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
            Try widening the search or switching back to all regions to restore the full network snapshot.
          </p>
        </section>
      ) : null}
    </div>
  );
}
