import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Streams an approved video by minting a FRESH signed URL on every request and
// redirecting to it. Pages embed a stable `/api/video/<id>` src instead of a
// signed URL, so a cached page can never serve an expired link.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin: any = createSupabaseAdminServerClient();

  const { data } = await admin
    .from('association_videos')
    .select('video_url, status, transcode_status')
    .eq('id', params.id)
    .single();

  const path = data?.video_url as string | undefined;
  if (!path) return new NextResponse('Not found', { status: 404 });

  // Already a full URL (e.g. phase-2 Blob) — redirect straight to it.
  if (/^https?:\/\//i.test(path)) {
    const res = NextResponse.redirect(path);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  const { data: signed, error } = await admin.storage.from('event-videos').createSignedUrl(path, 60 * 60);
  if (error || !signed?.signedUrl) return new NextResponse('Not found', { status: 404 });

  const res = NextResponse.redirect(signed.signedUrl);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
