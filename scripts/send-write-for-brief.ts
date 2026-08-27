// Bulk send: the "write for The Brief" invitation.
// Safe by default: DRY RUN unless you pass --send.
//   Dry run:  npx tsx scripts/send-write-for-brief.ts
//   Preview:  npx tsx scripts/send-write-for-brief.ts --preview out.html
//   Live:     npx tsx scripts/send-write-for-brief.ts --send
//
// Audience: confirmed newsletter subscribers + registered members who have not
// switched activity email off. Deliberately NOT the 110 unconfirmed pending
// subscribers — those get the re-permission email first (send-verify-reminder.ts).
import { config } from 'dotenv';
config({ path: '.env.local' });
import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildWriteForBriefEmail } from '../lib/email/write-for-brief';
import { normalizeEmailPrefs } from '../lib/notifications-prefs';

const LIVE = process.argv.includes('--send');
const previewIndex = process.argv.indexOf('--preview');
const PREVIEW_PATH = previewIndex !== -1 ? process.argv[previewIndex + 1] : null;

const SUBJECT = 'Tell the industry what you know';
const FROM = 'Investigator Events <info@investigatorevents.com>';
const SITE = 'https://investigatorevents.com';

interface Recipient {
  email: string;
  name: string | null;
  unsubscribeToken: string | null;
}

async function main() {
  if (PREVIEW_PATH) {
    writeFileSync(
      PREVIEW_PATH,
      buildWriteForBriefEmail({
        recipientName: 'Mike',
        associationSlug: 'wad',
        unsubscribeUrl: `${SITE}/api/newsletter/unsubscribe?token=preview`,
      })
    );
    console.log(`preview written to ${PREVIEW_PATH}`);
    return;
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const [{ data: subs }, { data: users }] = await Promise.all([
    sb.from('newsletter_subscribers').select('email, unsubscribe_token').eq('status', 'active'),
    sb.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const { data: profiles } = await sb.from('profiles').select('id, full_name, email_prefs');
  const profileById = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  // Dedupe on lowercased email; the subscriber list wins because it carries the
  // unsubscribe token the footer needs.
  const byEmail = new Map<string, Recipient>();

  for (const s of (subs ?? []) as any[]) {
    if (!s.email) continue;
    byEmail.set(s.email.toLowerCase(), {
      email: s.email,
      name: null,
      unsubscribeToken: s.unsubscribe_token ?? null,
    });
  }

  for (const u of users?.users ?? []) {
    if (!u.email) continue;
    const profile: any = profileById.get(u.id);
    // Respect the master activity-email switch. This is marketing, not
    // transactional — someone who turned emails off must not get it.
    if (profile && !normalizeEmailPrefs(profile.email_prefs).all) continue;

    const key = u.email.toLowerCase();
    const existing = byEmail.get(key);
    const name = profile?.full_name?.trim()?.split(' ')[0] ?? null;
    if (existing) {
      existing.name = existing.name ?? name;
    } else {
      byEmail.set(key, { email: u.email, name, unsubscribeToken: null });
    }
  }

  const recipients = [...byEmail.values()];

  console.log(`recipients: ${recipients.length}  |  mode: ${LIVE ? '🚨 LIVE SEND' : 'DRY RUN (nothing sent)'}`);
  console.log(`  from newsletter (active): ${(subs ?? []).length}`);
  console.log(`  registered users considered: ${users?.users?.length ?? 0}`);
  console.log('sample:', recipients.slice(0, 5).map((r) => `${r.email}${r.name ? ` (${r.name})` : ''}`));

  if (!LIVE) {
    console.log('DRY RUN complete — re-run with --send to actually send.');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    try {
      await resend.emails.send({
        from: FROM,
        to: r.email,
        subject: SUBJECT,
        html: buildWriteForBriefEmail({
          recipientName: r.name,
          unsubscribeUrl: r.unsubscribeToken
            ? `${SITE}/api/newsletter/unsubscribe?token=${r.unsubscribeToken}`
            : null,
        }),
      });
      sent++;
    } catch (e) {
      failed++;
      console.error('FAIL', r.email, e);
    }
    await new Promise((res) => setTimeout(res, 120));
  }
  console.log(JSON.stringify({ sent, failed }));
}

main().catch((e) => { console.error(e); process.exit(1); });
