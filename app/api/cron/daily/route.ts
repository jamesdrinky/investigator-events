import { NextResponse } from 'next/server';
import { processOutreachQueue } from '@/lib/email/association-outreach';
import { verifyCronSecret } from '@/lib/security/server';

export async function GET(request: Request) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const [outreach, digest] = await Promise.all([
    processOutreachQueue().catch((err) => {
      console.error('Outreach queue failed:', err);
      return { sent: 0, failed: 0, error: true };
    }),
    runDigest().catch((err) => {
      console.error('Daily digest failed:', err);
      return { sent: 0, failed: 0, error: true };
    }),
  ]);

  return NextResponse.json({
    ok: true,
    outreach,
    digest,
    timestamp: new Date().toISOString(),
  });
}

async function runDigest() {
  const { Resend } = await import('resend');
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const { buildDailyDigestEmail } = await import('@/lib/email/daily-digest');

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return { sent: 0, failed: 0, reason: 'no api key' };

  const supabase = createSupabaseAdminServerClient();
  const resend = new Resend(resendKey);

  const since = new Date();
  since.setHours(since.getHours() - 24);

  // Fetch all unemailed notifications with actor_id
  const { data: notifications } = await supabase
    .from('notifications')
    .select('user_id, actor_id, type, created_at')
    .eq('emailed', false)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false }) as any;

  if (!notifications?.length) {
    return { sent: 0, failed: 0, reason: 'no unemailed notifications' };
  }

  // Get all unique actor IDs and fetch their profiles
  const actorIds = [...new Set(notifications.map((n: any) => n.actor_id).filter(Boolean))] as string[];
  const actorMap: Record<string, { full_name: string; avatar_url: string | null; username: string | null }> = {};

  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username')
      .in('id', actorIds);

    for (const a of (actors ?? [])) {
      actorMap[a.id] = { full_name: a.full_name ?? 'Someone', avatar_url: a.avatar_url, username: a.username };
    }
  }

  // Group notifications by user
  const byUser: Record<string, any[]> = {};
  for (const n of notifications) {
    if (!byUser[n.user_id]) byUser[n.user_id] = [];
    const actor = actorMap[n.actor_id] ?? { full_name: 'Someone', avatar_url: null, username: null };
    byUser[n.user_id].push({
      type: n.type,
      actorName: actor.full_name,
      actorAvatar: actor.avatar_url,
      actorUsername: actor.username,
      createdAt: n.created_at,
    });
  }

  let sent = 0;
  let failed = 0;
  const successUserIds: string[] = [];
  const skippedUserIds: string[] = [];

  for (const [userId, userNotifs] of Object.entries(byUser)) {
    if (userNotifs.length === 0) continue;

    const [emailResult, profileResult] = await Promise.all([
      (supabase.rpc as any)('get_user_email', { uid: userId }),
      supabase.from('profiles').select('full_name').eq('id', userId).single(),
    ]);

    const email = emailResult?.data;
    if (!email) {
      console.warn(`Digest skipped: no email for user ${userId}`);
      skippedUserIds.push(userId);
      continue;
    }

    const name = profileResult?.data?.full_name ?? 'there';
    const html = buildDailyDigestEmail(name, userNotifs);
    const total = userNotifs.length;

    const { error } = await resend.emails.send({
      from: 'Investigator Events <info@investigatorevents.com>',
      to: email,
      subject: `${total} new notification${total !== 1 ? 's' : ''} on Investigator Events`,
      html,
      tags: [{ name: 'type', value: 'daily-digest' }],
    });

    if (error) {
      console.error(`Digest failed for ${userId}:`, error.message);
      failed++;
    } else {
      sent++;
      successUserIds.push(userId);
    }
  }

  // Fix #2: Only mark notifications as emailed for users whose digest actually sent
  for (const uid of successUserIds) {
    await supabase.from('notifications')
      .update({ emailed: true } as any)
      .eq('user_id', uid)
      .eq('emailed', false)
      .gte('created_at', since.toISOString());
  }

  return { sent, failed, skipped: skippedUserIds.length, users: Object.keys(byUser).length };
}
