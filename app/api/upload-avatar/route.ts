import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { enforceRateLimit, assertSameOriginRequest } from '@/lib/security/server';

export async function POST(request: Request) {
  assertSameOriginRequest();

  // Verify the user is authenticated before consuming rate limit
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

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

  // Upload using service role key (bypasses RLS)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Support avatar or banner upload
  const uploadType = formData.get('type') as string | null;
  const isBanner = uploadType === 'banner';

  const filePath = isBanner
    ? `banners/${user.id}/banner.jpg`
    : `${user.id}/avatar.jpg`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(filePath, buffer, { upsert: true, contentType: 'image/jpeg' });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from('avatars').getPublicUrl(filePath);
  const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;

  // Also update the profile
  if (isBanner) {
    await admin.from('profiles').update({ banner_url: publicUrl } as any).eq('id', user.id);
  } else {
    await admin.from('profiles').upsert({ id: user.id, avatar_url: publicUrl });
  }

  return NextResponse.json({ url: publicUrl });
}
