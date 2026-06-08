'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Resend } from 'resend';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest, enforceRateLimitAsync, escapeHtml } from '@/lib/security/server';
import { buildAdminAlertEmail, ADMIN_ALERT_INBOX } from '@/lib/email/admin-alert';
import { isFeatureEnabled, VIDEO_SUBMISSIONS_FLAG } from '@/lib/data/feature-flags';

const MAX_DURATION_SECONDS = 181; // 3 min + rounding tolerance

function clean(value: string, maxLength: number) {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export async function submitEventVideoAction(formData: FormData) {
  const slug = clean(String(formData.get('slug') ?? ''), 160);

  try {
    assertSameOriginRequest();

    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect(`/signin?next=/events/${slug}/submit-video`);
    }

    if (!(await isFeatureEnabled(VIDEO_SUBMISSIONS_FLAG))) {
      redirect(`/events/${slug}/submit-video`);
    }

    await enforceRateLimitAsync('submit-event-video', {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    const admin = createSupabaseAdminServerClient();

    // Confirm the event actually exists.
    const { data: eventRow } = await admin
      .from('events')
      .select('id, title, slug')
      .eq('slug', slug)
      .single();
    if (!eventRow) {
      redirect('/calendar');
    }
    const event = eventRow as any;

    const title = clean(String(formData.get('title') ?? ''), 120);
    const description = clean(String(formData.get('description') ?? ''), 600);
    const videoPath = String(formData.get('videoUrl') ?? '').trim();
    const durationRaw = Number(formData.get('durationSeconds') ?? 0);

    if (!title) {
      redirect(`/events/${slug}/submit-video?status=error&reason=title`);
    }

    const pathOk =
      videoPath.startsWith(`${user.id}/`) &&
      !videoPath.includes('..') &&
      /\.(mp4|mov|webm)$/i.test(videoPath);
    if (!pathOk) {
      redirect(`/events/${slug}/submit-video?status=error&reason=video`);
    }

    const durationSeconds = Number.isFinite(durationRaw) && durationRaw > 0 ? Math.round(durationRaw) : null;
    if (durationSeconds === null) {
      redirect(`/events/${slug}/submit-video?status=error&reason=duration`);
    }
    if (durationSeconds > MAX_DURATION_SECONDS) {
      redirect(`/events/${slug}/submit-video?status=error&reason=length`);
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    const submitterName = clean(String(profile?.full_name ?? ''), 120) || 'Member';
    const submitterEmail = user.email ?? '';

    const { error } = await admin.from('association_videos' as any).insert({
      kind: 'event_promo',
      event_id: event.id,
      event_slug: event.slug,
      submitter_user_id: user.id,
      submitter_name: submitterName,
      submitter_email: submitterEmail,
      title,
      description: description || null,
      video_url: videoPath,
      duration_seconds: durationSeconds,
      status: 'pending',
      is_paid: false,
      payment_status: 'none',
    });

    if (error) {
      console.error('submitEventVideoAction insert failed:', error.message);
      redirect(`/events/${slug}/submit-video?status=error`);
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && submitterEmail) {
      const safeName = escapeHtml(submitterName);
      const safeTitle = escapeHtml(title);
      const safeEvent = escapeHtml(event.title ?? '');
      const resend = new Resend(resendKey);
      resend.emails.send({
        from: 'Investigator Events <info@investigatorevents.com>',
        to: submitterEmail,
        subject: `Video received — ${event.title}`,
        html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
          <h2 style="margin:0 0 12px;font-size:20px">Video received</h2>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155">Thanks ${safeName} — we've received your video <strong>"${safeTitle}"</strong> for <strong>${safeEvent}</strong>.</p>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155">It's now in our verification queue. Once approved it'll appear on the event page. We review submissions regularly.</p>
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Investigator Events · The global PI conference calendar.</p>
        </div>`,
      }).catch((err) => console.error('Event video confirmation email failed:', err));

      // Internal alert to the team inbox.
      resend.emails.send({
        from: 'Investigator Events <info@investigatorevents.com>',
        to: ADMIN_ALERT_INBOX,
        subject: `New event video submission — ${event.title}`,
        html: buildAdminAlertEmail({
          heading: 'New event video submission',
          intro: 'A video is waiting for verification for an event.',
          rows: [
            { label: 'Title', value: title },
            { label: 'Event', value: event.title },
            { label: 'Submitter', value: submitterName },
            { label: 'Email', value: submitterEmail },
            { label: 'Length', value: durationSeconds ? `${durationSeconds}s` : null },
          ],
          cta: { label: 'Review videos', url: 'https://investigatorevents.com/admin/videos' },
        }),
      }).catch((err) => console.error('Event video admin alert email failed:', err));
    }

    revalidatePath(`/events/${slug}`);
    revalidatePath('/admin/videos');
    redirect(`/events/${slug}/submit-video?status=success`);
  } catch (error) {
    if (error instanceof Error && 'digest' in error && typeof (error as any).digest === 'string' && (error as any).digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('submitEventVideoAction failed:', error instanceof Error ? error.message : error);
    redirect(`/events/${slug}/submit-video?status=error`);
  }
}
