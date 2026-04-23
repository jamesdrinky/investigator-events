import { NextResponse } from 'next/server';
import { processOutreachQueue } from '@/lib/email/association-outreach';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Run both daily jobs
  const [outreach, digest] = await Promise.all([
    processOutreachQueue().catch((err) => {
      console.error('Outreach queue failed:', err);
      return { sent: 0, failed: 0, error: true };
    }),
    runDigest(request).catch((err) => {
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

async function runDigest(_request: Request) {
  const { Resend } = await import('resend');
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const { buildDailyDigestEmail } = await import('@/lib/email/daily-digest');

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return { sent: 0, failed: 0, reason: 'no api key' };

  const supabase = createSupabaseAdminServerClient();
  const resend = new Resend(resendKey);

  const since = new Date();
  since.setHours(since.getHours() - 24);

  const { data: notifications } = await supabase
    .from('notifications' as any)
    .select('user_id, type')
    .eq('emailed', false)
    .gte('created_at', since.toISOString()) as any;

  if (!notifications?.length) {
    return { sent: 0, failed: 0, reason: 'no unemailed notifications' };
  }

  const byUser: Record<string, Record<string, number>> = {};
  for (const n of notifications) {
    if (!byUser[n.user_id]) byUser[n.user_id] = {};
    byUser[n.user_id][n.type] = (byUser[n.user_id][n.type] ?? 0) + 1;
  }

  let sent = 0;
  let failed = 0;

  for (const [userId, counts] of Object.entries(byUser)) {
    const followers = counts['follow'] ?? 0;
    const connectionRequests = counts['connection_request'] ?? 0;
    const connectionsAccepted = counts['connection_accepted'] ?? 0;
    const likes = counts['post_like'] ?? 0;
    const comments = counts['post_comment'] ?? 0;
    const total = followers + connectionRequests + connectionsAccepted + likes + comments;
    if (total === 0) continue;

    const [emailResult, profileResult] = await Promise.all([
      (supabase.rpc as any)('get_user_email', { uid: userId }),
      supabase.from('profiles').select('full_name').eq('id', userId).single(),
    ]);

    const email = emailResult?.data;
    if (!email) continue;

    const name = profileResult?.data?.full_name ?? 'there';
    const html = buildDailyDigestEmail(name, { followers, connectionRequests, connectionsAccepted, likes, comments });

    const { error } = await resend.emails.send({
      from: 'Investigator Events <info@investigatorevents.com>',
      to: email,
      subject: `${total} new notification${total !== 1 ? 's' : ''} on Investigator Events`,
      html,
      tags: [{ name: 'type', value: 'daily-digest' }],
    });

    if (error) { failed++; } else { sent++; }
  }

  await supabase.from('notifications' as any)
    .update({ emailed: true } as any)
    .eq('emailed', false)
    .gte('created_at', since.toISOString());

  return { sent, failed, users: Object.keys(byUser).length };
}
