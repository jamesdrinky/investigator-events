import { NextResponse } from 'next/server';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { fetchVideoEmailMeta } from '@/lib/data/association-videos';
import { buildVideoInviteEmail, renderSubject, DEFAULT_VIDEO_INVITE_SUBJECT } from '@/lib/email/video-invite';

const SITE = 'https://investigatorevents.com';

// Renders the composed email to HTML for the live preview pane.
export async function POST(request: Request) {
  if (!await hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { recipientName, association, conference, subject, bodyText, videoId, sender } = body;

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

  const html = buildVideoInviteEmail({ ...merge, bodyText: bodyText ?? '', video, sender });
  const resolvedSubject = renderSubject(subject || DEFAULT_VIDEO_INVITE_SUBJECT, merge);

  return NextResponse.json({ html, subject: resolvedSubject });
}
