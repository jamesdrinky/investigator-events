import { NextResponse } from 'next/server';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { makeFeedToken } from '@/lib/utils/personal-feed';

// Mint the signed-in user's personal feed links ("every event from all your
// associations, in your own calendar").
export async function GET() {
  const ssr = await createSupabaseSSRServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in first' }, { status: 401 });

  const supabase = createSupabaseAdminServerClient();
  const { count } = await (supabase
    .from('user_associations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id) as any);

  const token = makeFeedToken(user.id);
  const httpsUrl = `https://www.investigatorevents.com/api/ics/mine/${token}`;
  const webcalUrl = httpsUrl.replace(/^https:/, 'webcal:');

  return NextResponse.json({
    associations: count ?? 0,
    url: httpsUrl,
    webcal: webcalUrl,
    google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`,
  });
}
