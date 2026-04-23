import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { enforceRateLimit } from '@/lib/security/server';
import { buildSubmissionConfirmationEmail } from '@/lib/email/submission-confirmation';
import { buildWelcomeEmail } from '@/lib/email/welcome-email';
import { buildApprovalOutreachEmail } from '@/lib/email/association-outreach';
import { buildDailyDigestEmail } from '@/lib/email/daily-digest';
import { buildWeeklyNewsletterHtml } from '@/lib/email/weekly-newsletter';
import type { EventItem } from '@/lib/data/events';

const sampleEvents: EventItem[] = [
  { id: '1', title: 'WAD Annual Conference 2026', slug: 'wad-annual-conference-2026', eventScope: 'main', date: '2026-05-15', endDate: '2026-05-17', city: 'Amsterdam', region: 'Europe', country: 'Netherlands', organiser: 'World Association of Detectives', association: 'WAD', category: 'Conference', description: '', website: 'https://wad.net', featured: true },
  { id: '2', title: 'ABI Annual Conference 2026', slug: 'abi-annual-conference-2026', eventScope: 'main', date: '2026-05-22', city: 'London', region: 'Europe', country: 'United Kingdom', organiser: 'Association of British Investigators', association: 'ABI', category: 'Conference', description: '', website: 'https://theabi.org.uk', featured: false },
  { id: '3', title: 'IKD Jahrestagung 2026', slug: 'ikd-jahrestagung-2026', eventScope: 'main', date: '2026-06-10', endDate: '2026-06-12', city: 'Munich', region: 'Europe', country: 'Germany', organiser: 'Internationales Kartell der Detektive', association: 'IKD', category: 'Conference', description: '', website: 'https://ikd.net', featured: false },
  { id: '4', title: 'ACFE Global Fraud Conference', slug: 'acfe-global-fraud-conference', eventScope: 'main', date: '2026-06-21', endDate: '2026-06-26', city: 'Nashville', region: 'North America', country: 'United States', organiser: 'ACFE', category: 'Conference', description: '', website: 'https://acfe.com', featured: true },
  { id: '5', title: 'SPI Symposium 2026', slug: 'spi-symposium-2026', eventScope: 'main', date: '2026-07-08', city: 'New York', region: 'North America', country: 'United States', organiser: 'Society of Professional Investigators', association: 'SPI', category: 'Seminar', description: '', website: 'https://spinyc.org', featured: false },
];

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
    subject: '[TEST] 4 new notifications on Investigator Events',
    html: buildDailyDigestEmail('James', [
      { type: 'follow', actorName: 'Mike LaCorte', actorAvatar: 'https://investigatorevents.com/faces/mike2.png', actorUsername: 'mike-lacorte', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
      { type: 'connection_request', actorName: 'Charlotte Notley', actorAvatar: 'https://dbeyznsxcetpwfcicimz.supabase.co/storage/v1/object/public/avatars/ad551a2d-c5cf-4a0c-8c9f-f97e4b77acd3/avatar.jpg', actorUsername: 'charlotte-notley', createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
      { type: 'post_like', actorName: 'Robert Fried', actorAvatar: 'https://dbeyznsxcetpwfcicimz.supabase.co/storage/v1/object/public/avatars/6c1ea32e-8d2f-498a-9177-05dbdfca7556/avatar.jpg', actorUsername: 'robert-fried', createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
      { type: 'post_comment', actorName: 'Charlotte Notley', actorAvatar: 'https://dbeyznsxcetpwfcicimz.supabase.co/storage/v1/object/public/avatars/ad551a2d-c5cf-4a0c-8c9f-f97e4b77acd3/avatar.jpg', actorUsername: 'charlotte-notley', createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    ]),
  }),
  weekly: () => ({
    subject: '[TEST] Weekly Briefing — 5 upcoming events, 3 newly added',
    html: buildWeeklyNewsletterHtml({
      upcoming: sampleEvents,
      newlyAdded: sampleEvents.slice(2),
      featured: sampleEvents.filter(e => e.featured),
      recentlyPast: [],
    }),
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
