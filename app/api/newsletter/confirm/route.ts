import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { enforceRateLimitAsync, RateLimitError } from '@/lib/security/server';

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
    const { error } = await supabase
      .from('newsletter_subscribers' as never)
      .update({ status: 'active', confirmed_at: new Date().toISOString() } as never)
      .eq('unsubscribe_token', token)
      .eq('status', 'pending') as any;

    if (error) {
      return NextResponse.json({ error: 'Confirmation failed' }, { status: 500 });
    }

    return NextResponse.redirect(new URL('/weekly?confirmed=true', request.url));
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
