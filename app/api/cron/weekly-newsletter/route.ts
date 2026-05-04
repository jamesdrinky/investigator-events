import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { fetchAllEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { buildWeeklyNewsletterHtml } from '@/lib/email/weekly-newsletter';
import { verifyCronSecret } from '@/lib/security/server';

const BATCH_SIZE = 50;

export async function GET(request: Request) {
  // Support query param auth for manual triggers
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('password');
  if (querySecret && querySecret === process.env.CRON_SECRET) {
    // Authenticated via query param
  } else {
    const authError = verifyCronSecret(request);
    if (authError) return authError;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const resend = new Resend(resendKey);
  const supabase = createSupabaseAdminServerClient();

  const events = await fetchAllEvents();
  const { upcoming, newlyAdded, featured, recentlyPast, hasFreshActivity } = getWeeklyCollections(events);
  const heroEvent = featured[0] ?? upcoming[0];
  const countries = new Set([...upcoming, ...newlyAdded].map(e => e.country)).size;

  if (!hasFreshActivity) {
    return NextResponse.json({ message: 'No fresh activity, skipping send', sent: 0 });
  }

  // Skip if already sent in the last 6 days (prevents double-send from manual + cron)
  const { data: recentSend } = await supabase
    .from('newsletter_sends' as never)
    .select('id, sent_at')
    .gte('sent_at', new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString())
    .order('sent_at', { ascending: false })
    .limit(1)
    .maybeSingle() as any;

  if (recentSend && !searchParams.get('force')) {
    return NextResponse.json({ message: 'Already sent this week', lastSent: recentSend.sent_at, sent: 0 });
  }

  // Optional region filter via query param (e.g. ?region=Europe)
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
    console.error('Failed to fetch subscribers:', fetchError?.message);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
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
          subject: heroEvent
            ? `${heroEvent.title} + ${Math.max(0, upcoming.length + newlyAdded.length - 1)} more — Weekly Briefing`
            : `Weekly Briefing — ${upcoming.length} event${upcoming.length !== 1 ? 's' : ''} across ${countries} countries`,
          html: buildWeeklyNewsletterHtml({ upcoming, newlyAdded, featured, recentlyPast, unsubscribeToken: sub.unsubscribe_token }),
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
