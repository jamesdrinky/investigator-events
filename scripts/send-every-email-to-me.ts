// Send one of EVERY email the system can produce, to a single reviewer inbox.
//
//   npx tsx scripts/send-every-email-to-me.ts              # dry run: lists them
//   npx tsx scripts/send-every-email-to-me.ts --send       # deliver to REVIEWER
//   npx tsx scripts/send-every-email-to-me.ts --send --to a@b.com
//
// The recipient is a single hardcoded address. This script cannot touch a
// subscriber list, an association, or any member — it never queries for
// recipients. Subjects are prefixed [TEST] so a stray forward is obvious.
import { config } from 'dotenv';
config({ path: '.env.local' });
import { Resend } from 'resend';

const REVIEWER = 'james@drinky.com';
const toArg = process.argv.indexOf('--to');
const TO = toArg !== -1 ? process.argv[toArg + 1] : REVIEWER;
const LIVE = process.argv.includes('--send');
const FROM = 'Investigator Events <info@investigatorevents.com>';
const SITE = 'https://www.investigatorevents.com';

type Item = { name: string; subject: string; html: () => Promise<string> | string };

async function collect(): Promise<Item[]> {
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
  const { buildVideoInviteEmail } = await import('../lib/email/video-invite');
  const { buildDailyDigestEmail } = await import('../lib/email/daily-digest');
  const { buildNotificationEmail } = await import('../lib/email/notification-email');
  const { buildCreateAccountPitchEmail } = await import('../lib/email/create-account-pitch');
  const { buildAppLaunchAnnounceEmail } = await import('../lib/email/app-launch-announce');
  const { buildReengagementEmail } = await import('../lib/email/reengagement');
  const { buildAdminAlertEmail } = await import('../lib/email/admin-alert');

  const EVENT = 'WAD Conference 2026';
  const EVENT_URL = `${SITE}/events/wad-conference-2026`;

  const items: Item[] = [
    // ── Member lifecycle ──
    { name: 'welcome', subject: 'Welcome to Investigator Events', html: () => buildWelcomeEmail('James Drinkwater') },
    { name: 'newsletter-confirm', subject: 'Confirm your subscription', html: () => buildConfirmationEmail('PREVIEW-TOKEN') },
    { name: 'newsletter-reconfirm (110 list)', subject: 'Confirm your spot before we remove you from the list', html: () => buildNewsletterVerifyReminderEmail('PREVIEW-TOKEN', 'James') },
    { name: 'member-newsletter-invite (52 list)', subject: 'Want the weekly newsletter?', html: () => buildNewsletterOptInPitchEmail(`${SITE}/api/newsletter/opt-in?token=PREVIEW`, 'James') },
    { name: 'write-for-brief (274 list)', subject: 'Tell the industry what you know', html: () => buildWriteForBriefEmail({ recipientName: 'James', associationSlug: 'wad', unsubscribeUrl: `${SITE}/api/newsletter/unsubscribe?token=PREVIEW` }) },
    { name: 'create-account-pitch', subject: 'Set up your Investigator Events profile', html: () => buildCreateAccountPitchEmail('James') },
    { name: 'app-launch-announce', subject: 'The Investigator Events app is live', html: () => buildAppLaunchAnnounceEmail({ fullName: 'James Drinkwater' }) },
    { name: 'reengagement', subject: "Here's what you've missed", html: () => buildReengagementEmail({
        fullName: 'James Drinkwater', username: 'james', completionScore: 60,
        missingItems: [{ label: 'Add your specialisation', href: `${SITE}/profile/edit` }],
        isLinkedInVerified: true, isManuallyVerified: false, daysSinceLastSeen: 21,
        eventsMode: 'upcoming', eventsTotalCount: 12,
        events: [{ title: EVENT, slug: 'wad-conference-2026', city: 'Cannes', country: 'France', startDate: '2026-09-01', imagePath: null }],
        associationsMode: 'featured', associationsTotalCount: 54,
        associations: [{ name: 'WAD', slug: 'wad', logoUrl: null }],
        hasOwnAssociations: false, unsubscribeToken: 'PREVIEW',
      }) },

    // ── Event submission ──
    { name: 'submission-received', subject: `Event received — ${EVENT}`, html: () => buildSubmissionConfirmationEmail(EVENT) },
    { name: 'submission-approved (WITH video offer)', subject: `Your event is live — ${EVENT}`, html: () => buildSubmissionApprovedEmail(EVENT, EVENT_URL, `${EVENT_URL}/submit-video`) },
    { name: 'submission-approved (no video offer)', subject: `Your event is live — ${EVENT}`, html: () => buildSubmissionApprovedEmail(EVENT, EVENT_URL) },
    { name: 'submission-rejected', subject: `About your submission — ${EVENT}`, html: () => buildSubmissionRejectedEmail(EVENT, 'We could not verify this event with the organiser.') },

    // ── Association outreach ──
    { name: 'outreach: approval', subject: `${EVENT} is live on Investigator Events`, html: () => buildApprovalOutreachEmail({ contactEmail: TO, contactName: 'Mike', eventName: EVENT, association: 'WAD', region: 'International' }) },
    { name: 'outreach: introduction', subject: 'WAD on Investigator Events', html: () => buildIntroductionOutreachEmail({ contactName: 'Mike', association: 'WAD', eventNames: [EVENT], eventSlugs: ['wad-conference-2026'], memberCount: 39, slug: 'wad' }) },
    { name: 'outreach: cold', subject: 'Investigator Events — WAD', html: () => buildColdOutreachEmail({ contactName: 'Mike', association: 'WAD', slug: 'wad', memberCount: 39 }) },
    { name: 'video invite (cold, 17 targets)', subject: 'A video for the WAD Conference', html: () => buildVideoInviteEmail({ recipientName: 'Mike', association: 'WAD', conference: EVENT, bodyText: 'We would like to feature a short video for {{conference}} on Investigator Events, free of charge.', video: null, sender: 'mike' }) },

    // ── Notifications ──
    { name: 'daily-digest', subject: 'Your Investigator Events digest', html: () => buildDailyDigestEmail('James', [
        { type: 'follow', actorName: 'Mike LaCorte', actorAvatar: null, actorUsername: 'mike', createdAt: new Date().toISOString() },
        { type: 'connection_request', actorName: 'Sarah Chen', actorAvatar: null, actorUsername: 'sarah', createdAt: new Date().toISOString() },
      ]) },
    { name: 'notification', subject: 'You have a new notification', html: () => buildNotificationEmail({ title: 'Mike LaCorte started following you', body: 'Tap to view their profile.', actorName: 'Mike LaCorte', link: `${SITE}/people`, ctaText: 'View profile' }) },
    { name: 'admin-alert', subject: 'New story submitted', html: () => buildAdminAlertEmail({ heading: 'New story for The Brief', intro: 'A member submitted a story for review.', rows: [{ label: 'Title', value: 'Inside the WAD conference' }, { label: 'Author', value: 'James Drinkwater' }], cta: { label: 'Review in admin', url: `${SITE}/admin/news` } }) },
  ];

  // The four video nudges, in sequence.
  for (const step of VIDEO_REMINDER_STEPS) {
    items.push({
      name: `video reminder ${step.step}/4 (day ${step.afterDays})`,
      subject: step.subject(EVENT),
      html: () => buildVideoReminderEmail({
        eventName: EVENT, recipientName: 'Mike',
        uploadUrl: `${EVENT_URL}/submit-video`,
        optOutUrl: `${SITE}/api/video-reminders/stop?token=PREVIEW`,
        lead: step.lead(EVENT),
        isFinal: step.step === VIDEO_REMINDER_STEPS[VIDEO_REMINDER_STEPS.length - 1].step,
      }),
    });
  }

  // Weekly newsletter, rendered from real live data rather than fixtures.
  try {
    const { getWeeklyCollections } = await import('../lib/data/weekly');
    const { buildWeeklyNewsletterHtml } = await import('../lib/email/weekly-newsletter');
    const { fetchPublishedArticles } = await import('../lib/data/articles');
    const { mapEventRowToItem } = await import('../lib/data/events');
    const { createSupabaseAdminServerClient } = await import('../lib/supabase/admin');

    const sb = createSupabaseAdminServerClient();
    const { data: rows } = await (sb.from('events' as never).select('*').order('start_date', { ascending: true }) as any);
    const events = ((rows ?? []) as any[])
      .filter((r) => r.approved !== false)
      .map(mapEventRowToItem)
      .filter((e: any) => e !== null) as any[];
    const { upcoming, newlyAdded, featured, recentlyPast } = getWeeklyCollections(events);
    const articles = await fetchPublishedArticles();

    items.push({
      name: 'weekly newsletter (REAL data, goes out Monday)',
      subject: 'This week in investigator events',
      html: () => buildWeeklyNewsletterHtml({
        upcoming, newlyAdded, featured, recentlyPast,
        unsubscribeToken: 'PREVIEW',
        articles: articles.slice(0, 3).map((a) => ({ slug: a.slug, title: a.title, dek: a.dek, category: a.category })),
      }),
    });
  } catch (e) {
    console.warn('weekly newsletter skipped:', (e as Error).message);
  }

  return items;
}

async function main() {
  const items = await collect();
  console.log(`emails: ${items.length}  |  to: ${TO}  |  mode: ${LIVE ? '🚨 SENDING' : 'DRY RUN'}`);
  items.forEach((i, n) => console.log(`  ${String(n + 1).padStart(2)}. ${i.name}`));

  if (!LIVE) { console.log('\nDRY RUN — re-run with --send to deliver.'); return; }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  let sent = 0, failed = 0;
  for (const [n, item] of items.entries()) {
    try {
      await resend.emails.send({
        from: FROM,
        to: TO,
        subject: `[TEST ${n + 1}/${items.length}] ${item.subject}`,
        html: await item.html(),
      });
      sent++;
      console.log(`  sent ${n + 1}/${items.length}  ${item.name}`);
    } catch (e) {
      failed++;
      console.error(`  FAIL ${item.name}`, e);
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  console.log(JSON.stringify({ sent, failed, to: TO }));
}

main().catch((e) => { console.error(e); process.exit(1); });
