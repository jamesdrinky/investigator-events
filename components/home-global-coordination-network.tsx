'use client';

import { WorldIntelligenceBoard } from '@/components/global/world-intelligence-board';
import type { RegionCoverage } from '@/lib/utils/coverage';

interface HomeGlobalCoordinationNetworkProps {
  stats: {
    totalCountries: number;
    totalSubregions: number;
    totalEvents: number;
  };
  regions: RegionCoverage[];
}

export function HomeGlobalCoordinationNetwork({ stats, regions }: HomeGlobalCoordinationNetworkProps) {
  const activeRegions = regions.filter((region) => region.eventCount > 0);
  const priorityRegions = activeRegions.slice(0, 4);
  const regionColors: Record<string, string> = {
    'North America': '#36a8ff',
    Europe: '#8e6dff',
    'Middle East': '#ffb14a',
    'Asia-Pacific': '#24d4c7',
    'Latin America': '#ff68cb',
    Africa: '#ffd166'
  };

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#e0f2fe_18%,#ecfeff_44%,#eff6ff_100%)] py-24 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(42,155,255,0.12),transparent_18%),radial-gradient(circle_at_86%_26%,rgba(122,104,255,0.08),transparent_16%),radial-gradient(circle_at_54%_80%,rgba(20,184,166,0.08),transparent_18%)]" />
      <div className="container-shell relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.62fr)_minmax(520px,1.38fr)] lg:items-center">
          <div className="max-w-xl pt-4 sm:pt-6 lg:pt-10">
            <p className="eyebrow">Global Activity View</p>
            <h2 className="mt-5 font-[var(--font-serif)] text-4xl leading-[1.02] text-slate-950 sm:text-5xl lg:text-[4.2rem]">
              Watch the network light up by region, route, and event concentration
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
              This is the operating view behind the platform: where signals are strongest, which routes are active, and how
              event infrastructure connects one region to the next.
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <span className="country-chip px-4 py-2 text-xs tracking-[0.18em]">
                {stats.totalCountries} countries
              </span>
              <span className="global-chip px-4 py-2 text-xs tracking-[0.18em]">
                {stats.totalEvents} listed events
              </span>
              <span className="city-chip px-4 py-2 text-xs tracking-[0.18em]">
                {stats.totalSubregions} subregions
              </span>
            </div>

            <div className="mt-10 rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="city-chip w-fit px-4 py-1.5 text-[11px] tracking-[0.18em]">
                Regional priority
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {priorityRegions.map((region) => (
                  <span key={region.name} className="country-chip">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: regionColors[region.name] ?? '#36a8ff' }} />
                    <span>{region.name}</span>
                    <span className="text-slate-500">{region.eventCount}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <WorldIntelligenceBoard regions={regions} />
        </div>
      </div>
    </section>
  );
}
