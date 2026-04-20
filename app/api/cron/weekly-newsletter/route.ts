import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { fetchAllEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { buildWeeklyNewsletterHtml } from '@/lib/email/weekly-newsletter';

const BATCH_SIZE = 50;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const resend = new Resend(resendKey);
  const supabase = createSupabaseAdminServerClient();

  const events = await fetchAllEvents();
  const { upcoming, newlyAdded, featured, hasFreshActivity } = getWeeklyCollections(events);

  if (!hasFreshActivity) {
    return NextResponse.json({ message: 'No fresh activity, skipping send', sent: 0 });
  }

  // Optional region filter via query param (e.g. ?region=Europe)
  const { searchParams } = new URL(request.url);
  const regionFilter = searchParams.get('region');

  // Fetch active confirmed subscribers with their unsubscribe tokens
  let query = supabase
    .from('newsletter_subscribers' as never)
    .select('email, unsubscribe_token')
    .eq('status', 'active');

  if (regionFilter) {
    query = query.eq('region', regionFilter) as any;
  }

  const { data: subscribers, error: fetchError } = await query as any;

  if (fetchError || !subscribers) {
    return NextResponse.json({ error: 'Failed to fetch subscribers', details: fetchError?.message }, { status: 500 });
  }

  const subs = subscribers as { email: string; unsubscribe_token: string }[];

  if (subs.length === 0) {
    return NextResponse.json({ message: 'No subscribers', sent: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subs.length; i += BATCH_SIZE) {
    const batch = subs.slice(i, i + BATCH_SIZE);

    try {
      await resend.batch.send(
        batch.map((sub) => ({
          from: 'Investigator Events <weekly@investigatorevents.com>',
          to: sub.email,
          subject: `Weekly Briefing — ${upcoming.length} upcoming event${upcoming.length !== 1 ? 's' : ''}, ${newlyAdded.length} newly added`,
          html: buildWeeklyNewsletterHtml({ upcoming, newlyAdded, featured, unsubscribeToken: sub.unsubscribe_token }),
        }))
      );
      sent += batch.length;
    } catch (err: any) {
      console.error(`Batch send failed (${i}-${i + batch.length}):`, err.message);
      failed += batch.length;
    }
  }

  // Log the send
  await supabase.from('newsletter_sends' as never).insert({
    sent_at: new Date().toISOString(),
    recipient_count: sent,
    failed_count: failed,
    upcoming_count: upcoming.length,
    new_count: newlyAdded.length,
    featured_count: featured.length,
  } as never);

  return NextResponse.json({
    message: 'Newsletter sent',
    sent,
    failed,
    total: subs.length,
    content: { upcoming: upcoming.length, newlyAdded: newlyAdded.length, featured: featured.length },
  });
}
