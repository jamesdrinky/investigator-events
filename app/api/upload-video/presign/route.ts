import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest, enforceRateLimit, RateLimitError } from '@/lib/security/server';
import { isFeatureEnabled, VIDEO_SUBMISSIONS_FLAG } from '@/lib/data/feature-flags';

const EXTENSIONS: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};

// Returns a presigned upload URL so the client PUTs the video straight to
// Supabase storage, bypassing Vercel's 4.5 MB request body limit. Same pattern
// as /api/upload-message-image/presign. Files live in the PRIVATE `event-videos`
// bucket (created in the association_videos migration); the client submits the
// returned object `path`, which the server re-validates, and approved clips are
// later served via short-lived signed URLs. (Swapping this to Vercel Blob later
// only touches this route + the form's upload call — the DB stores a path/URL.)
export async function POST(request: Request) {
  try {
    assertSameOriginRequest();

    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isFeatureEnabled(VIDEO_SUBMISSIONS_FLAG))) {
      return NextResponse.json({ error: 'Video submissions are currently closed.' }, { status: 403 });
    }

    enforceRateLimit('upload-video-presign', { maxRequests: 10, windowMs: 60_000 });

    const body = await request.json().catch(() => null);
    const contentType = typeof body?.contentType === 'string' ? body.contentType.toLowerCase() : '';
    const extension = EXTENSIONS[contentType];
    if (!extension) {
      return NextResponse.json({ error: 'Unsupported video type. Use MP4, MOV, or WebM.' }, { status: 400 });
    }

    const filePath = `${user.id}/${Date.now()}-${randomUUID()}.${extension}`;
    const admin = createSupabaseAdminServerClient();

    const { data, error } = await admin.storage.from('event-videos').createSignedUploadUrl(filePath);
    if (error || !data) {
      console.error('Video presign failed:', error?.message);
      return NextResponse.json({ error: 'Failed to start upload' }, { status: 500 });
    }

    // Private bucket: no public URL. The client submits `path`; the server
    // re-validates it and mints signed read URLs for approved clips later.
    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many uploads. Try again in a minute.' }, { status: 429 });
    }
    console.error('video presign error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
