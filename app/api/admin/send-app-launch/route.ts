import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';
import { buildAppLaunchAnnounceEmail } from '@/lib/email/app-launch-announce';

const CAMPAIGN = 'app_launch_v1';
const FROM = 'Investigator Events <info@investigatorevents.com>';
const SUBJECT = 'The Investigator Events app is live — Europe included';
const SITE = 'https://investigatorevents.com';
const RESEND_GAP_MS = 220;

export const maxDuration = 60;

type Source = 'account' | 'newsletter' | 'both';

type Recipient = {
  email: string;
  fullName: string | null;
  userId: string | null;
  source: Source;
  unsubscribeToken: string | null;
};

export async function POST(request: Request) {
  assertSameOriginRequest();
  if (!(await hasValidAdminSessionCookie())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    dryRun?: boolean;
    confirm?: string;
    limit?: number;
    testEmail?: string;
  };

  // Default to dry-run. To actually send, caller must pass dryRun:false AND
  // confirm:'SEND_APP_LAUNCH'. Belt and braces so a stray POST never blasts.
  const dryRun = body?.dryRun !== false;
  const confirmed = body?.confirm === 'SEND_APP_LAUNCH';
  const limit = typeof body?.limit === 'number' && body.limit > 0 ? body.limit : null;
  const testEmail = typeof body?.testEmail === 'string'
    ? body.testEmail.trim().toLowerCase()
    : null;

  if (!dryRun && !confirmed) {
    return NextResponse.json({
      error: "Live send requires confirm:'SEND_APP_LAUNCH'",
    }, { status: 400 });
  }

  const admin = createSupabaseAdminServerClient();
  const resend = new Resend(resendKey);

  // ── Build recipient set ────────────────────────────────────────────────

  const byEmail = new Map<string, Recipient>();

  // 1. Auth users (account holders). Single page covers current size.
  try {
    const { data: authPage } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const user of authPage?.users ?? []) {
      const email = user.email?.trim().toLowerCase();
      if (!email) continue;
      byEmail.set(email, {
        email,
        fullName: null,
        userId: user.id,
        source: 'account',
        unsubscribeToken: null,
      });
    }
  } catch (error) {
    return NextResponse.json({
      error: `Failed to list auth users: ${error instanceof Error ? error.message : 'unknown'}`,
    }, { status: 500 });
  }

  // 2. Profiles → full_name lookup for greeting
  const userIds = Array.from(byEmail.values())
    .map((r) => r.userId)
    .filter((id): id is string => Boolean(id));
  if (userIds.length > 0) {
    const { data: profileRows } = await admin
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    const idToName = new Map<string, string | null>();
    for (const row of (profileRows ?? []) as { id: string; full_name: string | null }[]) {
      idToName.set(row.id, row.full_name);
    }
    for (const recipient of byEmail.values()) {
      if (recipient.userId) {
        const name = idToName.get(recipient.userId);
        if (name) recipient.fullName = name;
      }
    }
  }

  // 3. Active newsletter subscribers (verified via double opt-in)
  const { data: subRows } = (await (admin
    .from('newsletter_subscribers' as never)
    .select('email, unsubscribe_token')
    .eq('status', 'active') as never)) as {
    data: { email: string; unsubscribe_token: string | null }[] | null;
  };

  for (const row of subRows ?? []) {
    const email = row.email.trim().toLowerCase();
    if (!email) continue;
    const existing = byEmail.get(email);
    if (existing) {
      existing.source = 'both';
      existing.unsubscribeToken = row.unsubscribe_token;
    } else {
      byEmail.set(email, {
        email,
        fullName: null,
        userId: null,
        source: 'newsletter',
        unsubscribeToken: row.unsubscribe_token,
      });
    }
  }

  // 4. Already-sent (campaign idempotency)
  const { data: alreadyRows } = (await (admin
    .from('app_launch_sends' as never)
    .select('recipient_email')
    .eq('campaign', CAMPAIGN) as never)) as {
    data: { recipient_email: string }[] | null;
  };
  const alreadySent = new Set<string>(
    (alreadyRows ?? []).map((r) => r.recipient_email.toLowerCase())
  );

  // ── Pre-filter ────────────────────────────────────────────────────────

  let allRecipients = Array.from(byEmail.values());

  // Test-email mode: send only to the supplied address (must already be in set
  // so we don't surprise non-users)
  if (testEmail) {
    allRecipients = allRecipients.filter((r) => r.email === testEmail);
    if (allRecipients.length === 0) {
      return NextResponse.json({
        error: `testEmail ${testEmail} is not in the audience (no account, not on newsletter)`,
      }, { status: 400 });
    }
  }

  const skippedAlreadySent: string[] = [];
  const queue: Recipient[] = [];
  for (const recipient of allRecipients) {
    if (alreadySent.has(recipient.email)) {
      skippedAlreadySent.push(recipient.email);
      continue;
    }
    queue.push(recipient);
  }

  const limitedQueue = limit ? queue.slice(0, limit) : queue;

  // Audience breakdown for the response
  const sourceCount = { account: 0, newsletter: 0, both: 0 };
  for (const r of limitedQueue) sourceCount[r.source] += 1;

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      campaign: CAMPAIGN,
      totals: {
        accountUsers: byEmail.size - (subRows?.length ?? 0) + sourceCount.both,
        activeSubscribers: subRows?.length ?? 0,
        uniqueAudience: byEmail.size,
        alreadySent: alreadySent.size,
        skippedAlreadySent: skippedAlreadySent.length,
        queued: limitedQueue.length,
      },
      breakdown: sourceCount,
      sample: limitedQueue.slice(0, 10).map((r) => ({
        email: r.email,
        source: r.source,
        hasName: Boolean(r.fullName),
      })),
    });
  }

  // ── Live send ─────────────────────────────────────────────────────────

  let sent = 0;
  let failed = 0;
  const failures: { email: string; error: string }[] = [];

  for (let i = 0; i < limitedQueue.length; i++) {
    const recipient = limitedQueue[i];
    const html = buildAppLaunchAnnounceEmail({ fullName: recipient.fullName });

    const unsubUrl = recipient.unsubscribeToken
      ? `${SITE}/api/newsletter/unsubscribe?token=${recipient.unsubscribeToken}`
      : null;

    try {
      const { data: sendResult, error: sendErr } = await resend.emails.send({
        from: FROM,
        to: [recipient.email],
        subject: SUBJECT,
        html,
        headers: unsubUrl ? {
          'List-Unsubscribe': `<${unsubUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        } : undefined,
      });

      if (sendErr) {
        failed += 1;
        failures.push({ email: recipient.email, error: sendErr.message ?? 'unknown' });
        await (admin.from('app_launch_sends' as never).insert({
          campaign: CAMPAIGN,
          recipient_email: recipient.email,
          user_id: recipient.userId,
          source: recipient.source,
          status: 'failed',
          error: sendErr.message ?? 'unknown',
        } as never) as never);
      } else {
        sent += 1;
        await (admin.from('app_launch_sends' as never).insert({
          campaign: CAMPAIGN,
          recipient_email: recipient.email,
          user_id: recipient.userId,
          source: recipient.source,
          status: 'sent',
          resend_id: sendResult?.id ?? null,
        } as never) as never);
      }
    } catch (error) {
      failed += 1;
      failures.push({
        email: recipient.email,
        error: error instanceof Error ? error.message : 'unknown',
      });
    }

    // Resend rate limit is 5 req/sec — 220ms gap keeps us safely under.
    if (i < limitedQueue.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, RESEND_GAP_MS));
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun: false,
    campaign: CAMPAIGN,
    totals: {
      queued: limitedQueue.length,
      sent,
      failed,
      skippedAlreadySent: skippedAlreadySent.length,
    },
    breakdown: sourceCount,
    failures,
  });
}
