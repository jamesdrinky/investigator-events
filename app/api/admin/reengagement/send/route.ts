import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';
import { buildReengagementSnapshot } from '@/lib/email/reengagement-data';
import { buildReengagementEmail, pickVariant, pickSubject } from '@/lib/email/reengagement';

const CAMPAIGN = 'reengagement_v1';
const FROM = 'Investigator Events <info@investigatorevents.com>';
const SNAPSHOT_CONCURRENCY = 8;

// Allow up to 60s on Vercel Pro (silently capped to 10s on Hobby).
export const maxDuration = 60;

async function mapInBatches<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function POST(request: Request) {
  assertSameOriginRequest();
  if (!await hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const dryRun = body?.dryRun === true;
  const onlyUserId = typeof body?.userId === 'string' ? body.userId : null;

  const admin = createSupabaseAdminServerClient();
  const resend = new Resend(resendKey);

  // ---- Bulk pre-fetch ---------------------------------------------------
  // 1. Profile id list (or single id when previewing)
  let profilesQuery = admin.from('profiles').select('id').order('created_at', { ascending: false });
  if (onlyUserId) profilesQuery = profilesQuery.eq('id', onlyUserId);
  const { data: profiles, error: profilesErr } = await profilesQuery;
  if (profilesErr) {
    return NextResponse.json({ error: profilesErr.message }, { status: 500 });
  }
  const profileIds = (profiles ?? []).map((p) => p.id);

  // 2. Newsletter active subscribers (lower-cased emails) — single query
  const { data: activeSubsRows } = await (admin.from('newsletter_subscribers' as any)
    .select('email')
    .eq('status', 'active') as any);
  const activeSubEmails = new Set<string>(((activeSubsRows ?? []) as { email: string }[]).map((s) => s.email.toLowerCase()));

  // 3. Auth users — id -> email — single page (1000 cap is fine, ~72 users today)
  const idToEmail = new Map<string, string>();
  try {
    const { data: authPage } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authPage?.users ?? []) {
      if (u.email) idToEmail.set(u.id, u.email.toLowerCase());
    }
  } catch {}

  // 4. Already-sent ids for this campaign — single query
  const alreadySentIds = new Set<string>();
  const { data: already } = await (admin.from('reengagement_sends' as any)
    .select('user_id')
    .eq('campaign', CAMPAIGN)
    .eq('status', 'sent') as any);
  for (const row of (already ?? []) as { user_id: string }[]) {
    alreadySentIds.add(row.user_id);
  }

  // ---- Pre-filter (no per-user queries) ---------------------------------
  let skippedAlreadySent = 0;
  let skippedNoEmail = 0;
  let skippedNotSubscribed = 0;
  let skippedTierC = 0;
  let sent = 0;
  let failed = 0;
  const failures: { userId: string; error: string }[] = [];

  const candidates: string[] = [];
  for (const id of profileIds) {
    if (alreadySentIds.has(id)) {
      skippedAlreadySent += 1;
      continue;
    }
    const email = idToEmail.get(id) ?? null;
    if (!email) {
      skippedNoEmail += 1;
      continue;
    }
    if (!activeSubEmails.has(email)) {
      skippedNotSubscribed += 1;
      continue;
    }
    candidates.push(id);
  }

  // ---- Build snapshots in parallel for the surviving candidates ---------
  const snaps = await mapInBatches(candidates, SNAPSHOT_CONCURRENCY, async (userId) => {
    try {
      return await buildReengagementSnapshot({ admin, userId });
    } catch {
      return null;
    }
  });

  // ---- Decide tier eligibility + send -----------------------------------
  // For live sends we still want to keep things parallel-ish: send via Resend
  // is the only side-effect and Resend's API is happy with concurrent calls.
  const toSendQueue: { userId: string; snap: NonNullable<typeof snaps[number]> }[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const userId = candidates[i];
    const snap = snaps[i];
    if (!snap || !snap.email) {
      skippedNoEmail += 1;
      continue;
    }
    if (!snap.isNewsletterSubscribed) {
      // Belt-and-braces (subscriber rows could have changed mid-flight)
      skippedNotSubscribed += 1;
      continue;
    }
    if (snap.completionScore >= 80) {
      const daysAway = snap.input.daysSinceLastSeen ?? 0;
      const newEventsSinceVisit = snap.input.eventsMode === 'new_since_visit' ? snap.input.eventsTotalCount : 0;
      const tierCWorthIncluding = daysAway >= 14 && newEventsSinceVisit >= 5;
      if (!tierCWorthIncluding) {
        skippedTierC += 1;
        continue;
      }
    }
    toSendQueue.push({ userId, snap });
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      totals: {
        considered: profileIds.length,
        sent: toSendQueue.length,
        skippedAlreadySent,
        skippedNoEmail,
        skippedNotSubscribed,
        skippedTierC,
        failed: 0,
      },
      failures: [],
    });
  }

  // Live send: SEQUENTIAL with a 220ms gap between Resend calls to stay under
  // Resend's 5 req/sec rate limit (parallel sends burst-violated this and lost
  // 19 of the first 29 to 429s). 220ms = ~4.5/sec sustained.
  const RESEND_GAP_MS = 220;
  for (let i = 0; i < toSendQueue.length; i++) {
    const { userId, snap } = toSendQueue[i];
    const html = buildReengagementEmail(snap.input);
    const subject = pickSubject(snap.input);
    const variant = pickVariant(snap.input);
    const unsubUrl = snap.unsubscribeToken
      ? `https://investigatorevents.com/api/newsletter/unsubscribe?token=${snap.unsubscribeToken}`
      : null;
    try {
      const { error: sendErr } = await resend.emails.send({
        from: FROM,
        to: [snap.email!],
        subject,
        html,
        headers: unsubUrl ? {
          'List-Unsubscribe': `<${unsubUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        } : undefined,
      });
      if (sendErr) {
        failed += 1;
        failures.push({ userId, error: sendErr.message ?? 'unknown' });
        await (admin.from('reengagement_sends' as any).insert({
          user_id: userId,
          recipient_email: snap.email!,
          campaign: CAMPAIGN,
          variant,
          completion_score: snap.completionScore,
          is_linkedin_verified: snap.isLinkedInVerified,
          status: 'failed',
          error: sendErr.message ?? 'unknown',
        } as any) as any);
      } else {
        sent += 1;
        await (admin.from('reengagement_sends' as any).insert({
          user_id: userId,
          recipient_email: snap.email!,
          campaign: CAMPAIGN,
          variant,
          completion_score: snap.completionScore,
          is_linkedin_verified: snap.isLinkedInVerified,
          status: 'sent',
        } as any) as any);
      }
    } catch (e: any) {
      failed += 1;
      failures.push({ userId, error: e?.message ?? 'unknown' });
    }
    // Rate-limit gap before the next send (skip after the last one)
    if (i < toSendQueue.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, RESEND_GAP_MS));
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun: false,
    totals: {
      considered: profileIds.length,
      sent,
      skippedAlreadySent,
      skippedNoEmail,
      skippedNotSubscribed,
      skippedTierC,
      failed,
    },
    failures,
  });
}
