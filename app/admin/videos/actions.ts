'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { assertSameOriginRequest, escapeHtml } from '@/lib/security/server';
import { setFeatureFlag, VIDEO_SUBMISSIONS_FLAG } from '@/lib/data/feature-flags';

const BUCKET = 'event-videos';

async function ensureAdmin() {
  if (!(await hasValidAdminSessionCookie())) {
    redirect('/admin?error=auth');
  }
}

function parseId(formData: FormData) {
  const id = String(formData.get('videoId') ?? '').trim();
  if (!id) throw new Error('Missing videoId');
  return id;
}

// Lock/unlock the public video-submission flow (instant, no redeploy).
export async function setVideoSubmissionsEnabledAction(formData: FormData) {
  assertSameOriginRequest();
  await ensureAdmin();

  const enabled = String(formData.get('enabled') ?? '') === 'true';
  await setFeatureFlag(VIDEO_SUBMISSIONS_FLAG, enabled);

  revalidatePath('/admin/videos');
  revalidatePath('/associations', 'layout');
}

export async function approveVideoAction(formData: FormData) {
  assertSameOriginRequest();
  await ensureAdmin();

  const id = parseId(formData);
  const admin = createSupabaseAdminServerClient();

  const { data: row } = await admin
    .from('association_videos' as any)
    .select('id, title, submitter_name, submitter_email, association_slug, event_slug')
    .eq('id', id)
    .single();

  const { error } = await admin
    .from('association_videos' as any)
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('approveVideoAction failed:', error.message);
    throw new Error('Failed to approve video');
  }

  const video = row as any;

  // Tell the submitter their video is live (fire-and-forget).
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && video?.submitter_email) {
    const resend = new Resend(resendKey);
    const link = video.event_slug
      ? `https://investigatorevents.com/events/${video.event_slug}`
      : video.association_slug
        ? `https://investigatorevents.com/associations/${video.association_slug}`
        : 'https://investigatorevents.com';
    const where = video.event_slug ? 'event page' : 'association page';
    const safeName = escapeHtml(video.submitter_name || 'there');
    const safeTitle = escapeHtml(video.title ?? '');
    resend.emails.send({
      from: 'Investigator Events <info@investigatorevents.com>',
      to: video.submitter_email,
      subject: `Your video is live — ${video.title}`,
      html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
        <h2 style="margin:0 0 12px;font-size:20px">Your video is live 🎉</h2>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155">Hi ${safeName} — your video <strong>"${safeTitle}"</strong> has been approved and is now showing on the ${where}.</p>
        <a href="${link}" style="display:inline-block;padding:12px 28px;background:#0f172a;color:#fff;text-decoration:none;font-size:14px;font-weight:600;border-radius:99px">View it</a>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Investigator Events · The global PI conference calendar.</p>
      </div>`,
    }).catch((err) => console.error('Approval email failed:', err));
  }

  if (video?.association_slug) {
    revalidatePath(`/associations/${video.association_slug}`);
  }
  if (video?.event_slug) {
    revalidatePath(`/events/${video.event_slug}`);
  }
  revalidatePath('/admin/videos');
}

export async function rejectVideoAction(formData: FormData) {
  assertSameOriginRequest();
  await ensureAdmin();

  const id = parseId(formData);
  const reason = String(formData.get('reason') ?? '').trim().slice(0, 300) || null;
  const admin = createSupabaseAdminServerClient();

  // Grab the stored object path so we can delete the file — a rejected clip
  // shouldn't linger in storage.
  const { data: row } = await admin
    .from('association_videos' as any)
    .select('video_url')
    .eq('id', id)
    .single();

  const { error } = await admin
    .from('association_videos' as any)
    .update({ status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('rejectVideoAction failed:', error.message);
    throw new Error('Failed to reject video');
  }

  // Best-effort storage cleanup (skip full https URLs from phase 2). A failure
  // here must not fail the rejection.
  const storedPath = (row as any)?.video_url;
  if (typeof storedPath === 'string' && storedPath && !/^https?:\/\//i.test(storedPath)) {
    const { error: removeError } = await admin.storage.from(BUCKET).remove([storedPath]);
    if (removeError) {
      console.error('rejectVideoAction storage cleanup failed:', removeError.message);
    }
  }

  revalidatePath('/admin/videos');
}
