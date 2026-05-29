import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import {
  enforceRateLimitAsync,
  enforceRateLimitForKeyAsync,
  assertSameOriginRequest,
  hashRateLimitKey,
  getClientIdentifier,
  RateLimitError
} from '@/lib/security/server';
import { verifyTurnstileToken } from '@/lib/security/turnstile';
import { buildConfirmationEmail } from '@/lib/email/confirmation-email';
import { isDisposableEmail } from '@/lib/utils/disposable-email-domains';
import { normalizeEmail as canonicalizeEmail, looksLikeGmailDotTrick } from '@/lib/utils/email-normalize';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Generic message used for honeypot / disposable / captcha rejects so bots
// don't learn which check tripped them.
const GENERIC_REJECT_MESSAGE = 'Check your email to confirm your subscription';

function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export async function POST(request: Request) {
  try {
    assertSameOriginRequest();
    await enforceRateLimitAsync('newsletter', { maxRequests: 10, windowMs: 60_000 });

    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email);
    const region = typeof body?.region === 'string' ? body.region.trim() : '';
    const honeypot = typeof body?.website_url === 'string' ? body.website_url.trim() : '';
    const turnstileToken = typeof body?.turnstile_token === 'string' ? body.turnstile_token : '';

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Honeypot — silent accept. Real users never touch this field; if it's
    // populated the caller is a form-scraping bot. Return a success-looking
    // response so the bot moves on without learning we filter it.
    if (honeypot) {
      return NextResponse.json({ message: GENERIC_REJECT_MESSAGE });
    }

    // Disposable email providers — same silent accept (no signal to the bot).
    if (isDisposableEmail(email)) {
      return NextResponse.json({ message: GENERIC_REJECT_MESSAGE });
    }

    // Gmail dot-trick bombing — Gmail itself rejects `..` and 4+ dots at
    // signup time, so any address with those is a bot injecting noise on
    // top of a real victim's address to bypass dedup. Silent accept.
    if (looksLikeGmailDotTrick(email)) {
      return NextResponse.json({ message: GENERIC_REJECT_MESSAGE });
    }

    // Canonical form used for duplicate detection + per-email rate limiting.
    // Strips Gmail dots and `+suffix` so all variants of one inbox count as
    // a single subscriber.
    const canonicalEmail = canonicalizeEmail(email);

    // Cloudflare Turnstile — hard reject. Real users get a token automatically
    // from the widget; bots that never executed the widget JS won't have one.
    const turnstile = await verifyTurnstileToken(turnstileToken, getClientIdentifier());
    if (!turnstile.ok) {
      return NextResponse.json({ error: 'Verification failed. Please refresh and try again.' }, { status: 400 });
    }

    const emailDomain = canonicalEmail.split('@')[1] ?? '';
    await Promise.all([
      // Rate-limit on the canonical form so all Gmail dot variants share one bucket
      enforceRateLimitForKeyAsync('newsletter-email', hashRateLimitKey(canonicalEmail), { maxRequests: 3, windowMs: 60 * 60_000 }),
      enforceRateLimitForKeyAsync('newsletter-domain', hashRateLimitKey(emailDomain), { maxRequests: 30, windowMs: 60 * 60_000 }),
    ]);

    const supabase = createSupabaseAdminServerClient();

    // Check if already exists — match on either the literal email OR a row
    // that already canonicalised to the same Gmail inbox (older bot rows
    // may have been stored with dots intact).
    const { data: existing } = await supabase
      .from('newsletter_subscribers' as never)
      .select('email, status, unsubscribe_token')
      .or(`email.eq.${email},email.eq.${canonicalEmail}`)
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

    // Insert new subscriber as pending. Store the canonical form so future
    // dot/plus variants of the same Gmail inbox can't re-enroll.
    const { data: inserted, error: insertError } = await supabase
      .from('newsletter_subscribers' as never)
      .insert({ email: canonicalEmail, status: 'pending', region: region || null } as never)
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
