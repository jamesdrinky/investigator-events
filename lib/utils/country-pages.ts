import type { EventItem } from '@/lib/data/events';
import { parseDate } from '@/lib/utils/date';

/** URL slug for a country name: "United States" -> "united-states". */
export function countrySlug(country: string): string {
  return country
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export interface CountryGroup {
  country: string;
  slug: string;
  upcoming: EventItem[];
  past: EventItem[];
}

/** Group main-scope events by country, split into upcoming/past. */
export function groupEventsByCountry(events: EventItem[]): CountryGroup[] {
  const now = Date.now();
  const byCountry = new Map<string, CountryGroup>();

  for (const event of events) {
    if (event.eventScope !== 'main') continue;
    const country = event.country?.trim();
    if (!country) continue;

    const slug = countrySlug(country);
    let group = byCountry.get(slug);
    if (!group) {
      group = { country, slug, upcoming: [], past: [] };
      byCountry.set(slug, group);
    }
    (parseDate(event.date).getTime() >= now ? group.upcoming : group.past).push(event);
  }

  for (const group of byCountry.values()) {
    group.upcoming.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
    group.past.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
  }

  return [...byCountry.values()].sort(
    (a, b) => b.upcoming.length - a.upcoming.length || a.country.localeCompare(b.country)
  );
}
