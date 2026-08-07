import { NextResponse } from 'next/server';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';
import { scanSource, type SourceRow } from '@/lib/pipeline/scan';

// "Scan now" — run the pipeline for one source on demand from the admin
// panel, without waiting for the daily cron.
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

  const result = await scanSource(source as SourceRow);
  return NextResponse.json({ ok: result.status === 'ok', result });
}
