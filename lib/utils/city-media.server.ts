import { access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import { getCityHeroImageUrl, getTrustedCityHeroAsset, getTrustedCityHeroSlug } from '@/lib/utils/city-media';

export async function hasCityHeroImage(city: string): Promise<boolean> {
  const asset = getTrustedCityHeroAsset(city);

  if (!asset) {
    return false;
  }

  try {
    await access(path.join(process.cwd(), 'public', 'cities', asset.slug, asset.fileName), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function getCityHeroDownloadMeta(city: string) {
  const slug = getTrustedCityHeroSlug(city);
  const url = getCityHeroImageUrl(city);

  if (!slug || !url) {
    return null;
  }

  return {
    url,
    filename: `${slug}-hero.jpg`
  };
}
