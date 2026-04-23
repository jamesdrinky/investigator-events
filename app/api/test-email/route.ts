import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { buildSubmissionConfirmationEmail } from '@/lib/email/submission-confirmation';
import { buildWelcomeEmail } from '@/lib/email/welcome-email';
import { buildApprovalOutreachEmail } from '@/lib/email/association-outreach';

const TEMPLATES = {
  submission: () => ({
    subject: '[TEST] Event received — ACFE Annual Conference 2026',
    html: buildSubmissionConfirmationEmail('ACFE Annual Conference 2026'),
  }),
  welcome: () => ({
    subject: '[TEST] Welcome to Investigator Events',
    html: buildWelcomeEmail('James'),
  }),
  outreach: () => ({
    subject: '[TEST] ACFE Annual Conference 2026 is live on Investigator Events',
    html: buildApprovalOutreachEmail({
      contactEmail: '',
      contactName: 'John Smith',
      eventName: 'ACFE Annual Conference 2026',
      association: 'Association of Certified Fraud Examiners',
    }),
  }),
};

/**
 * Test email endpoint — only works in development or with admin password.
 *
 * Usage:
 *   GET /api/test-email?template=submission&to=your@email.com
 *   GET /api/test-email?template=welcome&to=your@email.com
 *   GET /api/test-email?template=outreach&to=your@email.com
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') as keyof typeof TEMPLATES;
  const to = searchParams.get('to');
  const password = searchParams.get('password');

  // Auth: require admin password
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized — add ?password=YOUR_ADMIN_PASSWORD' }, { status: 401 });
  }

  if (!to) {
    return NextResponse.json({ error: 'Missing ?to=email@example.com' }, { status: 400 });
  }

  if (!template || !TEMPLATES[template]) {
    return NextResponse.json({
      error: `Invalid template. Use one of: ${Object.keys(TEMPLATES).join(', ')}`,
    }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 });
  }

  const resend = new Resend(resendKey);
  const { subject, html } = TEMPLATES[template]();

  const { data, error } = await resend.emails.send({
    from: 'Investigator Events <info@investigatorevents.com>',
    to,
    subject,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data?.id, template, to });
}
