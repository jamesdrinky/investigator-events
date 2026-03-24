import { Reveal } from '@/components/motion/reveal';
import type { CountryActivity, RegionCoverage } from '@/lib/utils/coverage';
import { getCountryFlag } from '@/lib/utils/location';

interface GlobalAssociationSectionProps {
  regions: RegionCoverage[];
  countries: CountryActivity[];
}

function initials(value: string): string {
  return value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function GlobalAssociationSection({ regions, countries }: GlobalAssociationSectionProps) {
  const topCountries = countries.slice(0, 14);

  return (
    <section className="relative overflow-hidden">
      <div>
        <Reveal className="mb-10 max-w-3xl">
          <p className="eyebrow">Association Network</p>
          <h2 className="section-title">A clearer view of the countries and regions on the platform</h2>
          <p className="section-copy">
            This section shows where the current listings are concentrated. It helps organisers and attendees understand
            which markets are already active and where coverage is still growing.
          </p>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="global-panel p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Regional Activity</p>
              <div className="relative mt-4 grid gap-3 sm:grid-cols-2">
                {regions.map((region) => (
                  <article key={region.name} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{region.name}</p>
                        <p className="mt-2 font-[var(--font-serif)] text-2xl text-slate-950">{region.eventCount}</p>
                        <p className="text-xs text-slate-400">listed events</p>
                      </div>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[10px] tracking-[0.12em] text-blue-700">
                        {initials(region.name)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="global-panel p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Most Active Countries</p>
              <div className="relative mt-4 flex flex-wrap gap-2">
                {topCountries.map((country) => (
                  <span key={country.country} className="country-chip">
                    <span>{getCountryFlag(country.country)}</span>
                    <span>
                      {country.country} · {country.events}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
