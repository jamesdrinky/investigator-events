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
  const [error, setError] = useState('');
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
      router.push('/profile');
    }
  };

  const handleGoogle = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
  };

  const handleLinkedIn = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
  };

  return (
    <AuthPage
      mode="signin"
      heroImageSrc="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80"
      testimonials={testimonials}
      onSubmit={handleSignIn}
      onGoogleSignIn={handleGoogle}
      onLinkedInSignIn={handleLinkedIn}
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
