/**
 * One-shot broadcast of the app-launch email.
 *
 * Audience: every auth.users account + every active newsletter subscriber.
 * Deduped by canonical (Gmail dot-stripped) email so one inbox gets one
 * email. Records every send in public.app_launch_sends so re-runs skip
 * anyone already done.
 *
 *   npx tsx scripts/broadcast-app-launch.ts            # dry-run (default)
 *   npx tsx scripts/broadcast-app-launch.ts --send     # actually send
 *   npx tsx scripts/broadcast-app-launch.ts --send --limit 5
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildAppLaunchAnnounceEmail } from '../lib/email/app-launch-announce';
import { normalizeEmail } from '../lib/utils/email-normalize';

config({ path: resolve(__dirname, '..', '.env.local') });

const CAMPAIGN = 'app_launch_v1';
const FROM = 'Investigator Events <info@investigatorevents.com>';
const SUBJECT = 'The Investigator Events app is live — Europe included';
const SITE = 'https://investigatorevents.com';
const RESEND_GAP_MS = 220;

type Source = 'account' | 'newsletter' | 'both';

type Recipient = {
  email: string;          // canonical form used as the key + recipient
  rawEmail: string;       // original lower-cased form for Resend `to`
  fullName: string | null;
  userId: string | null;
  source: Source;
  unsubscribeToken: string | null;
};

async function main() {
  const args = process.argv.slice(2);
  const send = args.includes('--send');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1] ?? '0', 10) || null : null;

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!supaUrl || !serviceKey || !resendKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / RESEND_API_KEY');
    process.exit(1);
  }

  const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });
  const resend = new Resend(resendKey);

  console.log('Building audience…');

  // 1. Auth users — page through all
  const byCanonical = new Map<string, Recipient>();
  {
    let page = 1;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      const users = data?.users ?? [];
      for (const u of users) {
        const raw = u.email?.trim().toLowerCase();
        if (!raw) continue;
        const canonical = normalizeEmail(raw);
        if (!byCanonical.has(canonical)) {
          byCanonical.set(canonical, {
            email: canonical,
            rawEmail: raw,
            fullName: null,
            userId: u.id,
            source: 'account',
            unsubscribeToken: null,
          });
        }
      }
      if (users.length < 1000) break;
      page += 1;
    }
  }

  // 2. Profile full_names
  const userIds = Array.from(byCanonical.values()).map((r) => r.userId).filter((id): id is string => !!id);
  if (userIds.length) {
    const { data: profileRows } = await admin
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    const idToName = new Map<string, string | null>();
    for (const row of (profileRows ?? []) as { id: string; full_name: string | null }[]) {
      idToName.set(row.id, row.full_name);
    }
    for (const r of byCanonical.values()) {
      if (r.userId) r.fullName = idToName.get(r.userId) ?? null;
    }
  }

  // 3. Active newsletter subscribers
  const { data: subRows } = await admin
    .from('newsletter_subscribers' as never)
    .select('email, unsubscribe_token')
    .eq('status', 'active') as unknown as {
      data: { email: string; unsubscribe_token: string | null }[] | null;
    };
  for (const row of subRows ?? []) {
    const raw = row.email.trim().toLowerCase();
    if (!raw) continue;
    const canonical = normalizeEmail(raw);
    const existing = byCanonical.get(canonical);
    if (existing) {
      existing.source = 'both';
      existing.unsubscribeToken = row.unsubscribe_token;
    } else {
      byCanonical.set(canonical, {
        email: canonical,
        rawEmail: raw,
        fullName: null,
        userId: null,
        source: 'newsletter',
        unsubscribeToken: row.unsubscribe_token,
      });
    }
  }

  // 4. Already-sent for idempotency
  const { data: alreadyRows } = await admin
    .from('app_launch_sends' as never)
    .select('recipient_email')
    .eq('campaign', CAMPAIGN) as unknown as {
      data: { recipient_email: string }[] | null;
    };
  const alreadySent = new Set<string>(
    (alreadyRows ?? []).map((r) => r.recipient_email.toLowerCase())
  );

  // 5. Build queue
  let queue: Recipient[] = [];
  let skippedAlreadySent = 0;
  for (const r of byCanonical.values()) {
    if (alreadySent.has(r.email) || alreadySent.has(r.rawEmail)) {
      skippedAlreadySent += 1;
      continue;
    }
    queue.push(r);
  }
  if (limit) queue = queue.slice(0, limit);

  // 6. Breakdown
  const breakdown = { account: 0, newsletter: 0, both: 0 };
  for (const r of queue) breakdown[r.source] += 1;

  console.log('');
  console.log('=== AUDIENCE ===');
  console.log(`Total unique recipients in audience: ${byCanonical.size}`);
  console.log(`Already sent (skipping):              ${skippedAlreadySent}`);
  console.log(`Queued for this run:                  ${queue.length}`);
  console.log(`  Account-only:    ${breakdown.account}`);
  console.log(`  Newsletter-only: ${breakdown.newsletter}`);
  console.log(`  Both:            ${breakdown.both}`);
  if (limit) console.log(`(Limit applied: ${limit})`);
  console.log('');
  console.log('Sample of first 8:');
  for (const r of queue.slice(0, 8)) {
    console.log(`  - ${r.rawEmail} [${r.source}]${r.fullName ? ` (${r.fullName})` : ''}`);
  }
  console.log('');

  if (!send) {
    console.log('DRY RUN — not sending. Pass --send to actually fire.');
    return;
  }

  console.log(`SENDING ${queue.length} emails at 220ms gap (≈${Math.ceil(queue.length * 0.22)}s total)…`);
  console.log('');

  let sent = 0;
  let failed = 0;
  const failures: { email: string; error: string }[] = [];

  for (let i = 0; i < queue.length; i++) {
    const r = queue[i];
    const html = buildAppLaunchAnnounceEmail({ fullName: r.fullName });
    const unsubUrl = r.unsubscribeToken
      ? `${SITE}/api/newsletter/unsubscribe?token=${r.unsubscribeToken}`
      : null;
    try {
      const { data: result, error } = await resend.emails.send({
        from: FROM,
        to: [r.rawEmail],
        subject: SUBJECT,
        html,
        headers: unsubUrl ? {
          'List-Unsubscribe': `<${unsubUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        } : undefined,
      });
      if (error) {
        failed += 1;
        failures.push({ email: r.rawEmail, error: error.message ?? 'unknown' });
        await admin.from('app_launch_sends' as never).insert({
          campaign: CAMPAIGN,
          recipient_email: r.email,
          user_id: r.userId,
          source: r.source,
          status: 'failed',
          error: error.message ?? 'unknown',
        } as never);
        process.stdout.write('x');
      } else {
        sent += 1;
        await admin.from('app_launch_sends' as never).insert({
          campaign: CAMPAIGN,
          recipient_email: r.email,
          user_id: r.userId,
          source: r.source,
          status: 'sent',
          resend_id: result?.id ?? null,
        } as never);
        process.stdout.write('.');
      }
    } catch (e) {
      failed += 1;
      failures.push({ email: r.rawEmail, error: e instanceof Error ? e.message : 'unknown' });
      process.stdout.write('!');
    }
    if (i < queue.length - 1) {
      await new Promise((res) => setTimeout(res, RESEND_GAP_MS));
    }
    // newline every 50 for readability
    if ((i + 1) % 50 === 0) process.stdout.write(`  ${i + 1}\n`);
  }

  console.log('');
  console.log('');
  console.log('=== RESULTS ===');
  console.log(`Sent:   ${sent}`);
  console.log(`Failed: ${failed}`);
  if (failures.length) {
    console.log('');
    console.log('Failures:');
    for (const f of failures) console.log(`  - ${f.email}: ${f.error}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
