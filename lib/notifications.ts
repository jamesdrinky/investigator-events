import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { sendApnsPush, sendApnsBadge } from '@/lib/push/apns';

type NotificationType = 'follow' | 'connection_request' | 'connection_accepted' | 'post_like' | 'post_comment' | 'event_approved' | 'message' | 'association_event';

interface CreateNotificationParams {
  userId: string;
  actorId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

/**
 * Create a notification (no individual email — emails go out as daily digest).
 * Fire-and-forget — never throws. Prevents duplicate notifications.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const supabase = createSupabaseAdminServerClient();
    const { userId, actorId, type, title, body, link } = params;

    // Don't notify yourself
    if (userId === actorId) return;

    // Fix #12: Prevent duplicate notifications (same actor + type + user within 5 minutes)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('actor_id', actorId)
      .eq('type', type)
      .gte('created_at', fiveMinAgo)
      .limit(1)
      .maybeSingle();

    if (existing) return;

    await supabase.from('notifications').insert({
      user_id: userId,
      actor_id: actorId,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
      emailed: false,
    } as any);

    // Await the push — on Vercel serverless, fire-and-forget after the
    // response returns gets frozen mid-flight and only resumes when the
    // next request hits the same lambda instance, making each push arrive
    // one trigger behind. ~1-2s added per call but reliable delivery.
    await sendPushToUser(supabase, userId, title, body ?? '', link ?? '/');
  } catch (err) {
    console.error('createNotification failed:', err);
  }
}

/**
 * Total unread count for the app-icon badge: unread notifications + unread
 * messages (mirrors the in-app red dot in the navbar). Best-effort — returns 0
 * on any error so a badge query never blocks a push.
 */
export async function getUnreadBadgeCount(supabase: any, userId: string): Promise<number> {
  try {
    const [notif, msgs] = await Promise.all([
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false),
      supabase.from('messages' as any).select('id', { count: 'exact', head: true }).eq('receiver_id', userId).eq('is_read', false),
    ]);
    return (notif.count ?? 0) + (msgs.count ?? 0);
  } catch {
    return 0;
  }
}

/**
 * Re-sync the app-icon badge to the user's live unread count (silently, no
 * alert). Call after the user reads notifications/messages so the red dot drops
 * — or clears entirely when they've read everything. No app update required.
 */
export async function updateUserBadge(userId: string) {
  try {
    if (!process.env.APNS_KEY_ID || !process.env.APNS_PRIVATE_KEY) return;
    // device_tokens isn't in the generated Database types yet (same as sendPushToUser).
    const supabase: any = createSupabaseAdminServerClient();

    const { data: tokens } = await supabase
      .from('device_tokens')
      .select('token, platform')
      .eq('user_id', userId);

    const iosTokens = ((tokens ?? []) as { token: string; platform: string }[]).filter((t) => t.platform === 'ios');
    if (iosTokens.length === 0) return;

    const badge = await getUnreadBadgeCount(supabase, userId);
    const results = await Promise.all(iosTokens.map((t) => sendApnsBadge(t.token, badge)));

    const deadTokens = results.filter((r) => r.invalid).map((r) => r.token);
    if (deadTokens.length > 0) {
      await supabase.from('device_tokens').delete().in('token', deadTokens);
    }
  } catch (err) {
    console.error('updateUserBadge failed:', err);
  }
}

/**
 * Send a push to every iOS device the user has registered.
 * Fire-and-forget: never throws. Stale tokens (410 from APNs) get cleaned up.
 * Android (FCM) not wired yet — silently ignored when present.
 * (Typed as `any` because device_tokens isn't in the generated Database types yet.)
 */
export async function sendPushToUser(
  supabase: any,
  userId: string,
  title: string,
  body: string,
  url: string,
) {
  try {
    if (!process.env.APNS_KEY_ID || !process.env.APNS_PRIVATE_KEY) return;

    const { data: tokens } = await supabase
      .from('device_tokens')
      .select('token, platform')
      .eq('user_id', userId);

    if (!tokens || tokens.length === 0) return;

    const iosTokens = (tokens as { token: string; platform: string }[]).filter((t) => t.platform === 'ios');
    if (iosTokens.length === 0) return;

    // Set the app-icon badge to the user's live unread count.
    const badge = await getUnreadBadgeCount(supabase, userId);

    const results = await Promise.all(
      iosTokens.map((t) => sendApnsPush(t.token, { title, body, url, badge })),
    );

    const deadTokens = results.filter((r) => r.invalid).map((r) => r.token);
    if (deadTokens.length > 0) {
      await supabase.from('device_tokens').delete().in('token', deadTokens);
    }

    const failed = results.filter((r) => !r.ok && !r.invalid);
    if (failed.length > 0) {
      console.error('APNs send failures:', failed.map((f) => `${f.status}/${f.reason}`).join(', '));
    }
  } catch (err) {
    console.error('sendPushToUser failed:', err);
  }
}
