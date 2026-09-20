import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Set once someone subscribes, so logged-out visitors stop being asked.
// Not exported: Next only allows a fixed set of exports from a route file.
const NEWSLETTER_COOKIE = 'ie_newsletter';

/**
 * Is this visitor already on the list?
 *
 * Two independent signals, because most visitors are logged out:
 *   - a signed-in user's account email against newsletter_subscribers
 *   - the ie_newsletter cookie, set when anyone subscribes from this browser
 *
 * Fails open as "not subscribed" — showing a sign-up box to an existing
 * subscriber is a small annoyance; hiding it from someone who never
 * subscribed costs a subscriber.
 */
export async function GET() {
  try {
    const jar = await cookies();
    if (jar.get(NEWSLETTER_COOKIE)?.value === '1') {
      return NextResponse.json({ subscribed: true, via: 'cookie' });
    }

    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email?.trim().toLowerCase();
    if (!email) return NextResponse.json({ subscribed: false });

    const admin = createSupabaseAdminServerClient();
    const { data } = await (admin
      .from('newsletter_subscribers' as never)
      .select('status')
      .eq('email', email)
      .maybeSingle() as any);

    // 'unsubscribed' deliberately counts as not subscribed — they may want
    // back on, and the quiet inline box is the least pushy way to offer it.
    const subscribed = data?.status === 'active' || data?.status === 'pending';
    return NextResponse.json({ subscribed, via: subscribed ? 'account' : null });
  } catch {
    return NextResponse.json({ subscribed: false });
  }
}
