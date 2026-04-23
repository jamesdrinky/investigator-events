import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import { buildNotificationEmail } from '@/lib/email/notification-email';

type NotificationType = 'follow' | 'connection_request' | 'connection_accepted' | 'post_like' | 'post_comment' | 'event_approved';

interface CreateNotificationParams {
  userId: string;
  actorId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  sendEmail?: boolean;
}

/**
 * Create a notification and optionally send an email.
 * Fire-and-forget — never throws.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const supabase = createSupabaseAdminServerClient();
    const { userId, actorId, type, title, body, link, sendEmail = true } = params;

    // Don't notify yourself
    if (userId === actorId) return;

    // Insert notification
    await supabase.from('notifications' as any).insert({
      user_id: userId,
      actor_id: actorId,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
      emailed: false,
    } as any);

    // Send email notification
    if (sendEmail) {
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) return;

      // Get recipient email and actor name
      const [recipientResult, actorResult] = await Promise.all([
        (supabase.rpc as any)('get_user_email', { uid: userId }),
        supabase.from('profiles').select('full_name, avatar_url, username').eq('id', actorId).single(),
      ]);

      let recipientEmail: string | null = recipientResult?.data;
      if (!recipientEmail) {
        // Can't get email without admin auth API — skip email
        return;
      }

      const actorName = actorResult.data?.full_name ?? 'Someone';
      const actorUsername = actorResult.data?.username;

      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'Investigator Events <info@investigatorevents.com>',
        to: recipientEmail,
        subject: title,
        html: buildNotificationEmail({
          title,
          body: body ?? '',
          actorName,
          actorAvatar: actorResult.data?.avatar_url,
          link: link ? `https://investigatorevents.com${link}` : undefined,
          ctaText: type === 'follow' ? 'View profile' : type === 'connection_request' ? 'View request' : 'View',
        }),
        tags: [{ name: 'type', value: `notification-${type}` }],
      }).catch((err) => console.error('Notification email failed:', err));

      // Mark as emailed
      await supabase.from('notifications' as any)
        .update({ emailed: true } as any)
        .eq('user_id', userId)
        .eq('actor_id', actorId)
        .eq('type', type)
        .order('created_at', { ascending: false } as any)
        .limit(1);
    }
  } catch (err) {
    console.error('createNotification failed:', err);
  }
}

/**
 * Client-side helper to create notifications via a lightweight API.
 * Used from client components (follow button, like button, etc.)
 */
export async function notifyFromClient(params: {
  userId: string;
  actorId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch {
    // Silent fail — notifications are best-effort
  }
}
