import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const code = body?.code?.trim().toUpperCase();
    const associationName = body?.association_name?.trim();

    if (!code || !associationName) {
      return NextResponse.json({ error: 'Code and association are required' }, { status: 400 });
    }

    const admin = createSupabaseAdminServerClient();

    // Look up the verification code
    const { data: codeRow } = await admin
      .from('association_verification_codes' as any)
      .select('id, association_page_id, expires_at, is_active, usage_count')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (!codeRow) {
      return NextResponse.json({ error: 'Invalid or expired verification code. Contact your association for the current code.' }, { status: 400 });
    }

    const row = codeRow as any;

    // Check expiry
    if (new Date(row.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This verification code has expired. Contact your association for a new code.' }, { status: 400 });
    }

    // Verify the code belongs to the claimed association
    const { data: assocPage } = await admin
      .from('association_pages')
      .select('id, name, slug')
      .eq('id', row.association_page_id)
      .single();

    if (!assocPage) {
      return NextResponse.json({ error: 'Association not found' }, { status: 400 });
    }

    // Flexible match — check if the association name matches the page name or slug
    const pageNameLower = (assocPage as any).name.toLowerCase();
    const pageSlug = (assocPage as any).slug.toLowerCase();
    const claimedLower = associationName.toLowerCase();

    if (!pageNameLower.includes(claimedLower) && !pageSlug.includes(claimedLower) && !claimedLower.includes(pageSlug)) {
      return NextResponse.json({ error: 'This code does not match the selected association.' }, { status: 400 });
    }

    // Check if already verified and not expired
    const { data: existing } = await admin
      .from('member_verifications')
      .select('id, status, expires_at')
      .eq('user_id', user.id)
      .eq('association_name', associationName)
      .single();

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 12 months from now

    if (existing) {
      // Update existing verification
      await admin
        .from('member_verifications')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          verification_code_id: row.id,
          expires_at: expiresAt.toISOString(),
          association_page_id: row.association_page_id,
        } as any)
        .eq('id', (existing as any).id);
    } else {
      // Create new verification
      await admin
        .from('member_verifications')
        .insert({
          user_id: user.id,
          association_name: associationName,
          status: 'verified',
          verified_at: new Date().toISOString(),
          verification_code_id: row.id,
          expires_at: expiresAt.toISOString(),
          association_page_id: row.association_page_id,
        } as any);
    }

    // Atomically increment usage count on the code
    const { error: rpcErr } = await (admin.rpc as any)('increment_verification_usage', { code_id: row.id });
    // Fallback if RPC doesn't exist yet
    if (rpcErr?.code === '42883') {
      await admin
        .from('association_verification_codes' as any)
        .update({ usage_count: ((row as any).usage_count ?? 0) + 1 } as any)
        .eq('id', row.id);
    }

    return NextResponse.json({
      message: 'Membership verified',
      association: associationName,
      expires_at: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error('verify-membership error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
