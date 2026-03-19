import { PageAtmosphere } from '@/components/global/page-atmosphere';
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
    <section className="section-pad relative overflow-hidden pt-6">
      <PageAtmosphere className="opacity-35" />
      <div className="container-shell">
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
            <div className="global-panel relative overflow-hidden p-5 sm:p-7">
              <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(77,163,255,0.18),transparent_26%),radial-gradient(circle_at_86%_78%,rgba(52,211,153,0.14),transparent_22%)]" />
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Regional Activity</p>
              <div className="relative mt-4 grid gap-3 sm:grid-cols-2">
                {regions.map((region) => (
                  <article key={region.name} className="rounded-xl border border-signal/18 bg-[linear-gradient(180deg,rgba(77,163,255,0.12),rgba(255,255,255,0.025)_42%,rgba(52,211,153,0.08))] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{region.name}</p>
                        <p className="mt-2 font-[var(--font-serif)] text-2xl text-white">{region.eventCount}</p>
                        <p className="text-xs text-slate-400">listed events</p>
                      </div>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-globe/20 bg-globe/10 text-[10px] tracking-[0.12em] text-globe2">
                        {initials(region.name)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="global-panel relative overflow-hidden p-5 sm:p-7">
              <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgba(52,211,153,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(77,163,255,0.18),transparent_24%)]" />
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
