import type { EventItem } from '@/lib/data/events';

export type MacroRegion = 'North America' | 'Europe' | 'Middle East' | 'Asia-Pacific';

export interface RegionCoverage {
  name: MacroRegion;
  eventCount: number;
  countryCount: number;
  share: number;
  topCountries: string[];
}

export interface CoverageMetrics {
  totalEvents: number;
  totalCountries: number;
  totalSubregions: number;
  regions: RegionCoverage[];
}

export interface CountryActivity {
  country: string;
  events: number;
}

const macroRegionOrder: MacroRegion[] = ['North America', 'Europe', 'Middle East', 'Asia-Pacific'];

function getMacroRegion(country: string): MacroRegion {
  switch (country) {
    case 'United States':
    case 'Canada':
    case 'Mexico':
      return 'North America';

    case 'United Kingdom':
    case 'Ireland':
    case 'Germany':
    case 'France':
    case 'Spain':
    case 'Italy':
    case 'Netherlands':
    case 'Belgium':
    case 'Switzerland':
    case 'Portugal':
    case 'Sweden':
    case 'Norway':
    case 'Denmark':
    case 'Austria':
      return 'Europe';

    case 'United Arab Emirates':
    case 'Saudi Arabia':
    case 'Qatar':
    case 'Kuwait':
    case 'Bahrain':
    case 'Oman':
    case 'Jordan':
    case 'Lebanon':
      return 'Middle East';

    default:
      return 'Asia-Pacific';
  }
}

export function getCountryActivity(events: EventItem[]): CountryActivity[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    counts.set(event.country, (counts.get(event.country) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([country, value]) => ({ country, events: value }))
    .sort((a, b) => b.events - a.events || a.country.localeCompare(b.country));
}

export function getCoverageMetrics(events: EventItem[]): CoverageMetrics {
  const totalEvents = events.length;
  const countries = new Set<string>();
  const subregions = new Set<string>();

  const regionAccumulator = new Map<MacroRegion, { eventCount: number; countries: Set<string>; countryCounts: Map<string, number> }>();

  for (const region of macroRegionOrder) {
    regionAccumulator.set(region, {
      eventCount: 0,
      countries: new Set<string>(),
      countryCounts: new Map<string, number>()
    });
  }

  for (const event of events) {
    countries.add(event.country);
    subregions.add(event.region);

    const macroRegion = getMacroRegion(event.country);
    const bucket = regionAccumulator.get(macroRegion);

    if (!bucket) {
      continue;
    }

    bucket.eventCount += 1;
    bucket.countries.add(event.country);
    bucket.countryCounts.set(event.country, (bucket.countryCounts.get(event.country) ?? 0) + 1);
  }

  const regions: RegionCoverage[] = macroRegionOrder.map((name) => {
    const bucket = regionAccumulator.get(name)!;
    const topCountries = Array.from(bucket.countryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([country]) => country);

    return {
      name,
      eventCount: bucket.eventCount,
      countryCount: bucket.countries.size,
      share: totalEvents > 0 ? bucket.eventCount / totalEvents : 0,
      topCountries
    };
  });

  return {
    totalEvents,
    totalCountries: countries.size,
    totalSubregions: subregions.size,
    regions
  };
}
