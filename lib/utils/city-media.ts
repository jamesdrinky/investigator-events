/**
 * Maps event cities to available images in /public/cities/.
 * All images are flat files — no subdirectories.
 */

const cityImageMap: Record<string, string> = {
  // Direct city matches
  'Philadelphia': 'filly.jpg',
  'Philadelphia, United States': 'filly.jpg',
  'Philadelphia, PA': 'filly.jpg',
  'Philadelphia, Pennsylvania': 'filly.jpg',
  'Orlando': 'orlando.jpg',
  'Orlando, FL': 'orlando.jpg',
  'San Antonio': 'sanantonio.jpg',
  'San Antonio, TX': 'sanantonio.jpg',
  'Venice': 'venice.jpg',
  'Cannes': 'paris.jpg',
  'Budapest': 'budapest.jpg',
  'Carolina Beach': 'beach.jpg',
  'Carolina Beach, NC': 'beach.jpg',

  // Events in hotel/convention venues — use venue-type images
  'Newmarket': 'conventioncentre.jpg',
  'National Harbor': 'hilton.jpg',
  'National Harbor, MD': 'hilton.jpg',
  'Sorrento': 'hilton.jpg',
  'Cathedral City': 'cathederalcity.jpg',
  'Cathedral City, CA': 'cathederalcity.jpg',
  'New Delhi': 'memorial.jpg',
  'Texas': 'sanantonio.jpg',
  'Prague': 'budapest.jpg',
  'San Jose': 'beach.jpg',
  'Casablanca': 'casablanca.jpg',
  'Nashville': 'nashville.jpg',
  'Nashville, TN': 'nashville.jpg',

  // New city images
  'London': 'london.jpg',
  'Manchester': 'manchester.jpg',
  'Los Angeles': 'la.jpg',
  'Toluca Lake': 'la.jpg',
  'Toluca Lake, CA': 'la.jpg',
  'Lakewood': 'la.jpg',
  'Lakewood, CA': 'la.jpg',
  'Carmichael': 'la.jpg',
  'Carmichael, CA': 'la.jpg',
  'Escondido': 'la.jpg',
  'Escondido, CA': 'la.jpg',
  'Vienna': 'vienna.jpg',
  'Bremen': 'conventioncentre.jpg',
  'New York': 'nyc.jpg',
  'New York City': 'nyc.jpg',
  'New York, NY': 'nyc.jpg',
  'Warsaw': 'warsaw.jpg',
  'Bonita Springs': 'bonitasprings.avif',
  'Bonita Springs, FL': 'bonitasprings.avif',
  'San José': 'beach.jpg',
};

/** Map specific event slugs to event-branded images */
const eventImageMap: Record<string, string> = {
  'professional-investigators-conference-2026': 'pic-2026.jpg',
  '66th-budeg-general-meeting-2026': 'budeg-2026.jpg',
  '2026-intellenet-conference': 'intellenet-2026.jpg',
  'ncapi-annual-conference': 'ncapi-2026.jpg',
  'cii-agm-2026': 'cii-agm-2026.jpg',
};

function normalizeLookup(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const normalizedCityMap = new Map(
  Object.entries(cityImageMap).map(([key, value]) => [normalizeLookup(key), value])
);

const normalizedEventMap = new Map(
  Object.entries(eventImageMap).map(([key, value]) => [normalizeLookup(key), value])
);

/** Get image path for a specific event by slug */
export function getEventImage(slug: string): string | null {
  const file = normalizedEventMap.get(normalizeLookup(slug));
  return file ? `/cities/${file}` : null;
}

/** Get city hero image URL — returns /cities/filename.jpg or null */
export function getCityHeroImageUrl(city: string): string | null {
  const file = normalizedCityMap.get(normalizeLookup(city));
  return file ? `/cities/${file}` : null;
}

// Legacy exports used by city-media.server.ts
export function getCitySlug(city: string): string {
  return city
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getTrustedCityHeroSlug(city: string): string | null {
  const file = normalizedCityMap.get(normalizeLookup(city));
  return file ? getCitySlug(city) : null;
}

export function getTrustedCityHeroAsset(city: string): { slug: string; fileName: string } | null {
  const file = normalizedCityMap.get(normalizeLookup(city));
  if (!file) return null;
  return { slug: '.', fileName: file };
}
