import { NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/security/server';
import { scanSource, sweepAllSources } from '@/lib/pipeline/scan';

// Nightly source check, cheapest-first:
// 1. Sweep every active source — fetch + diff against last snapshot. Free,
//    so no rationing. Changed pages get flagged for the admin's weekly
//    manual sweep with the new date-ish lines already extracted.
// 2. If ANTHROPIC_API_KEY is configured, ALSO run AI extraction — but only
//    on pages that actually changed tonight (up to 3), so tokens are never
//    spent re-reading an unchanged page.
export const maxDuration = 300;

export async function GET(request: Request) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const sweep = await sweepAllSources(60).catch((err) => {
    console.error('Source sweep failed:', err);
    return [];
  });

  const changed = sweep.filter((r) => r.status === 'changed' || r.status === 'first_fetch');

  let extracted: unknown[] = [];
  if (process.env.ANTHROPIC_API_KEY && changed.length > 0) {
    const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
    const supabase = createSupabaseAdminServerClient();
    const { data: sources } = await (supabase
      .from('event_sources' as any)
      .select('id, name, url, association, country_hint, region_hint')
      .in('id', changed.slice(0, 3).map((r) => r.sourceId)) as any);

    for (const source of (sources ?? []) as any[]) {
      extracted.push(await scanSource(source).catch((err) => ({ sourceId: source.id, error: String(err) })));
    }
  }

  return NextResponse.json({
    ok: true,
    swept: sweep.length,
    changed: changed.length,
    sweep,
    extracted,
    timestamp: new Date().toISOString(),
  });
}
