import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { enforceRateLimitAsync, RateLimitError } from '@/lib/security/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  try {
    await enforceRateLimitAsync('newsletter-unsubscribe', { maxRequests: 10, windowMs: 60_000 });

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || !UUID_REGEX.test(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const supabase = createSupabaseAdminServerClient();

    // First check if the token matches a subscriber
    const { data: subscriber } = await supabase
      .from('newsletter_subscribers' as never)
      .select('id, status')
      .eq('unsubscribe_token', token)
      .single() as any;

    if (!subscriber) {
      return NextResponse.redirect(new URL('/unsubscribe?success=true', request.url));
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.redirect(new URL('/unsubscribe?success=true', request.url));
    }

    const { error } = await supabase
      .from('newsletter_subscribers' as never)
      .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() } as never)
      .eq('unsubscribe_token', token);

    if (error) {
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }

    return NextResponse.redirect(new URL('/unsubscribe?success=true', request.url));
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
