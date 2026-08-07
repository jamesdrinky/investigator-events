import { NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/security/server';
import { scanDueSources } from '@/lib/pipeline/scan';

// Daily scan of monitored event sources. Each source is rescanned roughly
// weekly (3 per day, oldest first), so adding more sources spreads the load
// automatically. Extraction uses Claude, so runs need ANTHROPIC_API_KEY.
export const maxDuration = 300;

export async function GET(request: Request) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const results = await scanDueSources(3).catch((err) => {
    console.error('Source scan failed:', err);
    return [];
  });

  return NextResponse.json({
    ok: true,
    scanned: results.length,
    queued: results.reduce((sum, r) => sum + r.queued, 0),
    results,
    timestamp: new Date().toISOString(),
  });
}
