import { NextResponse } from 'next/server';
import { processOutreachQueue } from '@/lib/email/association-outreach';
import { verifyCronSecret } from '@/lib/security/server';

export async function GET(request: Request) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const result = await processOutreachQueue();

  return NextResponse.json({
    ok: true,
    ...result,
    timestamp: new Date().toISOString(),
  });
}
