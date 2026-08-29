// Annotated review batch: every email the system can produce, each preceded by
// a developer note, with multi-step sequences stacked into a single message.
//
//   npx tsx scripts/send-email-review-batch.ts             # dry run
//   npx tsx scripts/send-email-review-batch.ts --send      # deliver
//   npx tsx scripts/send-email-review-batch.ts --send --gap 5   # 5s between sends
//
// Recipient is a hardcoded constant. This script never queries for recipients,
// so it cannot reach a subscriber list, an association or a member.
import { config } from 'dotenv';
config({ path: '.env.local' });
import { Resend } from 'resend';
import { devNoteBanner, stepDivider, innerBody, shell, type DevNote } from '../lib/email/dev-annotate';

const REVIEWER = 'james@drinky.com';
const toArg = process.argv.indexOf('--to');
const TO = toArg !== -1 ? process.argv[toArg + 1] : REVIEWER;
const gapArg = process.argv.indexOf('--gap');
const GAP_MS = (gapArg !== -1 ? Number(process.argv[gapArg + 1]) : 3) * 1000;
const LIVE = process.argv.includes('--send');
const FROM = 'Investigator Events <info@investigatorevents.com>';
const SITE = 'https://www.investigatorevents.com';

interface Entry {
  title: string;
  subject: string;
  note: DevNote;
  /** One rendered email, or several to stack as a sequence. */
  parts: () => Promise<Array<{ label: string; sub: string; html: string }>> | Array<{ label: string; sub: string; html: string }>;
}

