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
  const { data, error } = await supabase
    .from('newsletter_subscribers' as never)
    .update({ status: 'active', confirmed_at: new Date().toISOString() } as never)
    .eq('unsubscribe_token', token)
    .eq('status', 'pending')
    .select('email') as any;

  if (error) {
    return NextResponse.json({ error: 'Confirmation failed' }, { status: 500 });
  }

  // Redirect to success page
  return NextResponse.redirect(new URL('/weekly?confirmed=true', request.url));
}
