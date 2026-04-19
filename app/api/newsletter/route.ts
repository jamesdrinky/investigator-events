import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { enforceRateLimit, assertSameOriginRequest, RateLimitError } from '@/lib/security/server';
import { buildConfirmationEmail } from '@/lib/email/confirmation-email';

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

    // Check if already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers' as never)
      .select('email, status, unsubscribe_token')
      .eq('email', email)
      .maybeSingle() as any;

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ message: 'Already subscribed' });
      }
      if (existing.status === 'unsubscribed') {
        // Re-subscribe
        await supabase
          .from('newsletter_subscribers' as never)
          .update({ status: 'pending', unsubscribed_at: null, confirmed_at: null } as never)
          .eq('email', email);
      }
      // Resend confirmation for pending
      const token = existing.unsubscribe_token;
      if (token) {
        await sendConfirmationEmail(email, token);
      }
      return NextResponse.json({ message: 'Check your email to confirm your subscription' });
    }

    // Insert new subscriber as pending
    const { data: inserted, error: insertError } = await supabase
      .from('newsletter_subscribers' as never)
      .insert({ email, status: 'pending' } as never)
      .select('unsubscribe_token')
      .single() as any;

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ message: 'Already subscribed' });
      }
      console.error('newsletter_insert_failed', { code: insertError.code });
      return NextResponse.json({ error: 'Unable to subscribe right now' }, { status: 500 });
    }

    // Send confirmation email
    if (inserted?.unsubscribe_token) {
      await sendConfirmationEmail(email, inserted.unsubscribe_token);
    }

    return NextResponse.json({ message: 'Check your email to confirm your subscription' });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    console.error('newsletter_request_failed', {
      name: error instanceof Error ? error.name : 'unknown'
    });
    return NextResponse.json({ error: 'Unable to subscribe right now' }, { status: 500 });
  }
}

async function sendConfirmationEmail(email: string, token: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const resend = new Resend(resendKey);
  const html = buildConfirmationEmail(token);

  await resend.emails.send({
    from: 'Investigator Events <info@investigatorevents.com>',
    to: email,
    subject: 'Confirm your subscription — Investigator Events',
    html,
  }).catch((err) => console.error('confirmation_email_failed', err));
}
