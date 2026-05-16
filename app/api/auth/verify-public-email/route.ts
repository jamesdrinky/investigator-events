import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { verifyPublicEmailVerificationToken } from '@/lib/security/public-email-verification';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  const payload = verifyPublicEmailVerificationToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL('/signin?error=auth', request.url));
  }

  const admin = createSupabaseAdminServerClient();
  await (admin.from('profiles') as any)
    .update({
      email_verified_for_public: true,
    })
    .eq('id', payload.uid);

  return NextResponse.redirect(new URL('/profile/setup?email_verified=1', request.url));
}
