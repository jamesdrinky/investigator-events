const curatedCityHeroSlugMap: Record<string, string | null> = {
  'Philadelphia, United States': null,
  Philadelphia: null,
  'Philadelphia, PA': null,
  'Philadelphia, Pennsylvania': null,
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

const blockedCityHeroSlugs = new Set(['philadelphia', 'philadelphia-pa', 'philadelphia-pennsylvania']);

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
  const mapped = curatedCityHeroSlugMap[city];

  if (mapped === null) {
    return null;
  }

  const slug = mapped ?? getCitySlug(city);
  if (!slug || blockedCityHeroSlugs.has(slug)) {
    return null;
  }

  return `/cities/${slug}/hero.jpg`;
}

export function getTrustedCityHeroSlug(city: string): string | null {
  const mapped = curatedCityHeroSlugMap[city];

  if (mapped === null) {
    return null;
  }

  const slug = mapped ?? getCitySlug(city);

  if (!slug || blockedCityHeroSlugs.has(slug)) {
    return null;
  }

  return slug;
}
