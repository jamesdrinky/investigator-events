import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { enforceRateLimitAsync, RateLimitError } from '@/lib/security/server';
import { sendCatchUpIssue } from '@/lib/email/catch-up-issue';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  try {
    await enforceRateLimitAsync('newsletter-confirm', { maxRequests: 10, windowMs: 60_000 });

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || !UUID_REGEX.test(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const supabase = createSupabaseAdminServerClient();
    const { data: confirmed, error } = await supabase
      .from('newsletter_subscribers' as never)
      .update({ status: 'active', confirmed_at: new Date().toISOString() } as never)
      .eq('unsubscribe_token', token)
      .eq('status', 'pending')
      .select('email')
      .maybeSingle() as any;

    if (error) {
      return NextResponse.json({ error: 'Confirmation failed' }, { status: 500 });
    }

    // Someone confirming on a Tuesday has just been promised a weekly
    // briefing and would hear nothing for six days. Send them the issue
    // that already went out this week. No-ops when this week's send has
    // not happened yet, so nobody gets it twice.
    //
    // Awaited on purpose. Fire-and-forget looks tempting for a courtesy
    // send, but this runs on serverless: the moment the redirect is
    // returned the function can be frozen, and the send would silently
    // never happen. It also reads events through unstable_cache, which
    // needs the request context that a detached promise may have lost.
    // sendCatchUpIssue swallows its own errors, so awaiting cannot fail
    // the confirmation — it only delays the redirect by a beat.
    if (confirmed?.email) {
      await sendCatchUpIssue(supabase, confirmed.email, token);
    }

    return NextResponse.redirect(new URL('/weekly?confirmed=true', request.url));
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
