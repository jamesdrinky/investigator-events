import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { enforceRateLimit } from '@/lib/security/server';
import { buildSubmissionConfirmationEmail } from '@/lib/email/submission-confirmation';
import { buildWelcomeEmail } from '@/lib/email/welcome-email';
import { buildApprovalOutreachEmail } from '@/lib/email/association-outreach';
import { buildDailyDigestEmail } from '@/lib/email/daily-digest';

const ALLOWED_RECIPIENTS = new Set([
  'james@drinky.com',
  'info@investigatorevents.com',
  'm.lacorte@conflictinternational.com',
]);

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
    subject: '[TEST] WAD Annual Conference 2026 is live on Investigator Events',
    html: buildApprovalOutreachEmail({
      contactEmail: '',
      contactName: 'Charlotte Notley',
      eventName: 'WAD Annual Conference 2026',
      association: 'World Association of Detectives',
    }),
  }),
  digest: () => ({
    subject: '[TEST] 6 new notifications on Investigator Events',
    html: buildDailyDigestEmail('James', [
      { type: 'follow', actorName: 'Mike LaCorte', actorAvatar: 'https://investigatorevents.com/faces/mike2.png', actorUsername: 'mike-lacorte', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
      { type: 'connection_request', actorName: 'Charlotte Notley', actorAvatar: null, actorUsername: 'charlotte-notley', createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
      { type: 'post_like', actorName: 'Mike LaCorte', actorAvatar: 'https://investigatorevents.com/faces/mike2.png', actorUsername: 'mike-lacorte', createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
      { type: 'follow', actorName: 'Peter Coleman', actorAvatar: null, actorUsername: 'peter-coleman', createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
      { type: 'post_comment', actorName: 'Charlotte Notley', actorAvatar: null, actorUsername: 'charlotte-notley', createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
      { type: 'connection_accepted', actorName: 'Robert Fried', actorAvatar: null, actorUsername: 'robert-fried', createdAt: new Date(Date.now() - 7 * 3600000).toISOString() },
    ]),
  }),
};

export async function GET(request: Request) {
  try {
    enforceRateLimit('test-email', { maxRequests: 10, windowMs: 60_000 });
  } catch {
    return NextResponse.json({ error: 'Too many requests — slow down' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') as keyof typeof TEMPLATES;
  const to = searchParams.get('to')?.trim().toLowerCase();
  const password = searchParams.get('password');

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!to || !ALLOWED_RECIPIENTS.has(to)) {
    return NextResponse.json({
      error: `Can only send test emails to: ${[...ALLOWED_RECIPIENTS].join(', ')}`,
    }, { status: 403 });
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
