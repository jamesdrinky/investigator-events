import { NextResponse } from 'next/server';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';
import { scanSource, sweepSource, type SourceRow } from '@/lib/pipeline/scan';

// "Check now" — sweep one source on demand (fetch + diff, free). If an
// Anthropic key is configured AND the page changed, also run AI extraction.
export const maxDuration = 300;

export async function POST(request: Request) {
  assertSameOriginRequest();
  if (!(await hasValidAdminSessionCookie())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Missing source id' }, { status: 400 });

  const supabase = createSupabaseAdminServerClient();
  const { data: source, error } = await (supabase
    .from('event_sources' as any)
    .select('id, name, url, association, country_hint, region_hint')
    .eq('id', body.id)
    .single() as any);

  if (error || !source) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

  const sweep = await sweepSource(source as SourceRow);

  let extraction = null;
  if (process.env.ANTHROPIC_API_KEY && (sweep.status === 'changed' || sweep.status === 'first_fetch')) {
    extraction = await scanSource(source as SourceRow).catch(() => null);
  }

  return NextResponse.json({ ok: sweep.status !== 'fetch_error', sweep, extraction });
}
