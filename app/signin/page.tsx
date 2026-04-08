'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthPage } from '@/components/ui/sign-in';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const testimonials = [
  { avatarSrc: '/faces/mike2.png', name: 'Mike LaCorte', role: 'CEO, Conflict International', text: 'One calendar for the entire industry. This is what we needed.' },
  { avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg', name: 'David Chen', role: 'Corporate Investigator', text: "I've found three conferences I would have missed. Already booked two." },
  { avatarSrc: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Sarah Williams', role: 'Due Diligence Specialist', text: 'Finally a place to see what\'s happening across the profession globally.' },
];

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async ({ email, password }: { email: string; password: string }) => {
    setError('');
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
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

  return (
    <AuthPage
      mode="signin"
      heroImageSrc="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80"
      testimonials={testimonials}
      onSubmit={handleSignIn}
      onGoogleSignIn={handleGoogle}
      onSwitchMode={() => router.push('/signup')}
      loading={loading}
      error={error}
    />
  );
}
