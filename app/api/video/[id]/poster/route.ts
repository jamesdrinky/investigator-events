import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Serves a video's auto-generated poster image by id, streaming the bytes
// directly (no redirect) so a <video poster> reliably loads it on every device.
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

  let target: string;
  if (/^https?:\/\//i.test(path)) {
    target = path;
  } else {
    const { data: signed, error } = await admin.storage
      .from('event-videos')
      .createSignedUrl(path, 60 * 60);
    if (error || !signed?.signedUrl) return new NextResponse('Not found', { status: 404 });
    target = signed.signedUrl;
  }

  const upstream = await fetch(target);
  if (!upstream.ok) return new NextResponse('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('content-type', upstream.headers.get('content-type') || 'image/jpeg');
  const len = upstream.headers.get('content-length');
  if (len) headers.set('content-length', len);
  headers.set('cache-control', 'public, max-age=3600');

  return new NextResponse(upstream.body, { status: 200, headers });
}
