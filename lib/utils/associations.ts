import type { EventItem } from '@/lib/data/events';
import { buildAssociationDirectory, findAssociationRecordByLabel, getAssociationLogoSrc } from '@/lib/data/associations';

export interface AssociationSummary {
  name: string;
  region: string;
  eventCount: number;
  countryCount: number;
  countries: string[];
  cities: string[];
  shortName: string;
  canonicalName: string;
  logoSrc?: string;
  website?: string;
  calendarAssociation: string;
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
        .map(([city]) => city),
      shortName: findAssociationRecordByLabel(name)?.shortName ?? name,
      canonicalName: findAssociationRecordByLabel(name)?.name ?? name,
      logoSrc: getAssociationLogoSrc(name),
      website: findAssociationRecordByLabel(name)?.website,
      calendarAssociation: name
    }))
    .sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function getHomepageAssociationNetwork(events: EventItem[], limit = 8): AssociationSummary[] {
  const summaries = getAssociationSummaries(events, Number.MAX_SAFE_INTEGER);
  const directory = buildAssociationDirectory(events)
    .filter((association) => association.eventCount > 0)
    .sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name));

  const summaryMap = new Map(summaries.map((summary) => [summary.calendarAssociation, summary]));

  const network: AssociationSummary[] = [];

  for (const association of directory) {
    const summary = summaryMap.get(association.calendarAssociation);

    if (!summary) {
      continue;
    }

    network.push({
      ...summary,
      name: association.calendarAssociation,
      shortName: association.shortName,
      canonicalName: association.name,
      logoSrc: association.logoSrc,
      website: association.website,
      calendarAssociation: association.calendarAssociation,
      region: association.region
    });
  }

  return network.slice(0, limit);
}
