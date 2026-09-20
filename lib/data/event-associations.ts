import type { EventAssociationRole } from '@/lib/data/events';

export type AssociationLink = { label: string; role: EventAssociationRole };

/**
 * Replace an event's association links with exactly `links`.
 *
 * Delete-then-insert rather than a diff: the lists are tiny (one to four
 * rows), and an admin removing a partner has to actually remove the row,
 * which an upsert-only path would quietly skip.
 *
 * Labels are trimmed and de-duplicated case-insensitively, because the
 * admin selects and the public form can both offer the same body under
 * slightly different spellings, and (event_id, label) is unique.
 */
export async function syncEventAssociations(
  supabase: any,
  eventId: string,
  links: AssociationLink[]
): Promise<{ written: number }> {
  const seen = new Set<string>();
  const clean: AssociationLink[] = [];

  for (const link of links) {
    const label = link.label?.trim();
    if (!label || label.toLowerCase() === 'other') continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    clean.push({ label, role: link.role });
  }

  await supabase.from('event_associations').delete().eq('event_id', eventId);
  if (clean.length === 0) return { written: 0 };

  const rows = clean.map((link, index) => ({
    event_id: eventId,
    label: link.label,
    role: link.role,
    position: index,
  }));

  const { error } = await supabase.from('event_associations').insert(rows);
  if (error) {
    console.error('syncEventAssociations failed:', error.message);
    return { written: 0 };
  }
  return { written: rows.length };
}

/** Split a comma/semicolon separated admin field into labels. */
export function parseAssociationList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Build the ordered link list from the admin form's four inputs:
 * one host, one co-host, then free-text lists of further co-hosts and patrons.
 */
export function buildAssociationLinks(input: {
  association?: string | null;
  coAssociation?: string | null;
  additional?: string | null;
  patrons?: string | null;
}): AssociationLink[] {
  const links: AssociationLink[] = [];
  if (input.association?.trim()) links.push({ label: input.association, role: 'host' });
  if (input.coAssociation?.trim()) links.push({ label: input.coAssociation, role: 'co-host' });
  for (const label of parseAssociationList(input.additional)) links.push({ label, role: 'co-host' });
  for (const label of parseAssociationList(input.patrons)) links.push({ label, role: 'patron' });
  return links;
}
