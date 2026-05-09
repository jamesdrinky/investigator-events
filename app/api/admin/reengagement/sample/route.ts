import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';
import { buildReengagementSnapshot } from '@/lib/email/reengagement-data';
import { buildReengagementEmail, pickVariant } from '@/lib/email/reengagement';

const FROM = 'Investigator Events <info@investigatorevents.com>';
const RECIPIENTS = ['james@drinky.com', 'm.lacorte@conflictinternational.com'];
const SAMPLES_PER_TIER = 3;
const RESEND_GAP_MS = 220;

export const maxDuration = 60;

export async function POST(_request: Request) {
  assertSameOriginRequest();
  if (!await hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const admin = createSupabaseAdminServerClient();
  const resend = new Resend(resendKey);

  // Pull all profiles + auth emails so we can pick samples from real users.
  const { data: profiles } = await admin.from('profiles').select('id, full_name');
  const idToEmail = new Map<string, string>();
  try {
    const { data: authPage } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authPage?.users ?? []) if (u.email) idToEmail.set(u.id, u.email);
  } catch {}

  // Build snapshots for everyone — needed to bucket by tier.
  const snaps = await Promise.all(
    (profiles ?? []).map(async (p) => {
      try {
        const snap = await buildReengagementSnapshot({ admin, userId: p.id });
        return snap ? { ...snap, full_name: p.full_name } : null;
      } catch {
        return null;
      }
    })
  );

  type SnapWithName = NonNullable<typeof snaps[number]>;
  const valid: SnapWithName[] = snaps.filter((s): s is SnapWithName => s !== null && !!s.email);

  const tierA = valid.filter((s) => s.completionScore < 40);
  const tierB = valid.filter((s) => s.completionScore >= 40 && s.completionScore < 80);
  const tierC = valid.filter((s) => s.completionScore >= 80);

  // Random pick helper
  const pick = (arr: SnapWithName[], n: number) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  };

  const samples = [
    ...pick(tierA, SAMPLES_PER_TIER).map((s) => ({ tier: 'A', snap: s })),
    ...pick(tierB, SAMPLES_PER_TIER).map((s) => ({ tier: 'B', snap: s })),
    ...pick(tierC, SAMPLES_PER_TIER).map((s) => ({ tier: 'C', snap: s })),
  ];

  let sent = 0;
  let failed = 0;
  const errors: { recipient: string; tier: string; error: string }[] = [];

  // Send each sample × each recipient. Sequential 220ms gap to stay under
  // Resend's 5/sec ceiling.
  for (const { tier, snap } of samples) {
    const variant = pickVariant(snap.input);
    const html = buildReengagementEmail(snap.input, {
      recipientName: snap.full_name ?? snap.email!,
      recipientEmail: snap.email!,
      variant,
      completionScore: snap.completionScore,
    });
    const subject = `[SAMPLE] Tier ${tier} re-engagement → ${snap.full_name ?? snap.email}`;

    for (const to of RECIPIENTS) {
      try {
        const { error: sendErr } = await resend.emails.send({
          from: FROM,
          to: [to],
          subject,
          html,
        });
        if (sendErr) {
          failed += 1;
          errors.push({ recipient: to, tier, error: sendErr.message ?? 'unknown' });
        } else {
          sent += 1;
        }
      } catch (e: any) {
        failed += 1;
        errors.push({ recipient: to, tier, error: e?.message ?? 'unknown' });
      }
      await new Promise((resolve) => setTimeout(resolve, RESEND_GAP_MS));
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    samples: samples.map((s) => ({ tier: s.tier, name: s.snap.full_name, email: s.snap.email, completion: s.snap.completionScore })),
    errors,
  });
}
