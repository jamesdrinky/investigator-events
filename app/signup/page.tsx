'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Globe, Calendar, Briefcase, Shield, Scale, FileSearch, MapPin } from 'lucide-react';
import {
  Ripple,
  TechOrbitDisplay,
  AnimatedForm,
} from '@/components/ui/modern-animated-sign-in';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type FormData = { name: string; email: string; password: string };

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

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { full_name: formData.name } },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSuccess('Check your email to confirm your account.');
    }
  };

  return (
    <section className='flex max-lg:justify-center min-h-screen bg-white'>
      <span className='flex flex-col justify-center w-1/2 max-lg:hidden relative'>
        <Ripple mainCircleSize={100} />
        <TechOrbitDisplay iconsArray={iconsArray} text='Join the network' />
      </span>

      <span className='w-1/2 flex flex-col justify-center items-center max-lg:w-full max-lg:px-[5%] sm:max-lg:px-[10%] py-8'>
        <div className='max-md:w-full flex flex-col gap-4 w-96 mx-auto'>
          <AnimatedForm
            header='Create an account'
            subHeader='Join Investigator Events to save events and connect'
            fields={[
              {
                label: 'Full Name',
                required: true,
                type: 'text',
                placeholder: 'Your full name',
                onChange: (e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'name'),
              },
              {
                label: 'Email',
                required: true,
                type: 'email',
                placeholder: 'Enter your email address',
                onChange: (e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'email'),
              },
              {
                label: 'Password',
                required: true,
                type: 'password',
                placeholder: 'Create a password (min 6 characters)',
                onChange: (e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'password'),
              },
            ]}
            submitButton={loading ? 'Creating account...' : 'Sign up'}
            textVariantButton='Already have an account? Sign in'
            errorField={error}
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleLogin}
            googleLogin='Continue with Google'
            goTo={(e) => { e.preventDefault(); router.push('/signin'); }}
          />
          {success && (
            <div className='rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 text-center'>
              {success}
            </div>
          )}
        </div>
      </span>
    </section>
  );
}
