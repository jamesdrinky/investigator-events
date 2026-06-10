// One-off bulk send: "confirm before we remove you" to PENDING newsletter subs.
// Safe by default: DRY RUN unless you pass --send.
//   Dry run:  npx tsx scripts/send-verify-reminder.ts
//   Live:     npx tsx scripts/send-verify-reminder.ts --send
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildNewsletterVerifyReminderEmail } from '../lib/email/newsletter-verify-reminder';

const LIVE = process.argv.includes('--send');
const SUBJECT = 'Confirm your spot before we remove you from the list';
const FROM = 'Investigator Events <info@investigatorevents.com>';

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const { data: subs, error } = await sb
    .from('newsletter_subscribers')
    .select('email, unsubscribe_token')
    .eq('status', 'pending')
    .not('unsubscribe_token', 'is', null);

  if (error) { console.error('query failed:', error); process.exit(1); }

  console.log(`recipients: ${subs!.length}  |  mode: ${LIVE ? '🚨 LIVE SEND' : 'DRY RUN (nothing sent)'}`);
  console.log('sample:', subs!.slice(0, 5).map((s: any) => s.email));

  if (!LIVE) { console.log('DRY RUN complete — re-run with --send to actually send.'); return; }

  let sent = 0, failed = 0;
  for (const s of subs as any[]) {
    try {
      await resend.emails.send({ from: FROM, to: s.email, subject: SUBJECT, html: buildNewsletterVerifyReminderEmail(s.unsubscribe_token, null) });
      sent++;
    } catch (e) { failed++; console.error('FAIL', s.email, e); }
    await new Promise((r) => setTimeout(r, 120));
  }
  console.log(JSON.stringify({ sent, failed }));
}

main().catch((e) => { console.error(e); process.exit(1); });
