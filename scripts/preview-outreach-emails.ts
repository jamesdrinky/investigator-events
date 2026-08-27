// Writes local HTML previews of the outreach emails so they can be eyeballed
// (and forwarded) before anything is sent to a real list.
//   npx tsx scripts/preview-outreach-emails.ts [outDir]
import { config } from 'dotenv';
config({ path: '.env.local' });
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { buildWriteForBriefEmail } from '../lib/email/write-for-brief';
import { buildNewsletterVerifyReminderEmail } from '../lib/email/newsletter-verify-reminder';
import { buildSubmissionApprovedEmail } from '../lib/email/submission-confirmation';
import { VIDEO_REMINDER_STEPS } from '../lib/email/video-reminder';
import { buildNewsletterOptInPitchEmail } from '../lib/email/newsletter-opt-in-pitch';

const SITE = 'https://investigatorevents.com';
const outDir = process.argv[2] ?? 'outreach-previews';
mkdirSync(outDir, { recursive: true });

function write(name: string, html: string) {
  const file = path.join(outDir, name);
  writeFileSync(file, html);
  console.log(`  ${file}`);
}

console.log('previews:');

write(
  'write-for-brief.html',
  buildWriteForBriefEmail({
    recipientName: 'Mike',
    associationSlug: 'wad',
    unsubscribeUrl: `${SITE}/api/newsletter/unsubscribe?token=PREVIEW`,
  })
);

write('newsletter-reconfirm.html', buildNewsletterVerifyReminderEmail('PREVIEW-TOKEN', null));

write(
  'member-newsletter-invite.html',
  buildNewsletterOptInPitchEmail(`${SITE}/api/newsletter/opt-in?token=PREVIEW`, 'Mike')
);

write(
  'event-approved-with-video.html',
  buildSubmissionApprovedEmail(
    'WAD Annual Conference 2026',
    `${SITE}/events/wad-annual-conference-2026`,
    `${SITE}/events/wad-annual-conference-2026/submit-video`
  )
);

console.log(`\nvideo reminder sequence (${VIDEO_REMINDER_STEPS.length} steps):`);
for (const s of VIDEO_REMINDER_STEPS) {
  console.log(`  day ${s.afterDays}: "${s.subject('WAD Annual Conference 2026')}"`);
}
