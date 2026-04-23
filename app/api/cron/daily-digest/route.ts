import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { buildDailyDigestEmail } from '@/lib/email/daily-digest';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 });
  }

  const supabase = createSupabaseAdminServerClient();
  const resend = new Resend(resendKey);

  // Get all un-emailed notifications from today
  const since = new Date();
  since.setHours(since.getHours() - 24);

  const { data: notifications } = await supabase
    .from('notifications' as any)
    .select('user_id, type')
    .eq('emailed', false)
    .gte('created_at', since.toISOString()) as any;

  if (!notifications?.length) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'no unemailed notifications' });
  }

  // Group by user
  const byUser: Record<string, { follow: number; connection_request: number; connection_accepted: number; post_like: number; post_comment: number }> = {};

  for (const n of notifications) {
    if (!byUser[n.user_id]) {
      byUser[n.user_id] = { follow: 0, connection_request: 0, connection_accepted: 0, post_like: 0, post_comment: 0 };
    }
    if (n.type in byUser[n.user_id]) {
      byUser[n.user_id][n.type as keyof typeof byUser[string]]++;
    }
  }

  let sent = 0;
  let failed = 0;

  for (const [userId, counts] of Object.entries(byUser)) {
    const total = counts.follow + counts.connection_request + counts.connection_accepted + counts.post_like + counts.post_comment;
    if (total === 0) continue;

    // Get user email and name
    const [emailResult, profileResult] = await Promise.all([
      (supabase.rpc as any)('get_user_email', { uid: userId }),
      supabase.from('profiles').select('full_name').eq('id', userId).single(),
    ]);

    const email = emailResult?.data;
    const name = profileResult?.data?.full_name ?? 'there';
    if (!email) continue;

    const html = buildDailyDigestEmail(name, {
      followers: counts.follow,
      connectionRequests: counts.connection_request,
      connectionsAccepted: counts.connection_accepted,
      likes: counts.post_like,
      comments: counts.post_comment,
    });

    const { error } = await resend.emails.send({
      from: 'Investigator Events <info@investigatorevents.com>',
      to: email,
      subject: `${total} new notification${total !== 1 ? 's' : ''} on Investigator Events`,
      html,
      tags: [{ name: 'type', value: 'daily-digest' }],
    });

    if (error) {
      console.error(`Digest email failed for ${userId}:`, error.message);
      failed++;
    } else {
      sent++;
    }
  }

  // Mark all processed notifications as emailed
  await supabase.from('notifications' as any)
    .update({ emailed: true } as any)
    .eq('emailed', false)
    .gte('created_at', since.toISOString());

  return NextResponse.json({ ok: true, sent, failed, usersProcessed: Object.keys(byUser).length });
}
