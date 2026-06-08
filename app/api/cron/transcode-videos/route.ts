import { NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/security/server';
import { processPendingVideos } from '@/lib/video/transcode';

export const runtime = 'nodejs';
export const maxDuration = 300; // allow a long transcode (needs Vercel Pro)

// Auto-converts pending video submissions to web-friendly H.264 MP4. Runs every
// minute (vercel.json). One video per run keeps each invocation inside the
// function time limit; bigger/failed ones are flagged needs_manual for admin.
export async function GET(request: Request) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const results = await processPendingVideos(1);
  return NextResponse.json({ processed: results.length, results });
}
