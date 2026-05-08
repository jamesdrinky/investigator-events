import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';
import { buildReengagementSnapshot } from '@/lib/email/reengagement-data';
import { buildReengagementEmail, pickVariant, pickSubject } from '@/lib/email/reengagement';

const CAMPAIGN = 'reengagement_v1';
const FROM = 'Investigator Events <info@investigatorevents.com>';

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

  // Pull all profiles (or just one if userId provided)
  let profilesQuery = admin.from('profiles').select('id').order('created_at', { ascending: false });
  if (onlyUserId) profilesQuery = profilesQuery.eq('id', onlyUserId);
  const { data: profiles, error: profilesErr } = await profilesQuery;
  if (profilesErr) {
    return NextResponse.json({ error: profilesErr.message }, { status: 500 });
  }

  // Skip users we've already sent this campaign to (idempotent across retries)
  const alreadySentIds = new Set<string>();
  if (!dryRun) {
    const { data: already } = await (admin.from('reengagement_sends' as any)
      .select('user_id')
      .eq('campaign', CAMPAIGN)
      .eq('status', 'sent') as any);
    for (const row of (already ?? []) as { user_id: string }[]) {
      alreadySentIds.add(row.user_id);
    }
  }

  let sent = 0;
  let skippedNoEmail = 0;
  let skippedAlreadySent = 0;
  let failed = 0;
  const failures: { userId: string; error: string }[] = [];

  for (const p of profiles ?? []) {
    if (alreadySentIds.has(p.id)) {
      skippedAlreadySent += 1;
      continue;
    }

    const snap = await buildReengagementSnapshot({ admin, userId: p.id });
    if (!snap || !snap.email) {
      skippedNoEmail += 1;
      continue;
    }

    const html = buildReengagementEmail(snap.input);
    const subject = pickSubject(snap.input);
    const variant = pickVariant(snap.input);

    if (dryRun) {
      sent += 1;
      continue;
    }

    const { error: sendErr } = await resend.emails.send({
      from: FROM,
      to: [snap.email],
      subject,
      html,
    });

    if (sendErr) {
      failed += 1;
      failures.push({ userId: p.id, error: sendErr.message ?? 'unknown' });
      await (admin.from('reengagement_sends' as any).insert({
        user_id: p.id,
        recipient_email: snap.email,
        campaign: CAMPAIGN,
        variant,
        completion_score: snap.completionScore,
        is_linkedin_verified: snap.isLinkedInVerified,
        status: 'failed',
        error: sendErr.message ?? 'unknown',
      } as any) as any);
      continue;
    }

    sent += 1;
    await (admin.from('reengagement_sends' as any).insert({
      user_id: p.id,
      recipient_email: snap.email,
      campaign: CAMPAIGN,
      variant,
      completion_score: snap.completionScore,
      is_linkedin_verified: snap.isLinkedInVerified,
      status: 'sent',
    } as any) as any);
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    totals: {
      considered: profiles?.length ?? 0,
      sent,
      skippedAlreadySent,
      skippedNoEmail,
      failed,
    },
    failures,
  });
}
