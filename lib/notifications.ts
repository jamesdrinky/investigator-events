import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

type NotificationType = 'follow' | 'connection_request' | 'connection_accepted' | 'post_like' | 'post_comment' | 'event_approved';

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
 * Send a push notification to all of a user's registered devices.
 * Uses Expo's push service as a universal relay (works for both APNs and FCM
 * without needing separate server-side certificates).
 */
async function sendPushToUser(supabase: any, userId: string, title: string, body: string, url: string) {
  const { data: tokens } = await supabase
    .from('device_tokens')
    .select('token, platform')
    .eq('user_id', userId);

  if (!tokens || tokens.length === 0) return;

  // APNs/FCM delivery will be wired up once Developer account keys are configured.
  // Tokens are stored and ready — just needs the push provider integration.
}
