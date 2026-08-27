import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import {
  enforceRateLimitAsync,
  RateLimitError,
  verifyNewsletterOptInToken,
} from '@/lib/security/server';

// Reads headers via the rate limiter, so it can never be prerendered.
export const dynamic = 'force-dynamic';

/**
 * One-click subscribe for members who were never asked — chiefly the OAuth
 * signups, who never saw the sign-up form's checkbox.
 *
 * Lands them as 'active' rather than 'pending': the click already came from
 * their own inbox, so a second confirmation email would be asking them to
 * prove the same thing twice. Anyone who reaches here as an existing
 * unsubscribed row keeps that choice — an old invite link must never
 * resurrect someone who has since opted out.
 */
export async function GET(request: Request) {
  try {
    await enforceRateLimitAsync('newsletter-opt-in', { maxRequests: 10, windowMs: 60_000 });

    const token = new URL(request.url).searchParams.get('token');
    const email = token ? verifyNewsletterOptInToken(token) : null;
    if (!email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const supabase = createSupabaseAdminServerClient();
    const { data: existing } = await (supabase
      .from('newsletter_subscribers' as never)
      .select('id, status')
      .ilike('email', email)
      .maybeSingle() as unknown as Promise<{ data: { id: string; status: string } | null }>);

    if (existing?.status === 'unsubscribed') {
      return NextResponse.redirect(new URL('/weekly?already=unsubscribed', request.url));
    }

    if (existing) {
      await (supabase
        .from('newsletter_subscribers' as never)
        .update({ status: 'active', confirmed_at: new Date().toISOString() } as never)
        .eq('id', existing.id) as unknown as Promise<unknown>);
    } else {
      await (supabase
        .from('newsletter_subscribers' as never)
        .insert({
          email,
          status: 'active',
          confirmed_at: new Date().toISOString(),
        } as never) as unknown as Promise<unknown>);
    }

    return NextResponse.redirect(new URL('/weekly?confirmed=true', request.url));
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    console.error('Newsletter opt-in failed:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
