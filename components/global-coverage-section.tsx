import { PageAtmosphere } from '@/components/global/page-atmosphere';
import { Reveal } from '@/components/motion/reveal';
import type { RegionCoverage } from '@/lib/utils/coverage';
import { getCountryFlag } from '@/lib/utils/location';

interface GlobalCoverageSectionProps {
  regions: RegionCoverage[];
}

export function GlobalCoverageSection({ regions }: GlobalCoverageSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <PageAtmosphere className="opacity-30" />
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
          <div className="global-panel relative overflow-hidden p-5 sm:p-8">
            <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_36%,rgba(255,255,255,0.01))]" />
            <div className="relative grid gap-4 md:grid-cols-2">
              {regions.map((region) => (
                <article key={region.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-[var(--font-serif)] text-2xl text-white">{region.name}</h3>
                    <span className="global-chip">
                      {Math.round(region.share * 100)}% activity
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-300">
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
