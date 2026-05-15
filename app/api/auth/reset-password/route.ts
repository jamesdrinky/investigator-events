import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { enforceRateLimit, RateLimitError } from '@/lib/security/server';

/**
 * Self-contained password reset flow that bypasses Supabase's email service
 * and redirect chain entirely.
 *
 * Why: Supabase's default email contains a link to its verify endpoint
 * (https://[project].supabase.co/auth/v1/verify?...&redirect_to=YYYY).
 * The redirect_to value is filtered against the project's Redirect URLs
 * allow list, and any wildcard/query-string mismatch causes Supabase to
 * silently fall back to the bare Site URL. Result: the user clicks the
 * email link and lands on the homepage with no recovery context.
 *
 * This route:
 * 1. Calls supabase.auth.admin.generateLink({ type: 'recovery', email })
 *    to mint a recovery token + hashed_token without sending any email.
 * 2. Constructs a clean URL pointing directly to /profile/reset-password
 *    with the hashed_token in the query string.
 * 3. Sends a custom email via Resend (the user's verified sender) to that
 *    URL. The reset page calls supabase.auth.verifyOtp({ token_hash,
 *    type: 'recovery' }) on mount to create the recovery session.
 *
 * Zero Supabase Dashboard config required. Works regardless of Site URL,
 * Redirect URLs allow list, email template state.
 */
export async function POST(request: Request) {
  try {
    enforceRateLimit('reset-password', { maxRequests: 3, windowMs: 60_000 });

    const body = (await request.json().catch(() => null)) as { email?: string } | null;
    const email = body?.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error('[reset-password] RESEND_API_KEY missing');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const admin = createSupabaseAdminServerClient();

    // Generate a recovery token without sending any Supabase email.
    const { data, error: genError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    if (genError) {
      // Don't leak whether the email exists — same response either way.
      console.warn('[reset-password] generateLink failed', { email, message: genError.message });
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const hashedToken = data?.properties?.hashed_token;
    if (!hashedToken) {
      console.error('[reset-password] generateLink returned no hashed_token');
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://investigatorevents.com';
    const resetUrl = `${siteUrl}/profile/reset-password?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`;

    const resend = new Resend(resendKey);
    const { error: sendError } = await resend.emails.send({
      from: 'Investigator Events <info@investigatorevents.com>',
      to: email,
      subject: 'Reset your Investigator Events password',
      html: passwordResetHtml(resetUrl),
      tags: [{ name: 'type', value: 'password-reset' }],
    });

    if (sendError) {
      console.error('[reset-password] Resend send failed', sendError);
      return NextResponse.json({ error: 'Could not send reset email — please try again' }, { status: 500 });
    }

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many requests — wait a minute and try again' }, { status: 429 });
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[reset-password] caught', message);
    return NextResponse.json({ error: 'Failed to send reset email', detail: message }, { status: 500 });
  }
}

function passwordResetHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset your password</title></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px -12px rgba(15,23,42,0.12);">
        <tr><td style="padding:40px 40px 24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#3b82f6;">Investigator Events</p>
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;">Reset your password</h1>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">Tap the button below to choose a new password. If you didn't request this, you can safely ignore this email — your password won't change.</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" style="border-radius:9999px;background:#0f172a;">
            <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:9999px;">Reset password</a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">Or copy and paste this URL into your browser:</p>
          <p style="margin:6px 0 0;font-size:12px;line-height:1.6;color:#3b82f6;word-break:break-all;"><a href="${resetUrl}" style="color:#3b82f6;text-decoration:none;">${resetUrl}</a></p>
          <p style="margin:32px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">This link expires in 1 hour for security.</p>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;line-height:1.6;color:#94a3b8;">If you have any trouble, just reply to this email — we read every message.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
