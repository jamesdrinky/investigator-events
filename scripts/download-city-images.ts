import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { getCitySlug } from '@/lib/utils/city-media';
import type { Database } from '@/lib/types/database';

interface CityRecord {
  city: string;
  country: string;
}

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  alt: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    landscape: string;
  };
}

const ROOT = process.cwd();
const PUBLIC_CITIES_DIR = path.join(ROOT, 'public', 'cities');
const SQL_SEED_PATH = path.join(ROOT, 'supabase', 'seed', 'phase1_events.sql');
const ENV_FILES = ['.env.local', '.env'];
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

function parseEnvFile(contents: string) {
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function loadLocalEnv() {
  for (const envFile of ENV_FILES) {
    const envPath = path.join(ROOT, envFile);

    try {
      const contents = await readFile(envPath, 'utf8');
      parseEnvFile(contents);
    } catch {
      continue;
    }
  }
}

function normalizeCityRecord(city: string, country: string): CityRecord | null {
  const cleanCity = city.trim();
  const cleanCountry = country.trim();

  if (!cleanCity || !cleanCountry) {
    return null;
  }

  if (cleanCity.toLowerCase() === 'online') {
    return null;
  }

  return {
    city: cleanCity,
    country: cleanCountry
  };
}

async function fetchCitiesFromSupabase(): Promise<CityRecord[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return [];
  }

  const supabase = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false
    }
  });

  const { data, error } = await supabase.from('events').select('city, country, approved');

  if (error) {
    throw new Error(`Supabase city query failed: ${error.message}`);
  }

  return (data ?? [])
    .filter((row) => row.approved !== false)
    .map((row) => normalizeCityRecord(row.city ?? '', row.country ?? ''))
    .filter((row): row is CityRecord => row !== null);
}

