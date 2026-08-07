import { NextResponse } from 'next/server';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';

// Admin CRUD for monitored event sources (the pipeline's watch list).

// Same-origin check only on mutating methods — browsers omit the Origin
// header on same-origin GETs, so asserting there would 500 in production.
async function requireAdmin(mutating = true) {
  if (mutating) assertSameOriginRequest();
  if (!(await hasValidAdminSessionCookie())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin(false);
  if (denied) return denied;

  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await (supabase
    .from('event_sources' as any)
    .select('*')
    .order('created_at', { ascending: false }) as any);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sources: data ?? [] });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const url = typeof body?.url === 'string' ? body.url.trim() : '';
  if (!name || !/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: 'Name and a valid http(s) URL are required' }, { status: 400 });
  }

  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await (supabase.from('event_sources' as any) as any)
    .insert({
      name,
      url,
      association: body.association?.trim() || null,
      country_hint: body.countryHint?.trim() || null,
      region_hint: body.regionHint?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    const message = error.code === '23505' ? 'That URL is already being monitored' : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ source: data });
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (typeof body.active === 'boolean') updates.active = body.active;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const supabase = createSupabaseAdminServerClient();
  const { error } = await (supabase.from('event_sources' as any) as any).update(updates).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createSupabaseAdminServerClient();
  const { error } = await (supabase.from('event_sources' as any) as any).delete().eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
