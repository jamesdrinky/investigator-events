import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest, enforceRateLimit, RateLimitError, validateImageMagicBytes } from '@/lib/security/server';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export async function POST(request: Request) {
  try {
    assertSameOriginRequest();

    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    enforceRateLimit('upload-message-image', { maxRequests: 20, windowMs: 60_000 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 8MB.' }, { status: 400 });
    }

    if (!EXTENSIONS[file.type]) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!validateImageMagicBytes(buffer)) {
      return NextResponse.json({ error: 'File content does not match a valid image format.' }, { status: 400 });
    }

    const extension = EXTENSIONS[file.type];
    const filePath = `messages/${user.id}/${Date.now()}-${randomUUID()}.${extension}`;
    const admin = createSupabaseAdminServerClient();

    const { error: uploadError } = await admin.storage
      .from('avatars')
      .upload(filePath, buffer, { upsert: false, contentType: file.type });

    if (uploadError) {
      console.error('Message image upload failed:', uploadError.message);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const { data: urlData } = admin.storage.from('avatars').getPublicUrl(filePath);
    return NextResponse.json({ url: `${urlData.publicUrl}?v=${Date.now()}` });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many uploads. Try again in a minute.' }, { status: 429 });
    }
    console.error('Message image upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
