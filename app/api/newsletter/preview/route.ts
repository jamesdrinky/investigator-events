import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { fetchAllEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { buildWeeklyNewsletterHtml } from '@/lib/email/weekly-newsletter';
import { isFeatureEnabled } from '@/lib/data/feature-flags';
import { buildRotatingWeeklySubject, getWeeklyNewsletterAppPush, getWeeklyNewsletterEdition, getWeeklyNewsletterSubject } from '@/lib/email/newsletter-editions';
import { fetchCurrentEditorial } from '@/lib/email/weekly-editorial';
import { verifyCronSecret } from '@/lib/security/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

const ALLOWED_RECIPIENTS = new Set([
  'james@drinky.com',
  'info@investigatorevents.com',
  'm.lacorte@conflictinternational.com',
  'jamesdrinky@yahoo.com',
]);

export async function GET(request: Request) {
  // Only allow in development or with CRON_SECRET
  const isDev = process.env.NODE_ENV === 'development';

  const { searchParams } = new URL(request.url);

  if (!isDev) {
    // Support both header and query param auth for browser access
    const queryPassword = searchParams.get('password');
    if (queryPassword && queryPassword === process.env.CRON_SECRET) {
      // Authenticated via query param
    } else {
      const authError = verifyCronSecret(request);
      if (authError) return authError;
    }
  }

  const events = await fetchAllEvents();
  const { upcoming, newlyAdded, featured, recentlyPast } = getWeeklyCollections(events);

  const appPushParam = searchParams.get('appPush');
  const regionParam = searchParams.get('region');
  const region = regionParam === 'eu-pending' ? ('eu-pending' as const) : ('available' as const);
  const edition = getWeeklyNewsletterEdition(searchParams.get('edition'));
  const appPush: { size: 'hero' | 'compact'; region: 'available' | 'eu-pending' } | null =
    appPushParam === 'hero' ? { size: 'hero', region }
    : appPushParam === 'compact' ? { size: 'compact', region }
    : getWeeklyNewsletterAppPush(edition);

  const editorial = await fetchCurrentEditorial(createSupabaseAdminServerClient());

  // ?referral=1 forces the block on so it can be reviewed before the flag flips.
  const referralBlock = searchParams.get('referral') === '1' || (await isFeatureEnabled('newsletter_referral', false));
  const html = buildWeeklyNewsletterHtml({
    upcoming,
    newlyAdded,
    featured,
    recentlyPast,
    unsubscribeToken: 'preview-token',
    appPush,
    editorial,
    referralBlock,
  });

  const sendTo = searchParams.get('send');

  // If ?send=email@example.com, actually send the email via Resend
  if (sendTo && !ALLOWED_RECIPIENTS.has(sendTo.toLowerCase())) {
    return NextResponse.json({ error: 'Recipient not in allowed list' }, { status: 403 });
  }

  if (sendTo) {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const resend = new Resend(resendKey);
    const heroEvent = featured[0] ?? upcoming[0];
    const countries = new Set([...upcoming, ...newlyAdded].map(e => e.country)).size;
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
    const subject = getWeeklyNewsletterSubject(edition, fallbackSubject);

    await resend.emails.send({
      from: 'Investigator Events <weekly@investigatorevents.com>',
      to: sendTo,
      subject: `[TEST] ${subject}`,
      html,
    });

    return NextResponse.json({ message: `Test email sent to ${sendTo}`, subject });
  }

  // Otherwise return HTML preview
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
