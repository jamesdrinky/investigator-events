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
    glow: 'from-signal/18 via-transparent to-transparent',
    line: 'from-signal/90 to-cyan-300/80',
    badge: 'bg-signal/16 text-signal2 border-signal/20'
  },
  'Middle East': {
    glow: 'from-cyan-400/18 via-transparent to-transparent',
    line: 'from-cyan-300/90 to-blue-300/80',
    badge: 'bg-cyan-300/12 text-cyan-100 border-cyan-200/20'
  },
  'North America': {
    glow: 'from-globe/18 via-transparent to-transparent',
    line: 'from-globe/90 to-emerald-300/80',
    badge: 'bg-globe/12 text-globe2 border-globe/20'
  },
  'Asia-Pacific': {
    glow: 'from-atlas/18 via-transparent to-transparent',
    line: 'from-atlas/90 to-violet-300/80',
    badge: 'bg-atlas/12 text-violet-100 border-atlas/20'
  },
  'Latin America': {
    glow: 'from-violet-400/18 via-transparent to-transparent',
    line: 'from-violet-400/90 to-blue-300/80',
    badge: 'bg-violet-400/12 text-violet-100 border-violet-300/20'
  },
  Africa: {
    glow: 'from-green-400/18 via-transparent to-transparent',
    line: 'from-green-400/90 to-emerald-300/80',
    badge: 'bg-green-400/12 text-green-100 border-green-300/20'
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
        <section className="surface-cinematic relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(54,168,255,0.16),transparent_20%),radial-gradient(circle_at_83%_24%,rgba(255,177,74,0.14),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_44%,rgba(255,255,255,0.015))]" />
          <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.06]" />
          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow">Association Network</p>
              <h2 className="section-title">A stronger visual read on the bodies shaping the investigator events market</h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
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

            <div className="surface-elevated p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Featured signal</p>
                  <h3 className="mt-2 font-[var(--font-serif)] text-3xl text-white">{featuredAssociation.name}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {featuredAssociation.country} · {featuredAssociation.region}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${regionAccent[featuredAssociation.region]?.badge ?? 'border-white/15 bg-white/[0.06] text-white'}`}>
                  {featuredAssociation.region}
                </span>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,249,0.92))] p-4">
                <div className="flex h-28 items-center justify-center rounded-[1.1rem] border border-slate-200/80 bg-[radial-gradient(circle_at_50%_12%,rgba(15,23,42,0.07),transparent_52%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(234,239,246,0.92))] px-6">
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
                <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.16),rgba(255,255,255,0))]" />
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

      <section className="surface-flat relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(52,179,255,0.12),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(41,211,163,0.12),transparent_18%)]" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Association brands</p>
              <p className="mt-1 text-sm text-slate-300">A first read on the organisations already represented on the platform.</p>
            </div>
            <span className="global-chip">network view</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {logoWall.map((association) => (
              <div key={association.slug} className="surface-flat rounded-[1.3rem] p-3">
                <div className="flex h-20 items-center justify-center rounded-[0.95rem] bg-[linear-gradient(180deg,rgba(18,34,52,0.74),rgba(11,22,34,0.82))] px-4">
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
            className="surface-elevated relative overflow-hidden px-5 py-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_42%,rgba(54,168,255,0.04))]" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="font-[var(--font-serif)] text-4xl leading-none text-white">{item.value}</p>
                <div className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.04]" />
              </div>
              <p className="mt-3 text-sm text-slate-300">{item.note}</p>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="surface-flat relative overflow-hidden p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02))]" />
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
                liveOnly ? 'border-signal/35 bg-signal/14 text-white' : 'border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white'
              }`}
            >
              {liveOnly ? 'Live-linked only' : 'Show live-linked only'}
            </button>
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
              {filteredAssociations.length} visible
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2.5">
        {representedRegions.map((item) => (
          <div key={item.name} className="country-chip bg-white/[0.04]">
            <span>{item.name}</span>
            <span className="text-slate-300">{item.count}</span>
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
              className="surface-elevated group relative flex min-h-[24rem] flex-col overflow-hidden p-5 transition duration-300"
            >
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${accent.glow}`} />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_32%,rgba(255,255,255,0.01))]" />
              <div className="relative flex h-full flex-col">
                <div className="surface-flat rounded-[1.6rem] p-4">
                  <div className="flex h-36 items-center justify-center rounded-[1.15rem] bg-[radial-gradient(circle_at_50%_12%,rgba(15,23,42,0.18),transparent_56%),linear-gradient(180deg,rgba(18,34,52,0.76),rgba(11,22,34,0.88))] px-6 py-5">
                    {association.logoSrc ? (
                      <Image
                        src={association.logoSrc}
                        alt={`${association.name} logo`}
                        width={280}
                        height={120}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-[0.95rem] bg-[linear-gradient(180deg,rgba(18,34,52,0.82),rgba(11,22,34,0.92))]">
                        <div className="text-center">
                          <p className="text-xl font-semibold tracking-[0.22em] text-white">{getInitials(association.shortName)}</p>
                          <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-slate-400">Association</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{association.shortName}</p>
                    <h3 className="mt-2 text-[1.65rem] font-semibold leading-tight text-white">{association.name}</h3>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${accent.badge}`}>
                    {association.region}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                  <span>{association.country}</span>
                  <span className="text-slate-600">/</span>
                  <span>{association.region}</span>
                  {association.eventCount > 0 ? (
                    <>
                      <span className="text-slate-600">/</span>
                      <span className="city-chip">{association.eventCount} linked</span>
                    </>
                  ) : null}
                </div>

                <div className="mt-auto pt-6">
                  <div className={`mb-4 h-px bg-gradient-to-r ${accent.line} via-white/20 to-transparent`} />
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
        <section className="surface-flat p-8 text-center">
          <h3 className="font-[var(--font-serif)] text-3xl text-white">No associations match the current view</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
            Try widening the search or switching back to all regions to restore the full network snapshot.
          </p>
        </section>
      ) : null}
    </div>
  );
}
