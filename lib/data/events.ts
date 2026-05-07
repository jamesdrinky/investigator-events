import { unstable_cache } from 'next/cache';
import { createSupabasePublicServerClient } from '@/lib/supabase/public';
import type { Database } from '@/lib/types/database';
import { slugifyEventTitle } from '@/lib/utils/event-slugs';
import { getEventImage, getCityHeroImageUrl } from '@/lib/utils/city-media';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  eventScope: 'main' | 'secondary';
  date: string;
  endDate?: string;
  city: string;
  region: string;
  country: string;
  organiser: string;
  association?: string;
  coAssociation?: string;
  category: string;
  description: string;
  website: string;
  image_path?: string;
  coverImage?: string;
  coverImageAlt?: string;
  featured: boolean;
  approved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type EventRow = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

type CompatEventRow = Partial<EventRow> & {
  date?: string;
  start_date?: string;
  end_date?: string | null;
  slug?: string | null;
  event_scope?: 'main' | 'secondary' | null;
  approved?: boolean | null;
  updated_at?: string | null;
  association?: string | null;
  image_path?: string | null;
  cover_image_url?: string | null;
  image_url?: string | null;
  image?: string | null;
  cover_image_alt?: string | null;
};

export function mapEventRowToItem(row: CompatEventRow): EventItem | null {
  const date = row.start_date ?? row.date;

  if (!row.id || !row.title || !date || !row.city || !row.region || !row.country || !row.organiser || !row.category || !row.website) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug ?? slugifyEventTitle(row.title),
    eventScope: row.event_scope ?? 'main',
    date,
    endDate: row.end_date ?? undefined,
    city: row.city,
    region: row.region,
    country: row.country,
    organiser: row.organiser,
    association: row.association ?? undefined,
    coAssociation: (row as any).co_association ?? undefined,
    category: row.category,
    description: row.description ?? '',
    website: row.website,
    image_path: row.image_path ?? undefined,
    coverImage: row.image_path ?? row.cover_image_url ?? row.image_url ?? row.image ?? getEventImage(row.slug ?? slugifyEventTitle(row.title)) ?? getCityHeroImageUrl(row.city) ?? undefined,
    coverImageAlt: row.cover_image_alt ?? undefined,
    featured: row.featured ?? false,
    approved: row.approved ?? true,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined
  };
}

async function fetchRawEvents(): Promise<CompatEventRow[]> {
  const supabase = createSupabasePublicServerClient();
  const { data, error } = await supabase.from('events').select('*').order('start_date', { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []) as CompatEventRow[];
}

const fetchVisibleEventsCached = unstable_cache(
  async (): Promise<EventItem[]> => {
    const rows = await fetchRawEvents();
    return rows
      .filter((row) => row.approved !== false)
      .map(mapEventRowToItem)
      .filter((event): event is EventItem => event !== null);
  },
  ['visible-events'],
  { revalidate: 60 } // Cache for 60 seconds
);

async function fetchVisibleEvents(): Promise<EventItem[]> {
  return fetchVisibleEventsCached();
}

export async function fetchFeaturedEvents(limit = 6): Promise<EventItem[]> {
  const events = await fetchVisibleEvents();
  return events.filter((event) => event.featured && event.eventScope === 'main').slice(0, limit);
}

export async function fetchAllEvents(): Promise<EventItem[]> {
  return fetchVisibleEvents();
}

export async function fetchEventById(id: string): Promise<EventItem | null> {
  const events = await fetchVisibleEvents();
  return events.find((event) => event.id === id) ?? null;
}

export async function fetchEventBySlug(slug: string): Promise<EventItem | null> {
  const events = await fetchVisibleEvents();
  return events.find((event) => event.slug === slug) ?? null;
}
