'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { MeshGradient } from '@paper-design/shaders-react';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const LinkedInIcon = ({ white }: { white?: boolean } = {}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill={white ? '#ffffff' : '#0288D1'} d="M42 37a5 5 0 01-5 5H11a5 5 0 01-5-5V11a5 5 0 015-5h26a5 5 0 015 5v26z" />
    <path fill={white ? '#0077B5' : '#FFF'} d="M12 19h5v17h-5V19zm2.485-2h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99-.144.35-.101.858-.101 1.365V36h-5s.07-16 0-17h5v2.616C25.721 21.865 27.085 20 30.1 20c3.386 0 5.9 2.215 5.9 6.978V36z" />
  </svg>
);

export interface Testimonial {
  avatarSrc: string;
  name: string;
  role: string;
  text: string;
}

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

interface AuthPageProps {
  mode: 'signin' | 'signup';
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSubmit: (data: { email: string; password: string; name?: string; tosAccepted?: boolean; newsletterOptIn?: boolean }) => void;
  onGoogleSignIn?: () => void;
  onLinkedInSignIn?: () => void;
  onAppleSignIn?: () => void;
  onSwitchMode?: () => void;
  loading?: boolean;
  error?: string;
  success?: string;
  initialEmail?: string;
}

const GlassInput = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/80 backdrop-blur-sm transition-all focus-within:border-blue-400 focus-within:bg-blue-50/30 focus-within:ring-2 focus-within:ring-blue-100">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, className }: { testimonial: Testimonial; className?: string }) => (
  <div className={`flex items-start gap-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 w-60 ${className ?? ''}`}>
    <img src={testimonial.avatarSrc} className="h-9 w-9 object-cover rounded-xl" alt="" />
    <div className="text-xs leading-snug">
      <p className="font-semibold text-white">{testimonial.name}</p>
      <p className="text-white/50">{testimonial.role}</p>
      <p className="mt-1 text-white/75">{testimonial.text}</p>
    </div>
  </div>
);

