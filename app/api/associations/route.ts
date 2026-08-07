import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

// Public list of associations (name + slug) — the single source of truth for
// dropdowns like profile memberships, so they can never drift from the
// association pages again.
export const revalidate = 3600;

export async function GET() {
  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await (supabase
    .from('association_pages')
    .select('slug, name')
    .order('name') as any);

  if (error) return NextResponse.json({ associations: [] }, { status: 500 });
  return NextResponse.json(
    { associations: data ?? [] },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  );
}
