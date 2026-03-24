import { Reveal } from '@/components/motion/reveal';
import type { RegionCoverage } from '@/lib/utils/coverage';
import { getCountryFlag } from '@/lib/utils/location';

interface GlobalCoverageSectionProps {
  regions: RegionCoverage[];
}

export function GlobalCoverageSection({ regions }: GlobalCoverageSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div>
        <Reveal className="mb-10 max-w-3xl">
          <p className="eyebrow">Global Coverage</p>
          <h2 className="section-title">View investigator events by region</h2>
          <p className="section-copy">
            See where events are already listed, how activity is distributed, and which countries currently have the most
            visible conference and training activity.
          </p>
        </Reveal>

        <Reveal>
          <div className="global-panel p-6">
            <div className="relative grid gap-4 md:grid-cols-2">
              {regions.map((region) => (
                <article key={region.name} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-[var(--font-serif)] text-2xl text-slate-950">{region.name}</h3>
                    <span className="global-chip">
                      {Math.round(region.share * 100)}% activity
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    {region.eventCount} event(s) across {region.countryCount} country(ies)
                  </p>
                  <div className="signal-divider mt-4" />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {region.topCountries.map((country) => (
                      <span key={country} className="country-chip">
                        <span>{getCountryFlag(country)}</span>
                        <span>{country}</span>
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