export function AuthPage({
  mode,
  heroImageSrc = '/cities/fallback.jpg',
  testimonials = [],
  onSubmit,
  onGoogleSignIn,
  onLinkedInSignIn,
  onAppleSignIn,
  onSwitchMode,
  loading,
  error,
  success,
  initialEmail,
}: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail ?? '');
  const [password, setPassword] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [resetStatus, setResetStatus] = useState<{ kind: 'idle' | 'sending' | 'sent' | 'error'; message?: string }>({ kind: 'idle' });

  const isSignUp = mode === 'signup';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, ...(isSignUp ? { name, tosAccepted, newsletterOptIn } : { newsletterOptIn }) });
  };

  return (
    <div className="relative flex min-h-screen w-full bg-white">
      {/* Mobile-only ambient gradient orbs for the futuristic feel.
          Hidden on lg+ where the right pane already provides the nebula. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.22),transparent_65%)] blur-3xl" />
        <div className="absolute top-1/4 -right-32 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.14),transparent_65%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
      </div>

      {/* Left — form */}
      <section className="relative flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-5">
            {/* Eyebrow */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600 backdrop-blur-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]" />
                Investigator Events
              </span>
            </div>

            <h1
              className="text-4xl font-bold leading-[0.95] tracking-[-0.03em] text-slate-900 sm:text-5xl"
              style={{ opacity: 0, animation: 'fadeSlideIn 0.5s ease forwards 0.1s' }}
            >
              {isSignUp ? (
                <>Create your{' '}
                  <span className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent" style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}>account</span>
                </>
              ) : (
                <>Welcome{' '}
                  <span className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent" style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}>back</span>
                </>
              )}
            </h1>
            <p
              className="text-slate-500"
              style={{ opacity: 0, animation: 'fadeSlideIn 0.5s ease forwards 0.2s' }}
            >
              {isSignUp
                ? 'Join the global investigations directory'
                : 'Sign in to your Investigator Events account'}
            </p>

            {/* LinkedIn — primary */}
            {onLinkedInSignIn && (
              <div style={{ opacity: 0, animation: 'fadeSlideIn 0.5s ease forwards 0.3s' }}>
                <button
                  type="button"
                  onClick={onLinkedInSignIn}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#0077B5] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#006097]"
                >
                  <LinkedInIcon white />
                  Continue with LinkedIn
                </button>
                <p className="mt-1.5 text-center text-[11px] text-slate-400">Recommended for professionals — verifies your identity</p>
              </div>
            )}

            {/* Google — disabled in WebView/Capacitor. Google blocks OAuth in
                non-system browsers (error 403 disallowed_useragent), so the
                button is hidden unless explicitly opted in. Re-enable post-
                launch with @capacitor-community/google-signin native plugin. */}
            {onGoogleSignIn && (
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
                style={{ opacity: 0, animation: 'fadeSlideIn 0.5s ease forwards 0.35s' }}
              >
                <GoogleIcon />
                Continue with Google
              </button>
            )}

            {/* Apple — required for App Store compliance */}
            {onAppleSignIn && (
              <button
                type="button"
                onClick={onAppleSignIn}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-black py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900"
                style={{ opacity: 0, animation: 'fadeSlideIn 0.5s ease forwards 0.38s' }}
              >
                <AppleIcon />
                Continue with Apple
              </button>
            )}

            <div className="relative flex items-center justify-center" style={{ opacity: 0, animation: 'fadeSlideIn 0.5s ease forwards 0.4s' }}>
              <span className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-4 text-xs text-slate-400">or use email</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div style={{ opacity: 0, animation: 'fadeSlideIn 0.5s ease forwards 0.4s' }}>
                  <label className="mb-1 block text-sm font-medium text-slate-600">Full Name</label>
                  <GlassInput>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </GlassInput>
                </div>
              )}

              <div style={{ opacity: 0, animation: `fadeSlideIn 0.5s ease forwards ${isSignUp ? '0.45s' : '0.4s'}` }}>
                <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
                <GlassInput>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </GlassInput>
              </div>

              <div style={{ opacity: 0, animation: `fadeSlideIn 0.5s ease forwards ${isSignUp ? '0.5s' : '0.45s'}` }}>
                <label className="mb-1 block text-sm font-medium text-slate-600">Password</label>
                <GlassInput>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isSignUp ? 'Min 8 characters' : 'Enter your password'}
                      className="w-full bg-transparent px-4 py-3 pr-12 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600" /> : <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600" />}
                    </button>
                  </div>
                </GlassInput>
                {!isSignUp && (
                  <div className="mt-1 flex flex-col items-end gap-1">
                    <button
                      type="button"
                      disabled={resetStatus.kind === 'sending'}
                      onClick={async () => {
                        if (!email) {
                          setResetStatus({ kind: 'error', message: 'Enter your email above first' });
                          return;
                        }
                        setResetStatus({ kind: 'sending' });
                        try {
                          // Use our own API route, NOT supabase.auth.resetPasswordForEmail.
                          // Our route generates the recovery token via admin API and
                          // sends a custom email via Resend that links directly to
                          // /profile/reset-password — bypasses Supabase's verify
                          // endpoint + redirect chain entirely.
                          const res = await fetch('/api/auth/reset-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email }),
                          });
                          const body = await res.json().catch(() => ({}));
                          if (!res.ok) {
                            setResetStatus({ kind: 'error', message: body?.error || 'Could not send reset email' });
                          } else {
                            setResetStatus({ kind: 'sent', message: 'Reset link sent — check your inbox.' });
                          }
                        } catch (e) {
                          setResetStatus({ kind: 'error', message: e instanceof Error ? e.message : 'Something went wrong' });
                        }
                      }}
                      className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                    >
                      {resetStatus.kind === 'sending' ? 'Sending…' : 'Forgot password?'}
                    </button>
                    {resetStatus.kind === 'sent' && (
                      <p className="text-[11px] text-emerald-600">{resetStatus.message}</p>
                    )}
                    {resetStatus.kind === 'error' && (
                      <p className="text-[11px] text-rose-600">{resetStatus.message}</p>
                    )}
                    {/* Fallback path: if the reset email flow doesn't work for
                        any reason (Supabase config, deliverability, etc.) users
                        can always get back in via Apple/LinkedIn. Shown after
                        attempting reset OR if user clicks the help link. */}
                    {(resetStatus.kind === 'sent' || resetStatus.kind === 'error') && (
                      <p className="text-[10px] text-slate-400 text-right">
                        Still stuck? Try{' '}
                        {onAppleSignIn && (
                          <button type="button" onClick={onAppleSignIn} className="font-semibold text-slate-600 underline">
                            Sign in with Apple
                          </button>
                        )}
                        {onAppleSignIn && onLinkedInSignIn && ' or '}
                        {onLinkedInSignIn && (
                          <button type="button" onClick={onLinkedInSignIn} className="font-semibold text-slate-600 underline">
                            LinkedIn
                          </button>
                        )}
                        {', or email '}
                        <a href="mailto:info@investigatorevents.com" className="font-semibold text-slate-600 underline">
                          support
                        </a>.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {isSignUp && (
                <div
                  className="flex items-start gap-3"
                  style={{ opacity: 0, animation: 'fadeSlideIn 0.5s ease forwards 0.52s' }}
                >
                  <input
                    type="checkbox"
                    id="tos-accept"
                    checked={tosAccepted}
                    onChange={(e) => setTosAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="tos-accept" className="text-xs leading-relaxed text-slate-500">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="font-medium text-blue-600 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/guidelines" target="_blank" className="font-medium text-blue-600 hover:underline">Community Guidelines</a>.
                    I understand that Investigator Events does not verify user identities or professional credentials.
                  </label>
                </div>
              )}

              <div
                className="flex items-start gap-3"
                style={{ opacity: 0, animation: `fadeSlideIn 0.5s ease forwards ${isSignUp ? '0.54s' : '0.48s'}` }}
              >
                <input
                  type="checkbox"
                  id="newsletter-opt-in"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="newsletter-opt-in" className="text-xs leading-relaxed text-slate-500">
                  Send me the weekly events newsletter and activity notifications by email. You can unsubscribe at any time.
                </label>
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
              )}
              {success && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>
              )}

              <button
                type="submit"
                disabled={loading || (isSignUp && !tosAccepted)}
                className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                style={{ opacity: 0, animation: `fadeSlideIn 0.5s ease forwards ${isSignUp ? '0.55s' : '0.5s'}` }}
              >
                {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create account' : 'Sign in')}
              </button>
            </form>

            <p
              className="text-center text-sm text-slate-500"
              style={{ opacity: 0, animation: `fadeSlideIn 0.5s ease forwards ${isSignUp ? '0.6s' : '0.55s'}` }}
            >
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button type="button" onClick={onSwitchMode} className="font-semibold text-blue-600 hover:underline">
                {isSignUp ? 'Sign in' : 'Create one'}
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Right — spiral nebula animation */}
      <section className="hidden flex-1 p-3 lg:block">
        <div
          className="relative h-full w-full overflow-hidden rounded-2xl"
          style={{ opacity: 0, animation: 'slideRightIn 0.6s ease forwards 0.3s' }}
        >
          {/* Shader background */}
          <div className="absolute inset-0">
            <MeshGradient
              width="100%"
              height="100%"
              colors={['#000000', '#0a0a1a', '#1668ff', '#ffffff']}
              speed={0.4}
              distortion={0.4}
              swirl={0.3}
              grainOverlay={0.12}
            />
          </div>

          {/* Branding overlay */}
          <div className="absolute left-8 top-8 z-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400/50">Investigator Events</p>
            <p className="mt-2 text-lg font-bold leading-snug text-white/90">Every investigator event.<br />One global calendar.</p>
          </div>

          {/* Testimonials at bottom */}
          {testimonials.length > 0 && (
            <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-3 px-6">
              {testimonials.slice(0, 3).map((t, i) => (
                <TestimonialCard
                  key={i}
                  testimonial={t}
                  className={i > 0 ? 'hidden xl:flex' : ''}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
