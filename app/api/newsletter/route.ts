import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { enforceRateLimit, assertSameOriginRequest } from '@/lib/security/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export async function POST(request: Request) {
  try {
    assertSameOriginRequest();
    enforceRateLimit('newsletter', { maxRequests: 10, windowMs: 60_000 });

    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email);

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = createSupabaseAdminServerClient();
    const { data: existingSubscriber, error: selectError } = await supabase
      .from('newsletter_subscribers' as never)
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (selectError) {
      console.error('newsletter_select_failed', { code: selectError.code });
      return NextResponse.json({ error: 'Unable to subscribe right now' }, { status: 500 });
    }

    if (existingSubscriber) {
      return NextResponse.json({ message: 'Already subscribed' });
    }

    const { error: insertError } = await supabase.from('newsletter_subscribers' as never).insert({ email } as never);

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ message: 'Already subscribed' });
      }

      console.error('newsletter_insert_failed', { code: insertError.code });
      return NextResponse.json({ error: 'Unable to subscribe right now' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('newsletter_request_failed', {
      name: error instanceof Error ? error.name : 'unknown'
    });

    return NextResponse.json({ error: 'Unable to subscribe right now' }, { status: 500 });
  }
}
