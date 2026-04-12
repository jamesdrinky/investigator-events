import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';

// GET — fetch all moderatable content
export async function GET() {
  if (!hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdminServerClient();
  const items: Array<{ id: string; type: string; content: string; author: string; context: string; created_at: string }> = [];

  // Reports (always show first)
  const { data: reports } = await admin
    .from('reports' as any)
    .select('id, reason, description, status, created_at, reporter_id, reported_user_id, reported_content_type')
    .order('created_at', { ascending: false })
    .limit(50);

  for (const r of (reports ?? []) as any[]) {
    const { data: reporter } = await admin.from('profiles').select('full_name').eq('id', r.reporter_id).single();
    items.push({
      id: r.id,
      type: 'report',
      content: `[${r.reason}] ${r.description || 'No details provided'}`,
      author: (reporter as any)?.full_name ?? 'Unknown',
      context: `Status: ${r.status} · Type: ${r.reported_content_type || 'profile'}`,
      created_at: r.created_at,
    });
  }

  // Reviews
  const { data: reviews } = await admin
    .from('event_reviews')
    .select('id, rating, review_text, created_at, user_id, event_id')
    .order('created_at', { ascending: false })
    .limit(50);

  for (const r of (reviews ?? []) as any[]) {
    const { data: profile } = await admin.from('profiles').select('full_name').eq('id', r.user_id).single();
    const { data: event } = await admin.from('events').select('title').eq('id', r.event_id).single();
    items.push({
      id: r.id,
      type: 'review',
      content: `${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} ${r.review_text || '(no text)'}`,
      author: (profile as any)?.full_name ?? 'Unknown',
      context: `Event: ${(event as any)?.title ?? 'Unknown'}`,
      created_at: r.created_at,
    });
  }

  // Post comments
  const { data: comments } = await admin
    .from('post_comments')
    .select('id, content, created_at, user_id, post_id')
    .order('created_at', { ascending: false })
    .limit(50);

  for (const c of (comments ?? []) as any[]) {
    const { data: profile } = await admin.from('profiles').select('full_name').eq('id', c.user_id).single();
    items.push({
      id: c.id,
      type: 'comment',
      content: c.content,
      author: (profile as any)?.full_name ?? 'Unknown',
      context: `On post ${c.post_id?.slice(0, 8)}...`,
      created_at: c.created_at,
    });
  }

  // Posts
  const { data: posts } = await admin
    .from('posts')
    .select('id, title, content, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(50);

  for (const p of (posts ?? []) as any[]) {
    const { data: profile } = await admin.from('profiles').select('full_name').eq('id', p.user_id).single();
    items.push({
      id: p.id,
      type: 'post',
      content: p.title ? `${p.title}: ${p.content}` : p.content,
      author: (profile as any)?.full_name ?? 'Unknown',
      context: '',
      created_at: p.created_at,
    });
  }

  // Sort: reports first, then by date
  items.sort((a, b) => {
    if (a.type === 'report' && b.type !== 'report') return -1;
    if (a.type !== 'report' && b.type === 'report') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return NextResponse.json({ items });
}

// DELETE — remove content
export async function DELETE(request: Request) {
  if (!hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { id, type } = body ?? {};

  if (!id || !type) {
    return NextResponse.json({ error: 'id and type required' }, { status: 400 });
  }

  const admin = createSupabaseAdminServerClient();

  const tableMap: Record<string, string> = {
    review: 'event_reviews',
    comment: 'post_comments',
    post: 'posts',
    report: 'reports',
  };

  const table = tableMap[type];
  if (!table) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  // For posts, also delete related comments and likes
  if (type === 'post') {
    await admin.from('post_comments').delete().eq('post_id', id);
    await admin.from('post_likes').delete().eq('post_id', id);
  }

  await admin.from(table).delete().eq('id', id);

  return NextResponse.json({ success: true });
}
