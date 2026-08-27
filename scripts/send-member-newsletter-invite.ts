// Invite members who were never asked about the newsletter to opt in.
// Safe by default: DRY RUN unless you pass --send.
//   Dry run:  npx tsx scripts/send-member-newsletter-invite.ts
//   Preview:  npx tsx scripts/send-member-newsletter-invite.ts --preview out.html
//   Live:     npx tsx scripts/send-member-newsletter-invite.ts --send
//
// WHO THIS TARGETS, and why the exclusions matter:
//   INCLUDE  OAuth signups (LinkedIn/Apple/Google) — the OAuth callback never
//            rendered the sign-up checkbox, so these members were never asked.
//   INCLUDE  Email signups from before the pre-ticked checkbox shipped (23 Apr
//            2026) — no checkbox existed for them either.
//   EXCLUDE  Email signups after 23 Apr who are not on the list. They saw a
//            pre-ticked box and unticked it. That is a decision; we honour it.
//   EXCLUDE  Anyone already on the list in any state, including 'unsubscribed'
//            and 'pending' (pending are covered by send-verify-reminder.ts).
import { config } from 'dotenv';
config({ path: '.env.local' });
import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildNewsletterOptInPitchEmail } from '../lib/email/newsletter-opt-in-pitch';
import { createNewsletterOptInToken } from '../lib/security/server';

const LIVE = process.argv.includes('--send');
const previewIndex = process.argv.indexOf('--preview');
const PREVIEW_PATH = previewIndex !== -1 ? process.argv[previewIndex + 1] : null;

const PRE_TICK_SHIPPED = new Date('2026-04-23T00:00:00Z');
const SUBJECT = 'Want the weekly newsletter?';
const FROM = 'Investigator Events <info@investigatorevents.com>';
const SITE = 'https://investigatorevents.com';

function optInUrl(email: string) {
  return `${SITE}/api/newsletter/opt-in?token=${createNewsletterOptInToken(email)}`;
}

async function main() {
  if (PREVIEW_PATH) {
    writeFileSync(PREVIEW_PATH, buildNewsletterOptInPitchEmail(optInUrl('preview@example.com'), 'Mike'));
    console.log(`preview written to ${PREVIEW_PATH}`);
    return;
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const [{ data: subs }, { data: users }, { data: profiles }] = await Promise.all([
    sb.from('newsletter_subscribers').select('email'),
    sb.auth.admin.listUsers({ perPage: 1000 }),
    sb.from('profiles').select('id, full_name'),
  ]);

  const onList = new Set((subs ?? []).map((s: any) => String(s.email).toLowerCase()));
  const nameById = new Map((profiles ?? []).map((p: any) => [p.id, p.full_name]));

  const targets: Array<{ email: string; name: string | null; reason: string }> = [];
  let skippedUnticked = 0;
  let skippedOnList = 0;

  for (const u of users?.users ?? []) {
    if (!u.email) continue;
    const email = u.email.toLowerCase();
    if (onList.has(email)) { skippedOnList++; continue; }

    const provider = (u.app_metadata as any)?.provider ?? 'email';
    const createdAt = new Date(u.created_at);

    if (provider === 'email' && createdAt >= PRE_TICK_SHIPPED) {
      skippedUnticked++;
      continue;
    }

    const fullName = nameById.get(u.id) ?? null;
    targets.push({
      email: u.email,
      name: fullName ? String(fullName).trim().split(' ')[0] : null,
      reason: provider === 'email' ? 'signed up before the checkbox existed' : `${provider} — never shown a checkbox`,
    });
  }

  console.log(`recipients: ${targets.length}  |  mode: ${LIVE ? '🚨 LIVE SEND' : 'DRY RUN (nothing sent)'}`);
  console.log(`  skipped, already on the list: ${skippedOnList}`);
  console.log(`  skipped, actively unticked:   ${skippedUnticked}`);
  const byReason = targets.reduce<Record<string, number>>((acc, t) => {
    acc[t.reason] = (acc[t.reason] ?? 0) + 1;
    return acc;
  }, {});
  console.log('  breakdown:', JSON.stringify(byReason, null, 2));

  if (!LIVE) {
    console.log('DRY RUN complete — re-run with --send to actually send.');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  let sent = 0;
  let failed = 0;
  for (const t of targets) {
    try {
      await resend.emails.send({
        from: FROM,
        to: t.email,
        subject: SUBJECT,
        html: buildNewsletterOptInPitchEmail(optInUrl(t.email), t.name),
      });
      sent++;
    } catch (e) {
      failed++;
      console.error('FAIL', t.email, e);
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  console.log(JSON.stringify({ sent, failed }));
}

main().catch((e) => { console.error(e); process.exit(1); });
