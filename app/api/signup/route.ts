import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { enforceRateLimitAsync, assertSameOriginRequest } from '@/lib/security/server';
import { buildWelcomeEmail } from '@/lib/email/welcome-email';
import { generateUniqueUsername } from '@/lib/utils/username';
import { looksLikeRandomSignupName } from '@/lib/utils/signup-abuse';

export async function POST(request: Request) {
  try {
    // Burst limit (existing) + hourly limit. The hourly is what kills slow-drip
    // signup bombing — 5/min alone could still net 200+ accounts a day from one
    // IP. With 10/hr added, max is 240/day in theory but the burst limit
    // triggers far sooner in practice.
    await enforceRateLimitAsync('signup', { maxRequests: 5, windowMs: 60_000 });
    await enforceRateLimitAsync('signup-hourly', { maxRequests: 10, windowMs: 60 * 60_000 });
    assertSameOriginRequest();

    const body = await request.json().catch(() => null);
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;
    const fullName = body?.full_name?.trim();
    const tosAccepted = body?.tos_accepted === true;
    const honeypot = body?.website_url;

    // Honeypot must be present and empty. Form-scraping bots fill every input
    // including the hidden one; API-direct bots don't know the honeypot field
    // exists so they omit it. Either way: rejected with the same generic error
    // as other bot checks so the operator can't distinguish.
    if (typeof honeypot !== 'string' || honeypot.length > 0) {
      return NextResponse.json({ error: 'Please use a real professional email address.' }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!tosAccepted) {
      return NextResponse.json({ error: 'You must accept the Terms of Service' }, { status: 400 });
    }

    // Random-alphanumeric-name signature of the current subscription-bomb bot.
    // Same generic error so the operator can't distinguish from other rejections.
    if (looksLikeRandomSignupName(fullName)) {
      return NextResponse.json({ error: 'Please use a real professional email address.' }, { status: 400 });
    }

    // Block known bot-source domains. korper.com was identified as the source
    // of the random-name signups polluting /people. Generic 'enter a real
    // email' message — don't tip off the bot operator that we're filtering.
    const blockedDomains = ['korper.com'];
    const emailDomain = email.split('@')[1] ?? '';
    if (blockedDomains.includes(emailDomain)) {
      return NextResponse.json({ error: 'Please use a real professional email address.' }, { status: 400 });
    }

    const admin = createSupabaseAdminServerClient();

    // Create user with admin client — auto-confirms email
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || null },
    });

    if (error) {
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists. Try signing in.' }, { status: 409 });
      }
      console.error('Signup error:', error.message);
      return NextResponse.json({ error: 'Unable to create account. Please try again.' }, { status: 400 });
    }

    // Create profile row
    if (data.user) {
      const username = await generateUniqueUsername(admin, fullName, data.user.id);
      const { error: profileError } = await admin.from('profiles').insert({
        id: data.user.id,
        full_name: fullName || null,
        username,
        is_public: true,
        tos_accepted_at: new Date().toISOString(),
      } as any);
      if (profileError) {
        console.error('Failed to create profile:', profileError.message);
      }
    }

    // Send welcome email (fire-and-forget)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && email) {
      const resend = new Resend(resendKey);
      resend.emails.send({
        from: 'Investigator Events <info@investigatorevents.com>',
        to: email,
        subject: 'Welcome to Investigator Events',
        html: buildWelcomeEmail(fullName || null),
      }).catch((err) => console.error('Welcome email failed:', err));
    }

    return NextResponse.json({ message: 'Account created', userId: data.user?.id });
  } catch (err) {
    console.error('signup error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
