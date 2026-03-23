import Link from 'next/link';
import type { AssociationSummary } from '@/lib/utils/associations';
import { getCountryFlag } from '@/lib/utils/location';

interface HomeAssociationNetworkProps {
  associations: AssociationSummary[];
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function HomeAssociationNetwork({ associations }: HomeAssociationNetworkProps) {
  return (
    <section className="section-pad relative overflow-hidden pt-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_26%,rgba(255,255,255,0.015))]" />
      <div className="container-shell">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="eyebrow">Association Layer</p>
            <h2 className="section-title">Associations are a core part of the platform, not just a tag on an event record</h2>
            <p className="section-copy max-w-2xl">
              The calendar is designed to give industry associations year-round visibility, help organisers see the wider
              schedule, and make it easier for investigators to track who is hosting what across the world.
            </p>
          </div>
          <Link href="/calendar" className="btn-secondary px-5 py-2.5">
            Explore by Association
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {associations.map((association) => (
            <article key={association.name} className="lux-panel relative overflow-hidden p-5">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_34%,rgba(255,255,255,0.015))]" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] text-sm font-semibold tracking-[0.18em] text-white">
                    {initials(association.name)}
                  </span>
                  <span className="global-chip">{association.region}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{association.name}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  {association.eventCount} live event{association.eventCount === 1 ? '' : 's'} across {association.countryCount} countr
                  {association.countryCount === 1 ? 'y' : 'ies'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {association.countries.map((country) => (
                    <span key={country} className="country-chip">
                      <span>{getCountryFlag(country)}</span>
                      <span>{country}</span>
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">
                  Active cities: {association.cities.join(' · ')}
                </p>
                <Link
                  href={`/calendar?association=${encodeURIComponent(association.name)}`}
                  className="mt-5 inline-flex text-sm text-signal2 transition hover:text-white"
                >
                  View associated events
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
