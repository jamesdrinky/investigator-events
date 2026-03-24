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
  const [country, setCountry] = useState('All');

  const regions = useMemo(() => Array.from(new Set(associations.map((association) => association.region))), [associations]);
  const countries = useMemo(() => Array.from(new Set(associations.map((association) => association.country))).sort((a, b) => a.localeCompare(b)), [associations]);

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
        const matchesCountry = country === 'All' || association.country === country;

        return matchesQuery && matchesRegion && matchesCountry;
      })
      .sort((a, b) => b.eventCount - a.eventCount || a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
  }, [associations, country, query, region]);

  const featuredAssociation = filteredAssociations[0] ?? associations[0] ?? null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Associations', value: stats.associationCount, note: 'professional bodies listed' },
          { label: 'Countries', value: stats.countryCount, note: 'represented in the network' },
          { label: 'Regions', value: stats.regionCount, note: 'active geographic coverage' },
          { label: 'Linked live', value: stats.liveCoverageAssociations, note: 'already tied to events' }
        ].map((item) => (
          <article key={item.label} className="rounded-[1.7rem] border border-white/80 bg-white p-5 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.16)]">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
            <p className="mt-3 font-[var(--font-serif)] text-4xl leading-none text-slate-950">{item.value}</p>
            <p className="mt-3 text-sm text-slate-600">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/80 bg-white p-4 shadow-[0_24px_52px_-36px_rgba(15,23,42,0.16)] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
          <label>
            <span className="sr-only">Search associations</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search association or country"
              className="field-input mt-0 h-12 rounded-full px-5"
            />
          </label>
          <label>
            <span className="sr-only">Filter by region</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)} className="field-input mt-0 h-12 rounded-full px-5">
              <option value="All">All regions</option>
              {regions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by country</span>
            <select value={country} onChange={(event) => setCountry(event.target.value)} className="field-input mt-0 h-12 rounded-full px-5">
              <option value="All">All countries</option>
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {featuredAssociation ? (
        <section className="rounded-[2.2rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_48%,#f4fbff_100%)] p-6 shadow-[0_34px_84px_-48px_rgba(22,104,255,0.18)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="eyebrow">Featured Association</p>
              <h2 className="mt-4 font-[var(--font-serif)] text-4xl leading-[0.94] text-slate-950">{featuredAssociation.name}</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {featuredAssociation.country} · {featuredAssociation.region}. Open the linked calendar view to see every connected event listing.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="city-chip">{featuredAssociation.eventCount} linked events</span>
                <span className="global-chip">{featuredAssociation.region}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/calendar?association=${encodeURIComponent(featuredAssociation.calendarAssociation)}`}
                  className="btn-primary px-5 py-2.5"
                >
                  View linked events
                </Link>
                <a href={featuredAssociation.website} target="_blank" rel="noreferrer" className="btn-secondary px-5 py-2.5">
                  Visit association site
                </a>
              </div>
            </div>

            <div className="flex h-40 items-center justify-center rounded-[1.8rem] border border-white/90 bg-white px-8 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.16)]">
              {featuredAssociation.logoSrc ? (
                <Image
                  src={featuredAssociation.logoSrc}
                  alt={`${featuredAssociation.name} logo`}
                  width={260}
                  height={120}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xl font-semibold uppercase tracking-[0.22em] text-slate-700">
                  {getInitials(featuredAssociation.shortName)}
                </span>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredAssociations.map((association) => (
          <article
            key={association.slug}
            className="group relative overflow-hidden rounded-[1.9rem] border border-white/80 bg-white p-5 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.16)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_34px_70px_-38px_rgba(22,104,255,0.18)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(22,104,255,0.07),transparent_22%),radial-gradient(circle_at_84%_18%,rgba(20,184,255,0.06),transparent_18%)]" />
            <div className="relative">
              <div className="flex h-24 items-center justify-center rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4">
                {association.logoSrc ? (
                  <Image
                    src={association.logoSrc}
                    alt={`${association.name} logo`}
                    width={200}
                    height={84}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">{getInitials(association.shortName)}</span>
                )}
              </div>
              <h3 className="mt-4 text-xl font-semibold leading-tight text-slate-950">{association.name}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {association.country} · {association.region}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="city-chip">{association.eventCount} events</span>
                <span className="global-chip">{association.shortName}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/calendar?association=${encodeURIComponent(association.calendarAssociation)}`}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  View events
                </Link>
                <a href={association.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
                  Visit site
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
