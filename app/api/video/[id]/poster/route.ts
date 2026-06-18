import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Serves a video's auto-generated poster image by id. A stable URL (so cached
// pages never hold an expired signed link); redirects to a fresh signed URL.
// 404 when the video has no poster yet (the player falls back to a frame).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin: any = createSupabaseAdminServerClient();

  const { data } = await admin
    .from('association_videos')
    .select('thumbnail_url')
    .eq('id', params.id)
    .single();

  const path = data?.thumbnail_url as string | undefined;
  if (!path) return new NextResponse('Not found', { status: 404 });

  if (/^https?:\/\//i.test(path)) {
    const res = NextResponse.redirect(path);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  const { data: signed, error } = await admin.storage
    .from('event-videos')
    .createSignedUrl(path, 60 * 60);
  if (error || !signed?.signedUrl) return new NextResponse('Not found', { status: 404 });

  const res = NextResponse.redirect(signed.signedUrl);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
