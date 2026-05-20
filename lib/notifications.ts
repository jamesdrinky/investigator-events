import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { sendApnsPush } from '@/lib/push/apns';

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

    // Send push notification to user's devices (fire-and-forget)
    sendPushToUser(supabase, userId, title, body ?? '', link ?? '/').catch(() => {});
  } catch (err) {
    console.error('createNotification failed:', err);
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

    const results = await Promise.all(
      iosTokens.map((t) => sendApnsPush(t.token, { title, body, url })),
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