async function fetchCitiesFromSeed(): Promise<CityRecord[]> {
  const sql = await readFile(SQL_SEED_PATH, 'utf8');
  const matches = [...sql.matchAll(/\(\s*'[^']*'\s*,\s*'[^']*'\s*,\s*'[^']*'\s*,\s*'([^']*)'\s*,\s*'([^']*)'/g)];

  return matches
    .map((match) => normalizeCityRecord(match[1], match[2]))
    .filter((row): row is CityRecord => row !== null);
}

function dedupeCities(records: CityRecord[]): CityRecord[] {
  const unique = new Map<string, CityRecord>();

  for (const record of records) {
    const key = `${record.city}__${record.country}`;

    if (!unique.has(key)) {
      unique.set(key, record);
    }
  }

  return Array.from(unique.values()).sort((a, b) => a.city.localeCompare(b.city) || a.country.localeCompare(b.country));
}

function getHeroPath(city: string) {
  return path.join(PUBLIC_CITIES_DIR, getCitySlug(city), 'hero.jpg');
}

async function fileExists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function createQueries(record: CityRecord) {
  return [
    `${record.city} ${record.country} skyline cityscape`,
    `${record.city} ${record.country} downtown aerial`,
    `${record.city} ${record.country} business district`,
    `${record.city} ${record.country} skyline`
  ];
}

function scorePhoto(photo: PexelsPhoto, record: CityRecord) {
  const haystack = `${photo.alt ?? ''}`.toLowerCase();
  const city = record.city.toLowerCase();
  const country = record.country.toLowerCase();
  let score = 0;

  if (photo.width > photo.height) {
    score += 4;
  }

  if (photo.width / photo.height >= 1.3) {
    score += 2;
  }

  for (const keyword of ['skyline', 'cityscape', 'downtown', 'aerial', 'business district', 'urban']) {
    if (haystack.includes(keyword)) {
      score += 3;
    }
  }

  if (haystack.includes(city)) {
    score += 6;
  }

  if (haystack.includes(country)) {
    score += 2;
  }

  return score;
}

async function searchPexels(record: CityRecord, apiKey: string, usedPhotoIds: Set<number>) {
  let bestPhoto: PexelsPhoto | null = null;
  let bestScore = -1;

  for (const query of createQueries(record)) {
    const url = new URL(PEXELS_API_URL);
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', 'landscape');
    url.searchParams.set('size', 'large');
    url.searchParams.set('per_page', '12');

    const response = await fetch(url, {
      headers: {
        Authorization: apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels search failed (${response.status}) for ${record.city}, ${record.country}`);
    }

    const payload = (await response.json()) as { photos?: PexelsPhoto[] };
    const photos = payload.photos ?? [];

    for (const photo of photos) {
      if (usedPhotoIds.has(photo.id)) {
        continue;
      }

      const score = scorePhoto(photo, record);

      if (score > bestScore) {
        bestScore = score;
        bestPhoto = photo;
      }
    }

    if (bestPhoto) {
      break;
    }
  }

  return bestPhoto;
}

async function downloadPhoto(record: CityRecord, photo: PexelsPhoto) {
  const slug = getCitySlug(record.city);
  const cityDir = path.join(PUBLIC_CITIES_DIR, slug);
  const heroPath = path.join(cityDir, 'hero.jpg');
  const sourceUrl = photo.src.landscape || photo.src.large2x || photo.src.large || photo.src.original || photo.src.medium;

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Image download failed (${response.status}) for ${record.city}, ${record.country}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  await mkdir(cityDir, { recursive: true });
  await writeFile(heroPath, buffer);
}

async function resolveCitySource() {
  try {
    const supabaseRecords = await fetchCitiesFromSupabase();

    if (supabaseRecords.length > 0) {
      return {
        source: 'live Supabase events',
        records: dedupeCities(supabaseRecords)
      };
    }
  } catch (error) {
    console.warn(`[warn] Live event fetch unavailable: ${(error as Error).message}`);
  }

  const seedRecords = await fetchCitiesFromSeed();

  return {
    source: 'supabase/seed/phase1_events.sql',
    records: dedupeCities(seedRecords)
  };
}

async function main() {
  await loadLocalEnv();

  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    throw new Error('Missing PEXELS_API_KEY. Set it in your shell or .env.local before running this script.');
  }

  const { source, records } = await resolveCitySource();
  const usedPhotoIds = new Set<number>();
  const summary = {
    success: [] as string[],
    skipped: [] as string[],
    failed: [] as string[]
  };

  console.log(`[info] City source: ${source}`);
  console.log(`[info] Unique city targets: ${records.length}`);

  for (const record of records) {
    const label = `${record.city}, ${record.country}`;
    const heroPath = getHeroPath(record.city);

    if (await fileExists(heroPath)) {
      summary.skipped.push(`${label} (already exists)`);
      console.log(`[skip] ${label} -> existing hero.jpg`);
      continue;
    }

    try {
      const photo = await searchPexels(record, apiKey, usedPhotoIds);

      if (!photo) {
        summary.failed.push(`${label} (no suitable result)`);
        console.log(`[fail] ${label} -> no suitable result`);
        continue;
      }

      await downloadPhoto(record, photo);
      usedPhotoIds.add(photo.id);
      summary.success.push(`${label} -> public/cities/${getCitySlug(record.city)}/hero.jpg`);
      console.log(`[ok] ${label} -> photo ${photo.id}`);
    } catch (error) {
      const message = (error as Error).message;
      summary.failed.push(`${label} (${message})`);
      console.log(`[fail] ${label} -> ${message}`);
    }
  }

  console.log('\n[summary]');
  console.log(`Succeeded: ${summary.success.length}`);
  console.log(`Skipped: ${summary.skipped.length}`);
  console.log(`Failed: ${summary.failed.length}`);

  if (summary.failed.length > 0) {
    console.log('\n[failed cities]');
    for (const entry of summary.failed) {
      console.log(`- ${entry}`);
    }
  }
}

main().catch((error) => {
  console.error(`[fatal] ${(error as Error).message}`);
  process.exitCode = 1;
});
