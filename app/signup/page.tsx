'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthPage } from '@/components/ui/sign-in';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const testimonials = [
  { avatarSrc: '/faces/mike2.png', name: 'Mike LaCorte', role: 'CEO, Conflict International', text: 'Built for the community, by someone in it. Free, open, and genuinely useful.' },
  { avatarSrc: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'Emma Richardson', role: 'Insurance Investigator', text: 'Signed up in 30 seconds. Already connected with three new contacts.' },
  { avatarSrc: 'https://randomuser.me/api/portraits/men/75.jpg', name: 'Tom Bradley', role: 'Private Investigator', text: 'The community feed alone is worth it. Great to see what others are attending.' },
];

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async ({ email, password, name }: { email: string; password: string; name?: string }) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!email || !password || !name) {
        setLoading(false);
        setError('Please fill in all fields.');
        return;
      }

      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name }),
      });
      const result = await res.json();

      if (!res.ok) {
        setLoading(false);
        setError(result.error || 'Failed to create account.');
        return;
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

  return (
    <AuthPage
      mode="signup"
      heroImageSrc="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
      testimonials={testimonials}
      onSubmit={handleSignUp}
      onGoogleSignIn={handleGoogle}
      onSwitchMode={() => router.push('/signin')}
      loading={loading}
      error={error}
      success={success}
    />
  );
}
