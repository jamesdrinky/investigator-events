import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { assertSameOriginRequest } from '@/lib/security/server';

function generateCode(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No 0/O/1/I to avoid confusion
  let code = prefix.toUpperCase().slice(0, 6) + '-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET — list all codes
export async function GET() {
  if (!hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdminServerClient();

  const { data: codes } = await admin
    .from('association_verification_codes' as any)
    .select('id, code, is_active, expires_at, usage_count, created_at, association_page_id')
    .order('created_at', { ascending: false });

  // Get association names
  const { data: pages } = await admin
    .from('association_pages')
    .select('id, name, slug');

  const pageMap = new Map((pages ?? []).map((p: any) => [p.id, p]));

  const enriched = (codes ?? []).map((c: any) => ({
    ...c,
    association_name: pageMap.get(c.association_page_id)?.name ?? 'Unknown',
    association_slug: pageMap.get(c.association_page_id)?.slug ?? '',
  }));

  return NextResponse.json({ codes: enriched });
}

// POST — generate a new code
export async function POST(request: Request) {
  assertSameOriginRequest();
  if (!hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const associationPageId = body?.association_page_id;

  if (!associationPageId) {
    return NextResponse.json({ error: 'association_page_id is required' }, { status: 400 });
  }

  const admin = createSupabaseAdminServerClient();

  // Get association info for code prefix
  const { data: page } = await admin
    .from('association_pages')
    .select('id, name, slug')
    .eq('id', associationPageId)
    .single();

  if (!page) {
    return NextResponse.json({ error: 'Association not found' }, { status: 404 });
  }

  const prefix = (page as any).slug.toUpperCase().slice(0, 4);
  const code = generateCode(prefix);

  // Deactivate any existing active codes for this association
  await admin
    .from('association_verification_codes' as any)
    .update({ is_active: false } as any)
    .eq('association_page_id', associationPageId)
    .eq('is_active', true);

  // Create new code — expires in 12 months
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const { data: newCode, error } = await admin
    .from('association_verification_codes' as any)
    .insert({
      association_page_id: associationPageId,
      code,
      is_active: true,
      expires_at: expiresAt.toISOString(),
      usage_count: 0,
    } as any)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create code' }, { status: 500 });
  }

  return NextResponse.json({
    code,
    association: (page as any).name,
    expires_at: expiresAt.toISOString(),
  });
}

// DELETE — deactivate a code
export async function DELETE(request: Request) {
  assertSameOriginRequest();
  if (!hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const codeId = body?.code_id;

  if (!codeId) {
    return NextResponse.json({ error: 'code_id is required' }, { status: 400 });
  }

  const admin = createSupabaseAdminServerClient();
  await admin
    .from('association_verification_codes' as any)
    .update({ is_active: false } as any)
    .eq('id', codeId);

  return NextResponse.json({ success: true });
}
