import { PageAtmosphere } from '@/components/global/page-atmosphere';
import { Reveal } from '@/components/motion/reveal';
import type { RegionCoverage } from '@/lib/utils/coverage';
import { getCountryFlag } from '@/lib/utils/location';

interface GlobalCoverageSectionProps {
  regions: RegionCoverage[];
}

export function GlobalCoverageSection({ regions }: GlobalCoverageSectionProps) {
  return (
    <section className="section-pad relative overflow-hidden pt-6">
      <PageAtmosphere className="opacity-40" />
      <div className="container-shell">
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
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(77,163,255,0.2),transparent_30%),radial-gradient(circle_at_80%_72%,rgba(52,211,153,0.16),transparent_28%),linear-gradient(180deg,rgba(184,228,255,0.04),transparent_45%)]" />
            <div className="relative grid gap-4 md:grid-cols-2">
              {regions.map((region) => (
                <article key={region.name} className="rounded-2xl border border-signal/18 bg-[linear-gradient(180deg,rgba(77,163,255,0.14),rgba(255,255,255,0.03)_40%,rgba(52,211,153,0.08))] p-5">
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
