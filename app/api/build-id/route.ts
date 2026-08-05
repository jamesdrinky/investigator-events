import { NextResponse } from 'next/server';

// Tiny always-fresh endpoint the running client polls to notice it's stale.
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? 'dev' },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}
