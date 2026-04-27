'use server';

import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const supabase = createSupabaseAdminServerClient();

  // First check if the token matches a subscriber
  const { data: subscriber } = await supabase
    .from('newsletter_subscribers' as never)
    .select('id, status')
    .eq('unsubscribe_token', token)
    .single() as any;

  if (!subscriber) {
    // Token doesn't match anyone (e.g. preview emails) — redirect gracefully
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
}
