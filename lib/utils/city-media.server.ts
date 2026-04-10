import { access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import { getCityHeroImageUrl } from '@/lib/utils/city-media';

export async function hasCityHeroImage(city: string): Promise<boolean> {
  const url = getCityHeroImageUrl(city);
  if (!url) return false;

  try {
    await access(path.join(process.cwd(), 'public', url), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function getCityHeroDownloadMeta(city: string) {
  const url = getCityHeroImageUrl(city);
  if (!url) return null;
  return { url, filename: path.basename(url) };
}
