import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';
import { fetchVideoEmailMeta } from '@/lib/data/association-videos';
import { buildVideoInviteEmail, renderSubject, senderFrom, DEFAULT_VIDEO_INVITE_SUBJECT } from '@/lib/email/video-invite';

const SITE = 'https://investigatorevents.com';

// Sends the composed video-invite email and logs it to outreach_sends.
export async function POST(request: Request) {
  assertSameOriginRequest();
  if (!await hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { recipientEmail, recipientName, association, conference, subject, bodyText, videoId, sender } = body;

  if (!recipientEmail || !bodyText) {
    return NextResponse.json({ error: 'Missing recipient email or body' }, { status: 400 });
  }

  let video = null;
  if (videoId) {
    const meta = await fetchVideoEmailMeta(videoId);
    if (meta) video = { id: meta.id, title: meta.title, watchUrl: `${SITE}${meta.watchPath}` };
  }

  const merge = {
    recipientName: recipientName ?? '',
    association: association ?? '',
    conference: conference ?? '',
  };

  const html = buildVideoInviteEmail({ ...merge, bodyText, video, sender });
  const resolvedSubject = renderSubject(subject || DEFAULT_VIDEO_INVITE_SUBJECT, merge);

  const resend = new Resend(resendKey);
  const { error: sendError } = await resend.emails.send({
    from: senderFrom(sender),
    to: [recipientEmail],
    subject: resolvedSubject,
    html,
  });

  if (sendError) {
    console.error('Video-invite send failed:', sendError);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  // Log to outreach_sends (reuses the existing outreach ledger).
  const supabase = createSupabaseAdminServerClient();
  await (supabase.from('outreach_sends' as any).insert({
    recipient_email: recipientEmail,
    recipient_name: recipientName || conference || recipientEmail,
    association: association || conference || 'Video invite',
    sender: sender || 'mike',
    subject: resolvedSubject,
    event_name: conference || null,
    html,
    status: 'sent',
    send_after: new Date().toISOString(),
    sent_at: new Date().toISOString(),
  } as any) as any).then(() => {}).catch(() => {});

  return NextResponse.json({ ok: true });
}
