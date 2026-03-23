import type { EventItem } from '@/lib/data/events';

export interface AssociationSummary {
  name: string;
  region: string;
  eventCount: number;
  countryCount: number;
  countries: string[];
  cities: string[];
}

export function getAssociationSummaries(events: EventItem[], limit = 8): AssociationSummary[] {
  const buckets = new Map<string, { regionCounts: Map<string, number>; countryCounts: Map<string, number>; cityCounts: Map<string, number>; eventCount: number }>();

  for (const event of events) {
    const key = event.association ?? event.organiser;
    const bucket = buckets.get(key) ?? {
      regionCounts: new Map<string, number>(),
      countryCounts: new Map<string, number>(),
      cityCounts: new Map<string, number>(),
      eventCount: 0
    };

    bucket.eventCount += 1;
    bucket.regionCounts.set(event.region, (bucket.regionCounts.get(event.region) ?? 0) + 1);
    bucket.countryCounts.set(event.country, (bucket.countryCounts.get(event.country) ?? 0) + 1);
    bucket.cityCounts.set(event.city, (bucket.cityCounts.get(event.city) ?? 0) + 1);
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .map(([name, bucket]) => ({
      name,
      region: Array.from(bucket.regionCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Global',
      eventCount: bucket.eventCount,
      countryCount: bucket.countryCounts.size,
      countries: Array.from(bucket.countryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([country]) => country),
      cities: Array.from(bucket.cityCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([city]) => city)
    }))
    .sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name))
    .slice(0, limit);
}
