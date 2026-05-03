import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { fetchAllEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { buildWeeklyNewsletterHtml } from '@/lib/email/weekly-newsletter';
import { verifyCronSecret } from '@/lib/security/server';

const ALLOWED_RECIPIENTS = new Set([
  'james@drinky.com',
  'info@investigatorevents.com',
  'm.lacorte@conflictinternational.com',
]);

export async function GET(request: Request) {
  // Only allow in development or with CRON_SECRET
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    // Support both header and query param auth for browser access
    const { searchParams } = new URL(request.url);
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

  const html = buildWeeklyNewsletterHtml({
    upcoming,
    newlyAdded,
    featured,
    recentlyPast,
    unsubscribeToken: 'preview-token',
  });

  const { searchParams } = new URL(request.url);
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

    const subject = heroEvent
      ? `${heroEvent.title} + ${Math.max(0, upcoming.length + newlyAdded.length - 1)} more — Weekly Briefing`
      : `Weekly Briefing — ${upcoming.length} event${upcoming.length !== 1 ? 's' : ''} across ${countries} countries`;

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
