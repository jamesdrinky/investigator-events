import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

export type RelationshipLevel = 'close' | 'known' | 'cold' | 'skip';

export type AssociationRelationship = {
  associationCode: string;
  level: RelationshipLevel | null;
  contactName: string | null;
  contactEmail: string | null;
  note: string | null;
  updatedAt: string | null;
};

/** One association as the relationship map needs to show it. */
export type AssociationDossier = {
  code: string;
  name: string;
  country: string | null;
  /** Address from association_pages — the starting point, overridable by Mike. */
  pageEmail: string | null;
  events: { title: string; date: string; city: string | null }[];
  /** Named organisers on their own events, minus the ones that are just the acronym. */
  organisers: string[];
  seniorMembers: { name: string; role: string | null }[];
  memberCount: number;
  timesContacted: number;
  hasVideo: boolean;
  relationship: AssociationRelationship | null;
};

const SENIOR_ROLE = /presid|chair|board|director|secretar|treasur|vice|governing|exec|sergeant/i;
const normalise = (value: string | null | undefined) =>
  (value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/**
 * Everything known about every association, merged with whatever Mike has
 * recorded. Built from live data rather than a snapshot so a newly added
 * association appears in the map on its own.
 */
export async function fetchAssociationDossiers(): Promise<AssociationDossier[]> {
  const supabase = createSupabaseAdminServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const [pagesRes, eventsRes, membershipsRes, profilesRes, sendsRes, videosRes, relRes] = await Promise.all([
    supabase.from('association_pages').select('name, slug, contact_email, country'),
    (supabase.from('events').select('association, title, organiser, start_date, city, slug')
      .eq('approved', true).gte('start_date', today).order('start_date') as any),
    supabase.from('user_associations').select('association_name, role, user_id'),
    supabase.from('profiles').select('id, full_name'),
    (supabase.from('outreach_sends' as any).select('association') as any),
    (supabase.from('association_videos' as any).select('event_slug, status') as any),
    (supabase.from('association_relationships' as any).select('*') as any),
  ]);

  const profileName = new Map<string, string>(
    ((profilesRes.data ?? []) as any[]).map((p) => [p.id, p.full_name])
  );
  const approvedVideoSlugs = new Set(
    ((videosRes.data ?? []) as any[]).filter((v) => v.status === 'approved').map((v) => v.event_slug).filter(Boolean)
  );
  const relByCode = new Map<string, any>(
    ((relRes.data ?? []) as any[]).map((r) => [normalise(r.association_code), r])
  );

  type Draft = Omit<AssociationDossier, 'relationship'> & { relationship: null };
  const byKey = new Map<string, Draft>();
  const blank = (code: string, name: string): Draft => ({
    code, name, country: null, pageEmail: null, events: [], organisers: [],
    seniorMembers: [], memberCount: 0, timesContacted: 0, hasVideo: false, relationship: null,
  });

  for (const page of ((pagesRes.data ?? []) as any[])) {
    const key = normalise(page.slug);
    if (!key) continue;
    const row = byKey.get(key) ?? blank(page.slug.toUpperCase(), page.name);
    row.name = page.name;
    row.country = page.country ?? null;
    row.pageEmail = page.contact_email ?? null;
    byKey.set(key, row);
    // Events store short codes ("NALI"); pages store full names with the code
    // in brackets. Alias the bracketed code so the two sides join up.
    const bracketed = page.name.match(/\(([^)]+)\)/)?.[1];
    if (bracketed && !byKey.has(normalise(bracketed))) byKey.set(normalise(bracketed), row);
  }

  for (const event of ((eventsRes.data ?? []) as any[])) {
    const key = normalise(event.association);
    if (!key) continue;
    const row = byKey.get(key) ?? blank(event.association, event.association);
    row.code = event.association ?? row.code;
    row.events.push({ title: event.title, date: event.start_date, city: event.city ?? null });
    const organiser = String(event.organiser ?? '').trim();
    // Skip organiser values that are just the association's own name/acronym.
    if (organiser && normalise(organiser) !== key && !row.organisers.includes(organiser)) {
      row.organisers.push(organiser);
    }
    byKey.set(key, row);
    if (approvedVideoSlugs.has(event.slug)) row.hasVideo = true;
  }

  for (const membership of ((membershipsRes.data ?? []) as any[])) {
    const row = byKey.get(normalise(membership.association_name));
    if (!row) continue;
    row.memberCount += 1;
    const name = profileName.get(membership.user_id);
    if (name && SENIOR_ROLE.test(membership.role ?? '') && row.seniorMembers.length < 3) {
      row.seniorMembers.push({ name, role: (membership.role ?? '').trim() || null });
    }
  }

  for (const send of ((sendsRes.data ?? []) as any[])) {
    const row = byKey.get(normalise(send.association));
    if (row) row.timesContacted += 1;
  }

  // Several aliases can point at the same object; de-duplicate by identity.
  const unique = [...new Set(byKey.values())];

  return unique
    .map((row): AssociationDossier => {
      const rel = relByCode.get(normalise(row.code));
      return {
        ...row,
        relationship: rel
          ? {
              associationCode: rel.association_code,
              level: rel.level ?? null,
              contactName: rel.contact_name ?? null,
              contactEmail: rel.contact_email ?? null,
              note: rel.note ?? null,
              updatedAt: rel.updated_at ?? null,
            }
          : null,
      };
    })
    .sort((a, b) =>
      b.events.length - a.events.length ||
      b.seniorMembers.length - a.seniorMembers.length ||
      a.name.localeCompare(b.name)
    );
}
