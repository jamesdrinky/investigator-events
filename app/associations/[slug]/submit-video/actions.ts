'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Resend } from 'resend';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest, enforceRateLimitAsync, escapeHtml } from '@/lib/security/server';
import { buildAdminAlertEmail, ADMIN_ALERT_INBOX } from '@/lib/email/admin-alert';
import { isFeatureEnabled, VIDEO_SUBMISSIONS_FLAG } from '@/lib/data/feature-flags';

const MAX_DURATION_SECONDS = 46; // 45s cap + 1s rounding tolerance

function clean(value: string, maxLength: number) {
  // Collapse all whitespace (incl. tabs/newlines), trim, then cap length.
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export async function submitAssociationVideoAction(formData: FormData) {
  const slug = clean(String(formData.get('slug') ?? ''), 120);

  try {
    assertSameOriginRequest();

    // Must be signed in to submit a member video.
    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect(`/signin?next=/associations/${slug}/submit-video`);
    }

    // Hard stop if public submissions are locked (the page shows a contact CTA).
    if (!(await isFeatureEnabled(VIDEO_SUBMISSIONS_FLAG))) {
      redirect(`/associations/${slug}/submit-video`);
    }

    await enforceRateLimitAsync('submit-association-video', {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    const admin = createSupabaseAdminServerClient();

    // Confirm the association actually exists.
    const { data: page } = await admin
      .from('association_pages' as any)
      .select('id, name, slug')
      .eq('slug', slug)
      .single();
    if (!page) {
      redirect('/associations');
    }
    const assoc = page as any;

    const title = clean(String(formData.get('title') ?? ''), 120);
    const description = clean(String(formData.get('description') ?? ''), 600);
    const videoPath = String(formData.get('videoUrl') ?? '').trim();
    const durationRaw = Number(formData.get('durationSeconds') ?? 0);

    // The client submits the storage object path from our presign route. Require
    // it to live under THIS user's prefix with an allowed extension — this ties
    // the file to the submitter and rejects anything pointing elsewhere.
    const pathOk =
      videoPath.startsWith(`${user.id}/`) &&
      !videoPath.includes('..') &&
      /\.(mp4|mov|webm)$/i.test(videoPath);
    if (!pathOk) {
      redirect(`/associations/${slug}/submit-video?status=error&reason=video`);
    }

    // Title optional. Soft length cap: enforce 45s only when the browser could
    // actually read the duration — an unreadable duration is waved through
    // (the admin reviews every clip anyway) rather than wrongly rejected.
    const durationSeconds = Number.isFinite(durationRaw) && durationRaw > 0 ? Math.round(durationRaw) : null;
    if (durationSeconds !== null && durationSeconds > MAX_DURATION_SECONDS) {
      redirect(`/associations/${slug}/submit-video?status=error&reason=length`);
    }

    // Submitter identity comes from the server, never the client.
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    const submitterName = clean(String(profile?.full_name ?? ''), 120) || 'Member';
    const submitterEmail = user.email ?? '';

    const { error } = await admin.from('association_videos' as any).insert({
      kind: 'association_member',
      association_page_id: assoc.id,
      association_slug: assoc.slug,
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
      console.error('submitAssociationVideoAction insert failed:', error.message);
      redirect(`/associations/${slug}/submit-video?status=error`);
    }

    // Fire-and-forget confirmation to the submitter.
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && submitterEmail) {
      const safeName = escapeHtml(submitterName);
      const titleClause = title ? ` <strong>"${escapeHtml(title)}"</strong>` : '';
      const safeAssoc = escapeHtml(assoc.name ?? '');
      const resend = new Resend(resendKey);
      resend.emails.send({
        from: 'Investigator Events <info@investigatorevents.com>',
        to: submitterEmail,
        subject: `Video received — ${assoc.name}`,
        html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
          <h2 style="margin:0 0 12px;font-size:20px">Video received</h2>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155">Thanks ${safeName} — we've received your video${titleClause} for <strong>${safeAssoc}</strong>.</p>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155">It's now in our verification queue. Once approved it'll appear on the association page. We review submissions regularly.</p>
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Investigator Events · The global PI conference calendar.</p>
        </div>`,
      }).catch((err) => console.error('Video confirmation email failed:', err));

      // Internal alert to the team inbox (fire-and-forget).
      resend.emails.send({
        from: 'Investigator Events <info@investigatorevents.com>',
        to: ADMIN_ALERT_INBOX,
        subject: `New video submission — ${assoc.name}`,
        html: buildAdminAlertEmail({
          heading: 'New video submission',
          intro: 'A member video is waiting for verification.',
          rows: [
            { label: 'Title', value: title },
            { label: 'Association', value: assoc.name },
            { label: 'Submitter', value: submitterName },
            { label: 'Email', value: submitterEmail },
            { label: 'Length', value: durationSeconds ? `${durationSeconds}s` : null },
          ],
          cta: { label: 'Review videos', url: 'https://investigatorevents.com/admin/videos' },
        }),
      }).catch((err) => console.error('Video admin alert email failed:', err));
    }

    revalidatePath(`/associations/${slug}`);
    revalidatePath('/admin/videos');
    redirect(`/associations/${slug}/submit-video?status=success`);
  } catch (error) {
    if (error instanceof Error && 'digest' in error && typeof (error as any).digest === 'string' && (error as any).digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('submitAssociationVideoAction failed:', error instanceof Error ? error.message : error);
    redirect(`/associations/${slug}/submit-video?status=error`);
  }
}
