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
  const slug = getCitySlug(city);
  return slug ? `/cities/${slug}/hero.jpg` : null;
}
