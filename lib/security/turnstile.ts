/**
 * Cloudflare Turnstile token verification.
 *
 * Frontend renders the Turnstile widget with NEXT_PUBLIC_TURNSTILE_SITE_KEY,
 * gets a one-time token, and POSTs it. The server calls Cloudflare's siteverify
 * endpoint with TURNSTILE_SECRET_KEY to confirm the token is real and unused.
 *
 * If TURNSTILE_SECRET_KEY is not set, verification is treated as a no-op so
 * local dev / preview environments work without Cloudflare config. Production
 * should always set both env vars.
 */
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'missing_token' | 'invalid_token' | 'verify_failed' };

export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // No secret configured → skip (dev / preview). Production should set this.
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('turnstile_secret_missing_in_production');
    }
    return { ok: true };
  }

  if (!token || typeof token !== 'string') {
    return { ok: false, reason: 'missing_token' };
  }

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) {
      return { ok: false, reason: 'verify_failed' };
    }

    const data = (await response.json()) as { success?: boolean };
    if (data.success === true) return { ok: true };
    return { ok: false, reason: 'invalid_token' };
  } catch {
    return { ok: false, reason: 'verify_failed' };
  }
}
