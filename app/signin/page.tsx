'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Globe, Calendar, Briefcase, Shield, Scale, FileSearch, MapPin } from 'lucide-react';
import {
  Ripple,
  AuthTabs,
  TechOrbitDisplay,
} from '@/components/ui/modern-animated-sign-in';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type FormData = { email: string; password: string };

const iconsArray = [
  {
    component: () => <Search className="h-5 w-5 text-blue-600" />,
    className: 'size-[30px] border-none bg-white shadow-sm',
    duration: 20, delay: 20, radius: 100, path: false, reverse: false,
  },
  {
    component: () => <Globe className="h-5 w-5 text-cyan-600" />,
    className: 'size-[30px] border-none bg-white shadow-sm',
    duration: 20, delay: 10, radius: 100, path: false, reverse: false,
  },
  {
    component: () => <Calendar className="h-6 w-6 text-indigo-600" />,
    className: 'size-[50px] border-none bg-white shadow-sm',
    radius: 210, duration: 20, path: false, reverse: false,
  },
  {
    component: () => <Briefcase className="h-6 w-6 text-slate-700" />,
    className: 'size-[50px] border-none bg-white shadow-sm',
    radius: 210, duration: 20, delay: 20, path: false, reverse: false,
  },
  {
    component: () => <Shield className="h-5 w-5 text-emerald-600" />,
    className: 'size-[30px] border-none bg-white shadow-sm',
    duration: 20, delay: 20, radius: 150, path: false, reverse: true,
  },
  {
    component: () => <Scale className="h-5 w-5 text-violet-600" />,
    className: 'size-[30px] border-none bg-white shadow-sm',
    duration: 20, delay: 10, radius: 150, path: false, reverse: true,
  },
  {
    component: () => <FileSearch className="h-6 w-6 text-blue-700" />,
    className: 'size-[50px] border-none bg-white shadow-sm',
    radius: 270, duration: 20, path: false, reverse: true,
  },
  {
    component: () => <MapPin className="h-6 w-6 text-rose-500" />,
    className: 'size-[50px] border-none bg-white shadow-sm',
    radius: 270, duration: 20, delay: 60, path: false, reverse: true,
  },
];

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, name: keyof FormData) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleGoogleLogin = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.push('/profile');
    }
  };

  const formFields = {
    header: 'Welcome back',
    subHeader: 'Sign in to your Investigator Events account',
    fields: [
      {
        label: 'Email',
        required: true,
        type: 'email' as const,
        placeholder: 'Enter your email address',
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'email'),
      },
      {
        label: 'Password',
        required: true,
        type: 'password' as const,
        placeholder: 'Enter your password',
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'password'),
      },
    ],
    submitButton: loading ? 'Signing in...' : 'Sign in',
    textVariantButton: "Don't have an account? Sign up",
  };

  return (
    <section className='flex max-lg:justify-center min-h-screen bg-white'>
      <span className='flex flex-col justify-center w-1/2 max-lg:hidden relative'>
        <Ripple mainCircleSize={100} />
        <TechOrbitDisplay iconsArray={iconsArray} text='Investigator Events' />
      </span>

      <span className='w-1/2 flex flex-col justify-center items-center max-lg:w-full max-lg:px-[5%] sm:max-lg:px-[10%]'>
        <AuthTabs
          formFields={formFields}
          errorField={error}
          onGoogleLogin={handleGoogleLogin}
          goTo={(e) => { e.preventDefault(); router.push('/signup'); }}
          handleSubmit={handleSubmit}
        />
      </span>
    </section>
  );
}
