import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { fetchAllEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { buildWeeklyNewsletterHtml } from '@/lib/email/weekly-newsletter';
import { buildNewsletterVerifyReminderEmail } from '@/lib/email/newsletter-verify-reminder';
import { buildNewsletterOptInPitchEmail } from '@/lib/email/newsletter-opt-in-pitch';
import { buildAppLaunchAnnounceEmail, type AppLaunchRegion } from '@/lib/email/app-launch-announce';
import { verifyCronSecret } from '@/lib/security/server';

const SITE = 'https://investigatorevents.com';

const ALLOWED_RECIPIENTS = new Set([
  'james@drinky.com',
  'info@investigatorevents.com',
  'm.lacorte@conflictinternational.com',
  'jamesdrinky@yahoo.com',
]);

type TemplateName = 'newsletter-verify' | 'newsletter-opt-in' | 'app-launch' | 'monday-newsletter';

async function buildTemplate(template: TemplateName, region: AppLaunchRegion) {
  switch (template) {
    case 'newsletter-verify':
      return {
        subject: 'One click to finish your newsletter signup',
        html: buildNewsletterVerifyReminderEmail('preview-token', 'James'),
      };
    case 'newsletter-opt-in':
      return {
        subject: 'Get the Investigator Events weekly briefing',
        html: buildNewsletterOptInPitchEmail(
          `${SITE}/api/newsletter/one-click-subscribe?token=preview-token`,
          'James',
        ),
      };
    case 'app-launch':
      return {
        subject: 'The Investigator Events app is here',
        html: buildAppLaunchAnnounceEmail({ fullName: 'James', region }),
      };
    case 'monday-newsletter': {
      const events = await fetchAllEvents();
      const { upcoming, newlyAdded, featured, recentlyPast } = getWeeklyCollections(events);
      return {
        subject: 'Investigator Events is live on the App Store — Weekly Briefing',
        html: buildWeeklyNewsletterHtml({
          upcoming,
          newlyAdded,
          featured,
          recentlyPast,
          unsubscribeToken: 'preview-token',
          appPush: { size: 'hero', region: region === 'eu-pending' ? 'eu-pending' : 'available' },
        }),
      };
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    const queryPassword = searchParams.get('password');
    if (queryPassword && queryPassword === process.env.CRON_SECRET) {
      // Authenticated via query param
    } else {
      const authError = verifyCronSecret(request);
      if (authError) return authError;
    }
  }

  const template = searchParams.get('template') as TemplateName | null;
  const regionParam = searchParams.get('region');
  const region: AppLaunchRegion = regionParam === 'eu-pending' ? 'eu-pending' : 'available';

  const validTemplates: TemplateName[] = ['newsletter-verify', 'newsletter-opt-in', 'app-launch', 'monday-newsletter'];
  if (!template || !validTemplates.includes(template)) {
    return NextResponse.json({
      error: `Invalid template. Use one of: ${validTemplates.join(', ')}`,
    }, { status: 400 });
  }

  const { subject, html } = await buildTemplate(template, region);

  const sendTo = searchParams.get('send')?.trim().toLowerCase();

  if (sendTo) {
    if (!ALLOWED_RECIPIENTS.has(sendTo)) {
      return NextResponse.json({ error: 'Recipient not in allowed list' }, { status: 403 });
    }
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: 'Investigator Events <info@investigatorevents.com>',
      to: sendTo,
      subject: `[TEST] ${subject}`,
      html,
    });
    return NextResponse.json({ message: `Test email sent to ${sendTo}`, subject, template });
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
