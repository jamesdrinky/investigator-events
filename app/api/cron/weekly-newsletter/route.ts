import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { fetchAllEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { buildWeeklyNewsletterHtml } from '@/lib/email/weekly-newsletter';

const BATCH_SIZE = 50;

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron or an admin
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

  // Fetch events and build content
  const events = await fetchAllEvents();
  const { upcoming, newlyAdded, featured, hasFreshActivity } = getWeeklyCollections(events);

  if (!hasFreshActivity) {
    return NextResponse.json({ message: 'No fresh activity, skipping send', sent: 0 });
  }

  const html = buildWeeklyNewsletterHtml({ upcoming, newlyAdded, featured });

  // Fetch all active subscribers
  const { data: subscribers, error: fetchError } = await supabase
    .from('newsletter_subscribers' as never)
    .select('email')
    .eq('status', 'active');

  if (fetchError || !subscribers) {
    return NextResponse.json({ error: 'Failed to fetch subscribers', details: fetchError?.message }, { status: 500 });
  }

  const emails = (subscribers as unknown as { email: string }[]).map((s) => s.email);

  if (emails.length === 0) {
    return NextResponse.json({ message: 'No subscribers', sent: 0 });
  }

  // Send in batches
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    try {
      await resend.batch.send(
        batch.map((email) => ({
          from: 'Investigator Events <weekly@investigatorevents.com>',
          to: email,
          subject: `Weekly Briefing — ${upcoming.length} upcoming event${upcoming.length !== 1 ? 's' : ''}, ${newlyAdded.length} newly added`,
          html,
        }))
      );
      sent += batch.length;
    } catch (err: any) {
      console.error(`Batch send failed (${i}-${i + batch.length}):`, err.message);
      failed += batch.length;
    }
  }

  return NextResponse.json({
    message: 'Newsletter sent',
    sent,
    failed,
    total: emails.length,
    content: { upcoming: upcoming.length, newlyAdded: newlyAdded.length, featured: featured.length },
  });
}
