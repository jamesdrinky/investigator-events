/**
 * One-off helper: send the app-launch announcement preview to a single
 * allow-listed test address. Reads RESEND_API_KEY from .env.local.
 *
 *   npx tsx scripts/send-app-launch-test.ts james@drinky.com [Full Name]
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { Resend } from 'resend';
import { buildAppLaunchAnnounceEmail } from '../lib/email/app-launch-announce';

config({ path: resolve(__dirname, '..', '.env.local') });

const ALLOWED = new Set([
  'james@drinky.com',
  'info@investigatorevents.com',
  'jamesdrinky@yahoo.com',
  'm.lacorte@conflictinternational.com',
]);

async function main() {
  const to = (process.argv[2] ?? '').trim().toLowerCase();
  const name = process.argv[3] ?? 'James';

  if (!to || !ALLOWED.has(to)) {
    console.error(`Recipient not allow-listed. Allowed: ${[...ALLOWED].join(', ')}`);
    process.exit(1);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not found in environment');
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  const html = buildAppLaunchAnnounceEmail({ fullName: name });

  const { data, error } = await resend.emails.send({
    from: 'Investigator Events <info@investigatorevents.com>',
    to,
    subject: '[TEST] The Investigator Events app is live — Europe included',
    html,
  });

  if (error) {
    console.error('Send failed:', error);
    process.exit(1);
  }

  console.log('Sent.', { id: data?.id, to });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
