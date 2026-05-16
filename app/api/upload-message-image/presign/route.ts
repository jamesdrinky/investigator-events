import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest, enforceRateLimit, RateLimitError } from '@/lib/security/server';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

// Returns a presigned upload URL so the client can PUT the photo straight to
// Supabase storage and bypass Vercel's 4.5 MB request body limit (which was
// silently killing iPhone photo uploads at the edge — request never even
// reached the previous /api/upload-message-image function).
export async function POST(request: Request) {
  try {
    assertSameOriginRequest();

    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    enforceRateLimit('upload-message-image-presign', { maxRequests: 30, windowMs: 60_000 });

    const body = await request.json().catch(() => null);
    const contentType = typeof body?.contentType === 'string' ? body.contentType.toLowerCase() : '';
    const extension = EXTENSIONS[contentType];
    if (!extension) {
      return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
    }

    const filePath = `messages/${user.id}/${Date.now()}-${randomUUID()}.${extension}`;
    const admin = createSupabaseAdminServerClient();

    const { data, error } = await admin.storage.from('avatars').createSignedUploadUrl(filePath);
    if (error || !data) {
      console.error('Presign failed:', error?.message);
      return NextResponse.json({ error: 'Failed to start upload' }, { status: 500 });
    }

    const { data: urlData } = admin.storage.from('avatars').getPublicUrl(filePath);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl: urlData.publicUrl,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many uploads. Try again in a minute.' }, { status: 429 });
    }
    console.error('presign error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
