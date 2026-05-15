'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthPage } from '@/components/ui/sign-in';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const testimonials = [
  { avatarSrc: '/faces/mike2.png', name: 'Mike LaCorte', role: 'Founder, Investigator Events', text: 'Built for the profession, by someone in it. Free, open, and working with associations — not against them.' },
];

function SignInPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') ?? '';
  const nextUrl = searchParams.get('next') ?? '/profile';
  const authError = searchParams.get('error');

  const initialError = authError === 'auth'
    ? 'Authentication failed. Please try again.'
    : '';

  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async ({ email, password, newsletterOptIn }: { email: string; password: string; newsletterOptIn?: boolean }) => {
    setError('');
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      if (newsletterOptIn) {
        fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch(() => {});
      }
      // Hard reload, not router.push. router.push is client-side nav and
      // doesn't re-evaluate SSR auth — that left email-signin users with
      // dashboard/messages working (client cookies) but /profile and other
      // SSR routes still showing the sign-in page (cookie not yet read by
      // the server). OAuth flows go through /auth/callback which is a real
      // server redirect so they don't have this problem; email needs the
      // hard reload to match.
      window.location.href = nextUrl;
    }
  };

  const handleGoogle = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback?next=' + encodeURIComponent(nextUrl) },
    });
  };

  const handleLinkedIn = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: window.location.origin + '/auth/callback?next=' + encodeURIComponent(nextUrl) },
    });
  };

  const handleApple = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin + '/auth/callback?next=' + encodeURIComponent(nextUrl) },
    });
  };

  return (
    <AuthPage
      mode="signin"
      heroImageSrc="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80"
      testimonials={testimonials}
      onSubmit={handleSignIn}
      onLinkedInSignIn={handleLinkedIn}
      onAppleSignIn={handleApple}
      onSwitchMode={() => router.push('/signup')}
      loading={loading}
      error={error}
      initialEmail={prefillEmail}
    />
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInPageInner />
    </Suspense>
  );
}
