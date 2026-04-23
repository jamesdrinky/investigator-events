'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthPage } from '@/components/ui/sign-in';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const testimonials = [
  { avatarSrc: '/faces/mike2.png', name: 'Mike LaCorte', role: 'Founder, Investigator Events', text: 'The front door to the profession. We connect investigators — associations elevate them.' },
  { avatarSrc: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'Emma Richardson', role: 'Insurance Investigator', text: 'Signed up in 30 seconds. Already found three events I would have missed.' },
  { avatarSrc: 'https://randomuser.me/api/portraits/men/75.jpg', name: 'Tom Bradley', role: 'Private Investigator', text: 'Finally one place for every event in the industry. The verified badges are a great touch.' },
];

function SignUpPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') ?? '';
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async ({ email, password, name, tosAccepted, newsletterOptIn }: { email: string; password: string; name?: string; tosAccepted?: boolean; newsletterOptIn?: boolean }) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!email || !password || !name) {
        setLoading(false);
        setError('Please fill in all fields.');
        return;
      }

      if (!tosAccepted) {
        setLoading(false);
        setError('You must agree to the Terms of Service and Community Guidelines.');
        return;
      }

      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name, tos_accepted: true }),
      });
      const result = await res.json();

      if (!res.ok) {
        setLoading(false);
        setError(result.error || 'Failed to create account.');
        return;
      }

      // Subscribe to newsletter if opted in
      if (newsletterOptIn) {
        fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch(() => {});
      }

      // Sign in immediately
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);

      if (signInError) {
        setSuccess('Account created! You can now sign in.');
        return;
      }

      router.push('/profile/setup');
    } catch {
      setLoading(false);
      setError('Something went wrong. Please try again.');
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
      mode="signup"
      heroImageSrc="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
      testimonials={testimonials}
      onSubmit={handleSignUp}
      onGoogleSignIn={handleGoogle}
      onLinkedInSignIn={handleLinkedIn}
      onSwitchMode={() => router.push('/signin')}
      loading={loading}
      error={error}
      success={success}
      initialEmail={prefillEmail}
    />
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpPageInner />
    </Suspense>
  );
}
