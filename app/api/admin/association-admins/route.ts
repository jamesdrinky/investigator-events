import { NextResponse } from 'next/server';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';

// IE-admin management of association managers: who is allowed into each
// association's console. Grant by the user's account email.

async function requireAdmin(mutating = true) {
  if (mutating) assertSameOriginRequest();
  if (!(await hasValidAdminSessionCookie())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

async function findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  const supabase = createSupabaseAdminServerClient();
  const target = email.trim().toLowerCase();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const match = data.users.find((u) => (u.email ?? '').toLowerCase() === target);
    if (match) return { id: match.id, email: match.email ?? target };
    if (data.users.length < 200) return null;
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin(false);
  if (denied) return denied;

  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await (supabase
    .from('association_admins' as any)
    .select('id, user_id, role, created_at, association_pages(name, slug)')
    .order('created_at', { ascending: false }) as any);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // user_id references auth.users, so look profiles up separately.
  const rows = (data ?? []) as any[];
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const profileMap: Record<string, { full_name: string | null; username: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, username').in('id', userIds);
    for (const p of profiles ?? []) profileMap[(p as any).id] = { full_name: (p as any).full_name, username: (p as any).username };
  }
  const admins = rows.map((r) => ({ ...r, profile: profileMap[r.user_id] ?? null }));
  return NextResponse.json({ admins });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const associationPageId = typeof body?.associationPageId === 'string' ? body.associationPageId : '';
  if (!email.includes('@') || !associationPageId) {
    return NextResponse.json({ error: 'Email and association are required' }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: 'No IE account with that email — they need to sign up first' }, { status: 404 });
  }

  const supabase = createSupabaseAdminServerClient();
  const { data: existing } = await (supabase
    .from('association_admins' as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('association_page_id', associationPageId)
    .maybeSingle() as any);
  if (existing) return NextResponse.json({ error: 'Already a manager of that association' }, { status: 400 });

  const { error } = await (supabase.from('association_admins' as any) as any).insert({
    user_id: user.id,
    association_page_id: associationPageId,
    role: 'manager',
  });
  if (error) {
    const message = error.code === '23505' ? 'Already a manager of that association' : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createSupabaseAdminServerClient();
  const { error } = await (supabase.from('association_admins' as any) as any).delete().eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
