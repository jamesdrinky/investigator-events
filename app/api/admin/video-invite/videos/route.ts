import { NextResponse } from 'next/server';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { fetchApprovedVideosForPicker } from '@/lib/data/association-videos';

export const dynamic = 'force-dynamic';

// Populates the video picker in the admin video-invite composer.
export async function GET() {
  if (!await hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const videos = await fetchApprovedVideosForPicker();
  return NextResponse.json({ videos });
}
