// Shared helpers for the Association Console — the self-serve surface where
// an association's own admins manage their events through IE.
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import type { EventItem } from '@/lib/data/events';

export interface AssociationPageRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  country: string | null;
  contact_email: string | null;
  is_verified: boolean | null;
}

export async function fetchAssociationPageBySlug(slug: string): Promise<AssociationPageRow | null> {
  const supabase = createSupabaseAdminServerClient();
  const { data } = await (supabase
    .from('association_pages')
    .select('id, slug, name, logo_url, website, country, contact_email, is_verified')
    .eq('slug', slug)
    .maybeSingle() as any);
  return (data as AssociationPageRow) ?? null;
}

export async function isAssociationAdmin(userId: string, associationPageId: string): Promise<boolean> {
  const supabase = createSupabaseAdminServerClient();
  const { data } = await (supabase
    .from('association_admins' as any)
    .select('id')
    .eq('user_id', userId)
    .eq('association_page_id', associationPageId)
    .maybeSingle() as any);
  return Boolean(data);
}

/** Loose matching between an association page and event rows — event data
 *  stores association/organiser as free text ("WAD", full name, etc.). */
export function eventMatchesAssociation(
  event: Pick<EventItem, 'association' | 'organiser'>,
  page: Pick<AssociationPageRow, 'name' | 'slug'>
): boolean {
  const keys = [page.slug.toLowerCase(), page.name.toLowerCase()].filter((k) => k.length >= 3);
  const haystacks = [event.association ?? '', event.organiser ?? '']
    .map((v) => v.trim().toLowerCase())
    .filter((v) => v.length >= 3);
  return keys.some((key) => haystacks.some((h) => h.includes(key) || key.includes(h)));
}
