import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';

const CONTACT_FORM_URLS: Record<string, string> = {
  pawli: 'https://pawli.com/contact-us/',
  scfia: 'https://scfia.starchapter.com/form.php?form_id=13',
};

function getContactFormUrl(slug: string): string | null {
  return CONTACT_FORM_URLS[slug] ?? null;
}

export async function GET() {
  if (!await hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseAdminServerClient();

  // Get all association pages
  const { data: pages } = await supabase
    .from('association_pages')
    .select('name, slug, country, contact_email')
    .order('name', { ascending: true });

  // Get all outreach sends
  const { data: sends } = await supabase
    .from('outreach_sends' as any)
    .select('association, status, created_at, recipient_email')
    .order('created_at', { ascending: false }) as any;

  // Get event counts per association
  const { data: events } = await (supabase
    .from('events')
    .select('association, title, slug')
    .eq('approved', true) as any);

  // Get member counts per association
  const { data: members } = await supabase
    .from('user_associations')
    .select('association_name');

  // Build lookup maps
  const sendsByAssoc = new Map<string, { status: string; date: string; email: string }>();
  for (const s of (sends ?? [])) {
    const key = (s.association ?? '').toLowerCase();
    if (!sendsByAssoc.has(key)) {
      sendsByAssoc.set(key, { status: s.status, date: s.created_at, email: s.recipient_email });
    }
  }

  const eventsByAssoc = new Map<string, { title: string; slug: string }[]>();
  for (const e of (events ?? [])) {
    const key = (e.association ?? '').toLowerCase();
    if (!eventsByAssoc.has(key)) eventsByAssoc.set(key, []);
    eventsByAssoc.get(key)!.push({ title: e.title, slug: e.slug });
  }

  const memberCounts = new Map<string, number>();
  for (const m of (members ?? [])) {
    const key = (m.association_name ?? '').toLowerCase();
    memberCounts.set(key, (memberCounts.get(key) ?? 0) + 1);
  }

  // Build association list
  const associations = (pages ?? []).map(page => {
    const key = page.name.toLowerCase();
    const slugKey = page.slug.toLowerCase();
    const send = sendsByAssoc.get(key) ?? sendsByAssoc.get(slugKey);
    const assocEvents = eventsByAssoc.get(key) ?? eventsByAssoc.get(slugKey) ?? [];
    const memberCount = memberCounts.get(key) ?? memberCounts.get(slugKey) ?? 0;

    // Also check short name (e.g. "ABI" for "Association of British Investigators")
    const shortKey = page.slug.toUpperCase().toLowerCase();
    const shortEvents = eventsByAssoc.get(shortKey) ?? [];
    const allEvents = [...assocEvents, ...shortEvents.filter(e => !assocEvents.some(ae => ae.slug === e.slug))];

    const hasBeenEmailed = !!send;
    const suggestedTemplate = allEvents.length > 0 ? 'introduction' as const : 'cold' as const;

    return {
      name: page.name,
      slug: page.slug,
      country: page.country,
      eventCount: allEvents.length,
      memberCount,
      hasBeenEmailed,
      lastEmailDate: send?.date ?? null,
      emailStatus: send?.status ?? null,
      suggestedTemplate,
      eventNames: allEvents.map(e => e.title),
      eventSlugs: allEvents.map(e => e.slug),
      contactEmail: (page as any).contact_email ?? send?.email ?? null,
      contactFormUrl: getContactFormUrl(page.slug),
    };
  });

  return NextResponse.json({ associations });
}
