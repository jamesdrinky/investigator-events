import { NextResponse } from 'next/server';
import { processOutreachQueue } from '@/lib/email/association-outreach';
import { verifyCronSecret } from '@/lib/security/server';
import { normalizeEmailPrefs, emailAllowed } from '@/lib/notifications-prefs';

export async function GET(request: Request) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const [outreach, digest, reviewPrompts] = await Promise.all([
    processOutreachQueue().catch((err) => {
      console.error('Outreach queue failed:', err);
      return { sent: 0, failed: 0, error: true };
    }),
    runDigest().catch((err) => {
      console.error('Daily digest failed:', err);
      return { sent: 0, failed: 0, error: true };
    }),
    runEventReviewPrompts().catch((err) => {
      console.error('Event review prompts failed:', err);
      return { pushed: 0, skipped: 0, error: true };
    }),
  ]);

  return NextResponse.json({
    ok: true,
    outreach,
    digest,
    reviewPrompts,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Push event attendees once after their event ends, prompting them to leave
 * a review. Dedupes via the notifications table — each user gets at most one
 * review prompt per event, ever.
 *
 * Looks back 2 days so a missed cron run still catches yesterday's events.
 */
async function runEventReviewPrompts() {
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const { sendPushToUser } = await import('@/lib/notifications');
  const supabase = createSupabaseAdminServerClient();

  // Today's date in UTC YYYY-MM-DD form
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Find events whose end_date (or start_date if no end_date) is today or yesterday.
  // We query both windows so a missed run yesterday still gets caught up.
  const { data: events } = await (supabase
    .from('events')
    .select('id, title, slug, start_date, end_date')
    .or(`end_date.eq.${today},end_date.eq.${yesterday}`) as any);

  // Also pull events with no end_date that started today/yesterday (single-day events)
  const { data: singleDay } = await (supabase
    .from('events')
    .select('id, title, slug, start_date, end_date')
    .is('end_date', null)
    .in('start_date', [today, yesterday]) as any);

  const allEnded = [
    ...((events ?? []) as { id: string; title: string; slug: string }[]),
    ...((singleDay ?? []) as { id: string; title: string; slug: string }[]),
  ];

  if (allEnded.length === 0) return { pushed: 0, skipped: 0, reason: 'no events ended' };

  let pushed = 0;
  let skipped = 0;

  for (const event of allEnded) {
    // Find users who said they were going
    const { data: attendees } = await (supabase
      .from('event_attendees')
      .select('user_id')
      .eq('event_id', event.id)
      .eq('is_going', true) as any);

    const attendeeIds = ((attendees ?? []) as { user_id: string }[]).map((a) => a.user_id);
    if (attendeeIds.length === 0) continue;

    // Dedupe: skip anyone already prompted for THIS event
    const link = `/events/${event.slug}#reviews`;
    const { data: alreadyPrompted } = await (supabase
      .from('notifications')
      .select('user_id')
      .eq('type', 'event_review_prompt')
      .eq('link', link)
      .in('user_id', attendeeIds) as any);
    const alreadySet = new Set(((alreadyPrompted ?? []) as { user_id: string }[]).map((p) => p.user_id));

    for (const userId of attendeeIds) {
      if (alreadySet.has(userId)) { skipped += 1; continue; }

      // Record the notification (visible in the bell) + send push in one go
      await (supabase.from('notifications') as any).insert({
        user_id: userId,
        actor_id: userId, // self-actor; not a person-driven notification
        type: 'event_review_prompt',
        title: `How was ${event.title}?`,
        body: 'Tap to leave a quick review — helps your network plan ahead.',
        link,
        emailed: false,
      });

      await sendPushToUser(
        supabase,
        userId,
        `How was ${event.title}?`,
        'Tap to leave a quick review',
        link,
      );

      // 220ms throttle to stay under Resend/APNs rate limits
      await new Promise((r) => setTimeout(r, 220));
      pushed += 1;
    }
  }

  return { pushed, skipped, eventsChecked: allEnded.length };
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

    const [emailResult, profileResult, userResult] = await Promise.all([
      (supabase.rpc as any)('get_user_email', { uid: userId }),
      supabase.from('profiles').select('full_name').eq('id', userId).single(),
      supabase.auth.admin.getUserById(userId),
    ]);

    const email = emailResult?.data;
    if (!email) {
      console.warn(`Digest skipped: no email for user ${userId}`);
      skippedUserIds.push(userId);
      continue;
    }

    // Respect the user's email notification preferences (stored in auth metadata).
    // Drop the types they've muted; if nothing's left, suppress the digest
    // entirely (still mark the notifications emailed below so we don't
    // reconsider them tomorrow).
    const prefs = normalizeEmailPrefs((userResult?.data?.user?.user_metadata as any)?.email_prefs);
    const allowedNotifs = userNotifs.filter((n: any) => emailAllowed(prefs, n.type));
    if (allowedNotifs.length === 0) {
      successUserIds.push(userId);
      continue;
    }

    const name = profileResult?.data?.full_name ?? 'there';
    const html = buildDailyDigestEmail(name, allowedNotifs);
    const total = allowedNotifs.length;

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
