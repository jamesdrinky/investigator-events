import { NextResponse } from 'next/server';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { enforceRateLimit, assertSameOriginRequest, RateLimitError, validateImageMagicBytes } from '@/lib/security/server';

export async function POST(request: Request) {
  try {
  assertSameOriginRequest();

  // Verify the user is authenticated before consuming rate limit
  const supabase = await createSupabaseSSRServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  enforceRateLimit('upload-avatar', { maxRequests: 10, windowMs: 60_000 });

  // Get the file from the request
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.' }, { status: 400 });
  }

  // Validate file content matches an actual image (prevents MIME spoofing)
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!validateImageMagicBytes(buffer)) {
    return NextResponse.json({ error: 'File content does not match a valid image format.' }, { status: 400 });
  }

  // Upload using service role key (bypasses RLS)
  const admin = createSupabaseAdminServerClient();

  // Support avatar or banner upload
  const uploadType = formData.get('type') as string | null;
  const isBanner = uploadType === 'banner';

  const filePath = isBanner
    ? `banners/${user.id}/banner.jpg`
    : `${user.id}/avatar.jpg`;

  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(filePath, buffer, { upsert: true, contentType: 'image/jpeg' });

  if (uploadError) {
    console.error('Avatar upload failed:', uploadError.message);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from('avatars').getPublicUrl(filePath);
  const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;

  // Also update the profile
  if (isBanner) {
    await admin.from('profiles').update({ banner_url: publicUrl } as any).eq('id', user.id);
  } else {
    await admin.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
  }

  return NextResponse.json({ url: publicUrl });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
