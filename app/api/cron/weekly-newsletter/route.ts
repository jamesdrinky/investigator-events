import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { fetchAllEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { buildWeeklyNewsletterHtml } from '@/lib/email/weekly-newsletter';
import { isFeatureEnabled } from '@/lib/data/feature-flags';
import { buildRotatingWeeklySubject, getWeeklyNewsletterAppPush, getWeeklyNewsletterEdition, getWeeklyNewsletterSubject } from '@/lib/email/newsletter-editions';
import { fetchCurrentEditorial } from '@/lib/email/weekly-editorial';
import { verifyCronSecret } from '@/lib/security/server';

const BATCH_SIZE = 50;

export async function GET(request: Request) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

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

  const { searchParams } = new URL(request.url);
  const edition = getWeeklyNewsletterEdition(searchParams.get('edition'));
  const editorial = await fetchCurrentEditorial(supabase);
  const heroDaysAway = heroEvent
    ? Math.ceil((new Date(`${heroEvent.date}T00:00:00Z`).getTime() - Date.now()) / 86400000)
    : undefined;
  const fallbackSubject = buildRotatingWeeklySubject(
    {
      heroTitle: heroEvent?.title,
      heroDaysAway,
      otherCount: Math.max(0, upcoming.length + newlyAdded.length - 1),
      cities: [...new Set(upcoming.map((e) => e.city).filter(Boolean))] as string[],
      countries,
      upcomingCount: upcoming.length,
    },
    editorial?.subjectOverride
  );
  // OFF by default — flip the newsletter_referral flag once wording is approved.
  const referralBlock = await isFeatureEnabled('newsletter_referral', false);
  const subject = getWeeklyNewsletterSubject(edition, fallbackSubject);
  const appPush = getWeeklyNewsletterAppPush(edition);

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

  type RecipientResult = { email: string; status: 'sent' | 'failed'; error?: string };
  const results: RecipientResult[] = [];

  for (let i = 0; i < subs.length; i += BATCH_SIZE) {
    const batch = subs.slice(i, i + BATCH_SIZE);

    try {
      await resend.batch.send(
        batch.map((sub) => ({
          from: 'Investigator Events <weekly@investigatorevents.com>',
          to: sub.email,
          subject,
          html: buildWeeklyNewsletterHtml({
            upcoming,
            newlyAdded,
            featured,
            recentlyPast,
            unsubscribeToken: sub.unsubscribe_token,
            appPush,
            editorial,
            referralBlock,
          }),
        }))
      );
      for (const sub of batch) results.push({ email: sub.email, status: 'sent' });
    } catch (err: any) {
      const errMsg = err?.message ?? 'unknown error';
      console.error(`Batch send failed (${i}-${i + batch.length}):`, errMsg);
      for (const sub of batch) results.push({ email: sub.email, status: 'failed', error: errMsg });
    }
  }

  const sent = results.filter((r) => r.status === 'sent').length;
  const failed = results.filter((r) => r.status === 'failed').length;

  // Log the send: aggregate row in newsletter_sends + per-recipient rows in newsletter_send_recipients.
  const { data: sendRow } = await (supabase.from('newsletter_sends' as never).insert({
    sent_at: new Date().toISOString(),
    recipient_count: sent,
    failed_count: failed,
    upcoming_count: upcoming.length,
    new_count: newlyAdded.length,
    featured_count: featured.length,
  } as never).select('id').single() as any);

  const sendId = (sendRow as { id: string } | null)?.id;
  if (sendId && results.length > 0) {
    const sentAt = new Date().toISOString();
    const rows = results.map((r) => ({
      send_id: sendId,
      email: r.email,
      status: r.status,
      error: r.error ?? null,
      sent_at: sentAt,
    }));
    const { error: recipErr } = await (supabase.from('newsletter_send_recipients' as never).insert(rows as never) as any);
    if (recipErr) console.error('Failed to log per-recipient rows:', recipErr.message);
  }

  // Cross-publish the hand-written editorial to The Brief so each week's
  // commentary survives the inbox. Skipped when there's no editorial row.
  if (sent > 0 && editorial?.introText?.trim()) {
    const weekOf = editorial.weekOf || new Date().toISOString().slice(0, 10);
    const articleSlug = `weekly-briefing-${weekOf}`;
    const bodyParts = [editorial.introText.trim()];
    if (editorial.spotlightTitle?.trim() && editorial.spotlightBody?.trim()) {
      bodyParts.push(`## ${editorial.spotlightTitle.trim()}`, editorial.spotlightBody.trim());
    }
    const { error: articleErr } = await (supabase.from('articles' as never).upsert({
      slug: articleSlug,
      title: subject,
      dek: `The weekly briefing for the week of ${weekOf}.`,
      body: bodyParts.join('\n\n'),
      category: 'Industry news',
      author_name: editorial.introByline?.split('·')[0]?.trim() || 'Investigator Events',
      author_title: editorial.introByline?.split('·')[1]?.trim() || null,
      source: 'newsletter',
      status: 'published',
      published_at: new Date().toISOString(),
    } as never, { onConflict: 'slug' } as never) as any);
    if (articleErr) console.error('Failed to cross-publish editorial to The Brief:', articleErr.message);
  }

  return NextResponse.json({
    message: 'Newsletter sent',
    sent,
    failed,
    total: subs.length,
    content: { upcoming: upcoming.length, newlyAdded: newlyAdded.length, featured: featured.length },
  });
}