async function collect(): Promise<Entry[]> {
  const { buildWelcomeEmail } = await import('../lib/email/welcome-email');
  const { buildConfirmationEmail } = await import('../lib/email/confirmation-email');
  const { buildNewsletterVerifyReminderEmail } = await import('../lib/email/newsletter-verify-reminder');
  const { buildNewsletterOptInPitchEmail } = await import('../lib/email/newsletter-opt-in-pitch');
  const { buildWriteForBriefEmail } = await import('../lib/email/write-for-brief');
  const { buildSubmissionConfirmationEmail, buildSubmissionApprovedEmail, buildSubmissionRejectedEmail } =
    await import('../lib/email/submission-confirmation');
  const { buildVideoReminderEmail, VIDEO_REMINDER_STEPS } = await import('../lib/email/video-reminder');
  const { buildApprovalOutreachEmail, buildIntroductionOutreachEmail, buildColdOutreachEmail } =
    await import('../lib/email/association-outreach');
  const { buildVideoInviteEmail, DEFAULT_VIDEO_INVITE_BODY, DEFAULT_VIDEO_INVITE_SUBJECT } =
    await import('../lib/email/video-invite');
  const { buildDailyDigestEmail } = await import('../lib/email/daily-digest');
  const { buildCreateAccountPitchEmail } = await import('../lib/email/create-account-pitch');
  const { buildAppLaunchAnnounceEmail } = await import('../lib/email/app-launch-announce');
  const { buildReengagementEmail } = await import('../lib/email/reengagement');
  const { buildAdminAlertEmail } = await import('../lib/email/admin-alert');

  const EVENT = 'WAD Conference 2026';
  const URL_ = `${SITE}/events/wad-conference-2026`;
  const one = (html: string) => [{ label: '', sub: '', html }];

  const entries: Entry[] = [
    {
      title: 'Event submission journey',
      subject: 'Event submission — all four states',
      note: {
        what: 'Every email an organiser can receive from submitting one event.',
        trigger: 'Submitting the form, then an admin approving or rejecting in /admin.',
        audience: 'The person who submitted the event.',
        status: 'LIVE. The video offer on approval is new this week.',
        file: 'lib/email/submission-confirmation.ts',
      },
      parts: () => [
        { label: '1 — On submission', sub: 'Immediate. Confirms we have it.', html: buildSubmissionConfirmationEmail(EVENT) },
        { label: '2 — On approval, WITH video offer', sub: 'What organisers get now. Carries the share block AND the video ask.', html: buildSubmissionApprovedEmail(EVENT, URL_, `${URL_}/submit-video`) },
        { label: '3 — On approval, no video offer', sub: 'Fallback when the event has no slug to upload against.', html: buildSubmissionApprovedEmail(EVENT, URL_) },
        { label: '4 — On rejection', sub: 'Sent instead of 2 or 3.', html: buildSubmissionRejectedEmail(EVENT, 'We could not verify this event with the organiser.') },
      ],
    },
    {
      title: 'Video reminder sequence (all 4 nudges)',
      subject: 'Video reminders — the full 4-week sequence',
      note: {
        what: 'Four escalating nudges asking an organiser to send a promo video.',
        trigger: 'Booked when an event is approved. Fires day 7, 14, 21, 28.',
        audience: 'The event organiser. Stops dead the moment any video arrives.',
        status: 'DISARMED — video_reminders flag is false. Nothing will send until you flip it.',
        file: 'lib/email/video-reminder.ts',
      },
      parts: () => VIDEO_REMINDER_STEPS.map((s) => ({
        label: `Day ${s.afterDays} — nudge ${s.step} of 4`,
        sub: s.subject(EVENT),
        html: buildVideoReminderEmail({
          eventName: EVENT, recipientName: 'Mike', uploadUrl: `${URL_}/submit-video`,
          optOutUrl: `${SITE}/api/video-reminders/stop?token=PREVIEW`,
          lead: s.lead(EVENT),
          isFinal: s.step === VIDEO_REMINDER_STEPS[VIDEO_REMINDER_STEPS.length - 1].step,
        }),
      })),
    },
    {
      title: 'Association outreach (4 variants)',
      subject: 'Association outreach — all variants',
      note: {
        what: 'The emails we send TO associations, rather than to members.',
        trigger: 'Approval outreach is automatic; the rest are sent by hand from /admin.',
        audience: "The association's own published contact — never the submitter (fixed today).",
        status: 'Approval outreach LIVE. Video invite built but NEVER SENT — 0 to date, 17 targets waiting on Mike.',
        file: 'lib/email/association-outreach.ts, lib/email/video-invite.ts',
      },
      parts: () => [
        { label: '1 — Approval outreach', sub: 'Automatic, 2-6h after approval. Now only when the association contact differs from the submitter.', html: buildApprovalOutreachEmail({ contactEmail: TO, contactName: 'Mike', eventName: EVENT, association: 'WAD', region: 'International' }) },
        { label: '2 — Introduction', sub: 'For associations whose events we added for them.', html: buildIntroductionOutreachEmail({ contactName: 'Mike', association: 'WAD', eventNames: [EVENT], eventSlugs: ['wad-conference-2026'], memberCount: 39, slug: 'wad' }) },
        { label: '3 — Cold', sub: 'First contact. Contains the platform-scale claim we corrected today.', html: buildColdOutreachEmail({ contactName: 'Mike', association: 'WAD', slug: 'wad', memberCount: 39 }) },
        { label: '4 — Video invite', sub: 'The cold video ask. Body is editable in the admin composer; this is the default.', html: buildVideoInviteEmail({ recipientName: 'Mike', association: 'WAD', conference: EVENT, subject: DEFAULT_VIDEO_INVITE_SUBJECT, bodyText: DEFAULT_VIDEO_INVITE_BODY, video: null, sender: 'mike' }) },
      ],
    },
    {
      title: 'Newsletter re-permission — 110 people',
      subject: 'CAMPAIGN: re-permission (110 recipients)',
      note: {
        what: 'Asks people who never confirmed to confirm now.',
        trigger: 'Manual: scripts/send-verify-reminder.ts --send',
        audience: '110 subscribers stuck at status=pending, some since April.',
        status: 'NOT SENT. Awaiting your go. Safe to send — /api/newsletter/confirm is live.',
        file: 'lib/email/newsletter-verify-reminder.ts',
      },
      parts: () => one(buildNewsletterVerifyReminderEmail('PREVIEW-TOKEN', 'James')),
    },
    {
      title: 'Member newsletter invite — 52 people',
      subject: 'CAMPAIGN: member invite (52 recipients)',
      note: {
        what: 'Invites members who were never asked about the newsletter.',
        trigger: 'Manual: scripts/send-member-newsletter-invite.ts --send',
        audience: '49 OAuth signups never shown a checkbox + 3 from before it existed. Excludes the 8 who unticked.',
        status: 'NOT SENT. One-click route is now live in prod.',
        file: 'lib/email/newsletter-opt-in-pitch.ts',
      },
      parts: () => one(buildNewsletterOptInPitchEmail(`${SITE}/api/newsletter/opt-in?token=PREVIEW`, 'James')),
    },
    {
      title: 'Write for The Brief — 274 people',
      subject: 'CAMPAIGN: write-for-brief (274 recipients)',
      note: {
        what: 'Mike’s "the box" — asks everyone to publish in The Brief.',
        trigger: 'Manual: scripts/send-write-for-brief.ts --send',
        audience: '203 active subscribers + members, deduped, respects email prefs.',
        status: 'NOT SENT. Largest list — send this one LAST for deliverability.',
        file: 'lib/email/write-for-brief.ts',
      },
      parts: () => one(buildWriteForBriefEmail({ recipientName: 'James', associationSlug: 'wad', unsubscribeUrl: `${SITE}/api/newsletter/unsubscribe?token=PREVIEW` })),
    },
    {
      title: 'Weekly newsletter',
      subject: 'Weekly newsletter — real data, sends Monday 08:00 UTC',
      note: {
        what: 'The Monday newsletter, rendered from live events right now.',
        trigger: 'Cron, every Monday 08:00 UTC. Sends itself.',
        audience: '203 active subscribers.',
        status: 'LIVE and automatic. Now includes the new "From The Brief" block.',
        file: 'lib/email/weekly-newsletter.ts',
      },
      parts: async () => {
        const { getWeeklyCollections } = await import('../lib/data/weekly');
        const { buildWeeklyNewsletterHtml } = await import('../lib/email/weekly-newsletter');
        const { fetchPublishedArticles } = await import('../lib/data/articles');
        const { mapEventRowToItem } = await import('../lib/data/events');
        const { createSupabaseAdminServerClient } = await import('../lib/supabase/admin');
        const sb = createSupabaseAdminServerClient();
        const { data: rows } = await (sb.from('events' as never).select('*').order('start_date', { ascending: true }) as any);
        const events = ((rows ?? []) as any[]).filter((r) => r.approved !== false).map(mapEventRowToItem).filter((e: any) => e !== null) as any[];
        const { upcoming, newlyAdded, featured, recentlyPast } = getWeeklyCollections(events);
        const articles = await fetchPublishedArticles();
        return one(buildWeeklyNewsletterHtml({
          upcoming, newlyAdded, featured, recentlyPast, unsubscribeToken: 'PREVIEW',
          articles: articles.slice(0, 3).map((a) => ({ slug: a.slug, title: a.title, dek: a.dek, category: a.category })),
        }));
      },
    },
    {
      title: 'Welcome',
      subject: 'Welcome email',
      note: { what: 'First email a new member gets.', trigger: 'Account creation.', audience: 'Every new member.', status: 'LIVE.', file: 'lib/email/welcome-email.ts' },
      parts: () => one(buildWelcomeEmail('James Drinkwater')),
    },
    {
      title: 'Newsletter confirmation (double opt-in)',
      subject: 'Newsletter confirmation',
      note: { what: 'The confirm-your-subscription click that makes consent valid.', trigger: 'Anyone submitting the newsletter form.', audience: 'New subscribers, status=pending until clicked.', status: 'LIVE. Do not remove — this is what makes the list lawful.', file: 'lib/email/confirmation-email.ts' },
      parts: () => one(buildConfirmationEmail('PREVIEW-TOKEN')),
    },
    {
      title: 'Re-engagement',
      subject: 'Re-engagement email',
      note: { what: 'Wins back members who have not visited in a while.', trigger: 'Manual from /admin (reengage tab).', audience: 'Lapsed members.', status: 'LIVE, manually triggered. Green verified pill is the one you flagged.', file: 'lib/email/reengagement.ts' },
      parts: () => one(buildReengagementEmail({
        fullName: 'James Drinkwater', username: 'james', completionScore: 60,
        missingItems: [{ label: 'Add your specialisation', href: `${SITE}/profile/edit` }],
        isLinkedInVerified: true, isManuallyVerified: false, daysSinceLastSeen: 21,
        eventsMode: 'upcoming', eventsTotalCount: 12,
        events: [{ title: EVENT, slug: 'wad-conference-2026', city: 'Cannes', country: 'France', startDate: '2026-09-01', imagePath: '/cities/beach.jpg' }],
        associationsMode: 'featured', associationsTotalCount: 54,
        associations: [{ name: 'WAD', slug: 'wad', logoUrl: '/associations/wad.png' }],
        hasOwnAssociations: false, unsubscribeToken: 'PREVIEW',
      })),
    },
    {
      title: 'Daily digest',
      subject: 'Daily activity digest',
      note: { what: 'Batches a day of notifications into one email.', trigger: 'Daily cron, 18:00 UTC.', audience: 'Members with unread notifications who have not muted them.', status: 'LIVE and automatic.', file: 'lib/email/daily-digest.ts' },
      parts: () => one(buildDailyDigestEmail('James', [
        { type: 'follow', actorName: 'Mike LaCorte', actorAvatar: null, actorUsername: 'mike', createdAt: new Date().toISOString() },
        { type: 'connection_request', actorName: 'Sarah Chen', actorAvatar: null, actorUsername: 'sarah', createdAt: new Date().toISOString() },
      ])),
    },
    {
      title: 'Create-account pitch',
      subject: 'Create-account pitch',
      note: { what: 'Pushes people with an email but no profile to sign up.', trigger: 'Manual from /admin.', audience: 'Contacts without an account.', status: 'LIVE, manually triggered.', file: 'lib/email/create-account-pitch.ts' },
      parts: () => one(buildCreateAccountPitchEmail('James')),
    },
    {
      title: 'App launch announcement',
      subject: 'App launch announcement',
      note: { what: 'One-off announcing the iOS app.', trigger: 'Manual broadcast.', audience: 'All members.', status: 'Already used for iOS. Reusable for the Android launch.', file: 'lib/email/app-launch-announce.ts' },
      parts: () => one(buildAppLaunchAnnounceEmail({ fullName: 'James Drinkwater' })),
    },
    {
      title: 'Admin alert',
      subject: 'Admin alert (internal)',
      note: { what: 'Internal notification when something needs review.', trigger: 'Story submissions, advertiser enquiries, etc.', audience: 'You, not members.', status: 'LIVE.', file: 'lib/email/admin-alert.ts' },
      parts: () => one(buildAdminAlertEmail({
        heading: 'New story for The Brief', intro: 'A member submitted a story for review.',
        rows: [{ label: 'Title', value: 'Inside the WAD conference' }, { label: 'Author', value: 'James Drinkwater' }],
        cta: { label: 'Review in admin', url: `${SITE}/admin/news` },
      })),
    },
  ];

  return entries;
}

