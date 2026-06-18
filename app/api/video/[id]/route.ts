import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Streams an approved video with HTTP Range support so it plays reliably on
// EVERY device — including iOS/Safari, which will not play a ranged <video>
// source served over a 302 redirect (the previous behaviour). We resolve the
// storage object server-side, forward the browser's Range header, and relay the
// upstream response (typically 206 Partial Content) so seeking/streaming works.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const admin: any = createSupabaseAdminServerClient();

  const { data } = await admin
    .from('association_videos')
    .select('video_url')
    .eq('id', params.id)
    .single();

  const path = data?.video_url as string | undefined;
  if (!path) return new NextResponse('Not found', { status: 404 });

  // Resolve to a fetchable URL: pass full URLs straight through (e.g. Blob),
  // otherwise mint a fresh signed URL for the private storage object.
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

  // Forward the Range header so the upstream returns 206 + Content-Range.
  const range = req.headers.get('range');
  const upstream = await fetch(target, { headers: range ? { Range: range } : {} });
  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse('Not found', { status: 404 });
  }

  const headers = new Headers();
  for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified']) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  if (!headers.has('content-type')) headers.set('content-type', 'video/mp4');
  if (!headers.has('accept-ranges')) headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', 'public, max-age=3600');

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}
