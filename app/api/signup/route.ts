import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { enforceRateLimitAsync, assertSameOriginRequest } from '@/lib/security/server';
import { buildWelcomeEmail } from '@/lib/email/welcome-email';
import { buildPublicEmailVerificationEmail } from '@/lib/email/public-email-verification';
import { createPublicEmailVerificationToken } from '@/lib/security/public-email-verification';
import { generateUniqueUsername } from '@/lib/utils/username';
import { looksLikeRandomSignupName } from '@/lib/utils/signup-abuse';

export async function POST(request: Request) {
  try {
    await enforceRateLimitAsync('signup', { maxRequests: 5, windowMs: 60_000 });
    assertSameOriginRequest();

    const origin = new URL(request.url).origin;
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;
    const fullName = body?.full_name?.trim();
    const tosAccepted = body?.tos_accepted === true;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (looksLikeRandomSignupName(fullName)) {
      return NextResponse.json({ error: 'Please enter your real first and last name.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!tosAccepted) {
      return NextResponse.json({ error: 'You must accept the Terms of Service' }, { status: 400 });
    }

    const admin = createSupabaseAdminServerClient();

    // Keep the smooth app flow: create the account so the UI can sign them in
    // immediately, but keep the profile private until our public-profile email
    // verification link is clicked.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || null, email_verified_for_public: false },
    });

    if (error) {
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists. Try signing in.' }, { status: 409 });
      }
      console.error('Signup error:', error.message);
      return NextResponse.json({ error: 'Unable to create account. Please try again.' }, { status: 400 });
    }

    // Create a private profile row. Profile setup/edit makes it public after
    // the user has verified email and completed the profile.
    if (data.user) {
      const username = await generateUniqueUsername(admin, fullName, data.user.id);
      const { error: profileError } = await admin.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName || null,
        username,
        is_public: false,
        auth_provider: 'email',
        email_verified_for_public: false,
        tos_accepted_at: new Date().toISOString(),
      } as any, { onConflict: 'id' });
      if (profileError) {
        console.error('Failed to create profile:', profileError.message);
      }
    }

    // Send welcome email (fire-and-forget)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && email) {
      const resend = new Resend(resendKey);
      const token = data.user ? createPublicEmailVerificationToken(data.user.id, email) : null;
      if (token) {
        const verifyUrl = `${origin}/api/auth/verify-public-email?token=${encodeURIComponent(token)}`;
        resend.emails.send({
          from: 'Investigator Events <info@investigatorevents.com>',
          to: email,
          subject: 'Confirm your Investigator Events email',
          html: buildPublicEmailVerificationEmail(fullName || null, verifyUrl),
        }).catch((err) => console.error('Public email verification failed:', err));
      }
      resend.emails.send({
        from: 'Investigator Events <info@investigatorevents.com>',
        to: email,
        subject: 'Welcome to Investigator Events',
        html: buildWelcomeEmail(fullName || null),
      }).catch((err) => console.error('Welcome email failed:', err));
    }

    return NextResponse.json({
      message: 'Account created. Check your email to make your profile public.',
      userId: data.user?.id,
      requiresEmailConfirmation: false,
    });
  } catch (err) {
    console.error('signup error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
