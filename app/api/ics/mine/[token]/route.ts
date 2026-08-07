import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { fetchAllEvents } from '@/lib/data/events';
import { parseDate } from '@/lib/utils/date';
import { buildIcsFeed } from '@/lib/utils/ics';
import { verifyFeedToken } from '@/lib/utils/personal-feed';
import { eventMatchesAssociation } from '@/lib/data/association-console';

// Personal calendar feed: every event from every association the member
// belongs to, in one subscription. The token is minted by /api/my-calendar
// for the signed-in user.
export const revalidate = 1800;

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  const userId = verifyFeedToken(params.token);
  if (!userId) return new NextResponse('Not found', { status: 404 });

  const supabase = createSupabaseAdminServerClient();
  const [{ data: memberships }, allEvents] = await Promise.all([
    (supabase
      .from('user_associations')
      .select('association_name, association_slug')
      .eq('user_id', userId) as any),
    fetchAllEvents(),
  ]);

  const pages = ((memberships ?? []) as { association_name: string; association_slug: string | null }[]).map((m) => ({
    name: m.association_name ?? '',
    slug: m.association_slug ?? m.association_name ?? '',
  }));

  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const events = allEvents
    .filter((e) => e.eventScope === 'main' && parseDate(e.endDate ?? e.date).getTime() >= cutoff)
    .filter((e) => pages.some((page) => eventMatchesAssociation(e, page)))
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

  const ics = buildIcsFeed(events, {
    name: 'My associations — Investigator Events',
    description: "Every event from the associations you're a member of on investigatorevents.com.",
  });

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="my-associations.ics"',
      'Cache-Control': 'private, max-age=1800',
    },
  });
}
