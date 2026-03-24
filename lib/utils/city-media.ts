const curatedCityHeroSlugMap: Record<string, string | null> = {
  'Philadelphia, United States': 'philadelphia-pa',
  Philadelphia: 'philadelphia-pa',
  'Philadelphia, PA': 'philadelphia-pa',
  'Philadelphia, Pennsylvania': 'philadelphia-pa',
  'National Harbor': 'national-harbor-md',
  'San Antonio': 'san-antonio-tx',
  'San Jose': 'san-jose',
  London: 'london',
  Prague: 'prague',
  Cannes: 'cannes',
  Sorrento: 'sorrento',
  Venice: 'venice',
  Bremen: 'bremen',
  'New Delhi': 'new-delhi',
  'Carolina Beach': 'carolina-beach-nc',
  Orlando: 'orlando-fl',
  Texas: 'texas',
  Newmarket: 'newmarket',
  'Cathedral City': 'cathedral-city-ca'
};

const blockedCityHeroSlugs = new Set<string>();

function normalizeLookup(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const normalizedCuratedCityHeroSlugMap = new Map(
  Object.entries(curatedCityHeroSlugMap).map(([key, value]) => [normalizeLookup(key), value])
);

export function getCitySlug(city: string): string {
  return city
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCityHeroImageUrl(city: string): string | null {
  const asset = getTrustedCityHeroAsset(city);
  if (!asset) {
    return null;
  }

  return `/cities/${asset.slug}/${asset.fileName}`;
}

export function getTrustedCityHeroSlug(city: string): string | null {
  const mapped = curatedCityHeroSlugMap[city] ?? normalizedCuratedCityHeroSlugMap.get(normalizeLookup(city));

  if (mapped === null) {
    return null;
  }

  const slug = mapped ?? getCitySlug(city);

  if (!slug || blockedCityHeroSlugs.has(slug)) {
    return null;
  }

  return slug;
}

export function getTrustedCityHeroAsset(city: string): { slug: string; fileName: string } | null {
  const slug = getTrustedCityHeroSlug(city);

  if (!slug) {
    return null;
  }

  if (slug === 'philadelphia-pa') {
    return { slug, fileName: 'filly.jpg' };
  }

  return { slug, fileName: 'hero.jpg' };
}
