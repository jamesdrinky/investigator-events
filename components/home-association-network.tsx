import Image from 'next/image';
import Link from 'next/link';
import type { AssociationSummary } from '@/lib/utils/associations';
import { getCountryFlag } from '@/lib/utils/location';

interface HomeAssociationNetworkProps {
  associations: AssociationSummary[];
}

export function HomeAssociationNetwork({ associations }: HomeAssociationNetworkProps) {
  const leadAssociation = associations[0] ?? null;
  const remaining = associations.slice(1, 5);

  return (
    <section className="relative overflow-hidden py-24 sm:py-28 lg:py-32">
      <div className="container-shell">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="eyebrow">Association Layer</p>
            <h2 className="section-title">A more visible ecosystem of associations, organisers, and regional bodies</h2>
            <p className="section-copy max-w-2xl">The network should feel branded and alive, not like metadata hiding under event records.</p>
          </div>

          {leadAssociation ? (
            <article className="global-panel p-6 sm:p-8">
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="flex h-28 w-44 items-center justify-center rounded-xl border border-gray-200 bg-slate-50 px-6">
                    {leadAssociation.logoSrc ? (
                      <Image
                        src={leadAssociation.logoSrc}
                        alt={`${leadAssociation.canonicalName} logo`}
                        width={250}
                        height={120}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">{leadAssociation.shortName}</span>
                    )}
                  </div>
                  <span className="global-chip">{leadAssociation.region}</span>
                </div>
                <h3 className="mt-6 font-[var(--font-serif)] text-4xl leading-[0.96] text-slate-950">{leadAssociation.canonicalName}</h3>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
                  {leadAssociation.eventCount} live event{leadAssociation.eventCount === 1 ? '' : 's'} across {leadAssociation.countryCount}{' '}
                  countr{leadAssociation.countryCount === 1 ? 'y' : 'ies'}, with activity currently concentrated in{' '}
                  {leadAssociation.cities.join(' · ')}.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {leadAssociation.countries.map((country) => (
                    <span key={country} className="country-chip">
                      <span>{getCountryFlag(country)}</span>
                      <span>{country}</span>
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/calendar?association=${encodeURIComponent(leadAssociation.calendarAssociation)}`} className="btn-primary px-5 py-2.5">
                    View associated events
                  </Link>
                  {leadAssociation.website ? (
                    <a href={leadAssociation.website} target="_blank" rel="noreferrer" className="btn-secondary px-5 py-2.5">
                      Visit site
                    </a>
                  ) : null}
                  <Link href="/associations" className="btn-secondary px-5 py-2.5">
                    Explore the network
                  </Link>
                </div>
              </div>
            </article>
          ) : null}
        </div>

        {remaining.length > 0 ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {remaining.map((association) => (
              <article
                key={association.name}
                className="surface-elevated relative overflow-hidden p-5"
              >
                <div className="flex min-h-[5.5rem] items-center justify-center rounded-xl border border-gray-200 bg-slate-50 px-4">
                      {association.logoSrc ? (
                        <Image
                          src={association.logoSrc}
                          alt={`${association.canonicalName} logo`}
                          width={146}
                          height={72}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">{association.shortName}</span>
                      )}
                </div>
                <p className="mt-4 truncate text-lg font-semibold text-slate-950">{association.canonicalName}</p>
                <p className="mt-1 text-sm text-slate-500">{association.region}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="city-chip">{association.eventCount}</span>
                  <Link href={`/calendar?association=${encodeURIComponent(association.calendarAssociation)}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View events
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