async function main() {
  const entries = await collect();
  console.log(`emails: ${entries.length}  |  to: ${TO}  |  gap: ${GAP_MS / 1000}s  |  mode: ${LIVE ? '🚨 SENDING' : 'DRY RUN'}`);
  entries.forEach((e, n) => console.log(`  ${String(n + 1).padStart(2)}. ${e.title}`));
  if (!LIVE) { console.log('\nDRY RUN — re-run with --send to deliver.'); return; }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  let sent = 0, failed = 0;
  for (const [n, entry] of entries.entries()) {
    try {
      const parts = await entry.parts();
      const body = parts
        .map((p) => (p.label ? stepDivider(p.label, p.sub) : '') + innerBody(p.html))
        .join('');
      const html = shell(devNoteBanner(n + 1, entries.length, entry.title, entry.note) + body);
      await resend.emails.send({
        from: FROM, to: TO,
        subject: `[${n + 1}/${entries.length}] ${entry.subject}`,
        html,
      });
      sent++;
      console.log(`  sent ${n + 1}/${entries.length}  ${entry.title}${parts.length > 1 ? ` (${parts.length} stacked)` : ''}`);
    } catch (e) {
      failed++;
      console.error(`  FAIL ${entry.title}`, e);
    }
    await new Promise((r) => setTimeout(r, GAP_MS));
  }
  console.log(JSON.stringify({ sent, failed, to: TO }));
}

main().catch((e) => { console.error(e); process.exit(1); });
