import { access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import { getCityHeroImageUrl, getCitySlug } from '@/lib/utils/city-media';

export async function hasCityHeroImage(city: string): Promise<boolean> {
  const slug = getCitySlug(city);

  if (!slug) {
    return false;
  }

  try {
    await access(path.join(process.cwd(), 'public', 'cities', slug, 'hero.jpg'), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function getCityHeroDownloadMeta(city: string) {
  const slug = getCitySlug(city);
  const url = getCityHeroImageUrl(city);

  if (!slug || !url) {
    return null;
  }

  return {
    url,
    filename: `${slug}-hero.jpg`
  };
}
