import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { assertSameOriginRequest } from '@/lib/security/server';

// GET — fetch all moderatable content
export async function GET() {
  if (!await hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdminServerClient();
  const items: Array<{ id: string; type: string; content: string; author: string; context: string; created_at: string }> = [];

  // Fetch all content in parallel
  const [
    { data: reports },
    { data: reviews },
    { data: comments },
    { data: posts },
  ] = await Promise.all([
    admin.from('reports' as any).select('id, reason, description, status, created_at, reporter_id, reported_user_id, reported_content_type').order('created_at', { ascending: false }).limit(50),
    admin.from('event_reviews').select('id, rating, review_text, created_at, user_id, event_id').order('created_at', { ascending: false }).limit(50),
    admin.from('post_comments').select('id, content, created_at, user_id, post_id').order('created_at', { ascending: false }).limit(50),
    admin.from('posts').select('id, title, content, created_at, user_id').order('created_at', { ascending: false }).limit(50),
  ]);

  // Collect all user IDs and event IDs for batch lookup
  const userIds = new Set<string>();
  const eventIds = new Set<string>();
  for (const r of (reports ?? []) as any[]) { userIds.add(r.reporter_id); }
  for (const r of (reviews ?? []) as any[]) { userIds.add(r.user_id); eventIds.add(r.event_id); }
  for (const c of (comments ?? []) as any[]) { userIds.add(c.user_id); }
  for (const p of (posts ?? []) as any[]) { userIds.add(p.user_id); }

  // Batch fetch profiles and events
  const [{ data: profileRows }, { data: eventRows }] = await Promise.all([
    userIds.size > 0 ? admin.from('profiles').select('id, full_name').in('id', Array.from(userIds)) : { data: [] },
    eventIds.size > 0 ? admin.from('events').select('id, title').in('id', Array.from(eventIds)) : { data: [] },
  ]);

  const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p.full_name ?? 'Unknown']));
  const eventMap = new Map((eventRows ?? []).map((e) => [e.id, e.title ?? 'Unknown']));

  for (const r of (reports ?? []) as any[]) {
    items.push({
      id: r.id,
      type: 'report',
      content: `[${r.reason}] ${r.description || 'No details provided'}`,
      author: profileMap.get(r.reporter_id) ?? 'Unknown',
      context: `Status: ${r.status} · Type: ${r.reported_content_type || 'profile'}`,
      created_at: r.created_at,
    });
  }

  for (const r of (reviews ?? []) as any[]) {
    items.push({
      id: r.id,
      type: 'review',
      content: `${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} ${r.review_text || '(no text)'}`,
      author: profileMap.get(r.user_id) ?? 'Unknown',
      context: `Event: ${eventMap.get(r.event_id) ?? 'Unknown'}`,
      created_at: r.created_at,
    });
  }

  for (const c of (comments ?? []) as any[]) {
    items.push({
      id: c.id,
      type: 'comment',
      content: c.content,
      author: profileMap.get(c.user_id) ?? 'Unknown',
      context: `On post ${c.post_id?.slice(0, 8)}...`,
      created_at: c.created_at,
    });
  }

  for (const p of (posts ?? []) as any[]) {
    items.push({
      id: p.id,
      type: 'post',
      content: p.title ? `${p.title}: ${p.content}` : p.content,
      author: profileMap.get(p.user_id) ?? 'Unknown',
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
  assertSameOriginRequest();
  if (!await hasValidAdminSessionCookie()) {
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

  await admin.from(table as 'event_reviews' | 'post_comments' | 'posts' | 'reports').delete().eq('id', id);

  return NextResponse.json({ success: true });
}
