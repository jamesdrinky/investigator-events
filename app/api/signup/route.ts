import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { enforceRateLimit, assertSameOriginRequest } from '@/lib/security/server';
import { buildWelcomeEmail } from '@/lib/email/welcome-email';

export async function POST(request: Request) {
  try {
    enforceRateLimit('signup', { maxRequests: 5, windowMs: 60_000 });
    assertSameOriginRequest();

    const body = await request.json().catch(() => null);
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;
    const fullName = body?.full_name?.trim();
    const tosAccepted = body?.tos_accepted === true;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (!tosAccepted) {
      return NextResponse.json({ error: 'You must accept the Terms of Service' }, { status: 400 });
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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create profile row
    if (data.user) {
      const { error: profileError } = await admin.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName || null,
        username: fullName ? fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null,
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
