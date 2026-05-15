'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'verifying' | 'idle' | 'submitting' | 'success' | 'error' | 'invalid_token'>('verifying');
  const [error, setError] = useState<string | null>(null);

  // On mount: pick up the recovery token from the URL and exchange it for a
  // session. This page can be reached three ways and we handle all of them:
  // 1. ?token_hash=...&type=recovery  (custom email template — preferred)
  // 2. ?code=...                       (PKCE redirect from Supabase verify)
  // 3. already-signed-in via PASSWORD_RECOVERY listener (no params needed)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supabase = createSupabaseBrowserClient();
    const url = new URL(window.location.href);
    const tokenHash = url.searchParams.get('token_hash');
    const type = url.searchParams.get('type');
    const code = url.searchParams.get('code');

    const cleanUrl = () => window.history.replaceState({}, '', '/profile/reset-password');

    const handle = async () => {
      // Custom email-template path: verify the token hash directly.
      if (tokenHash && type === 'recovery') {
        const { error: verifyErr } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
        cleanUrl();
        if (verifyErr) {
          setStatus('invalid_token');
          setError(verifyErr.message || 'This reset link is invalid or has expired. Request a new one.');
          return;
        }
        setStatus('idle');
        return;
      }

      // PKCE path: exchange the code for a session.
      if (code) {
        const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
        cleanUrl();
        if (exchangeErr) {
          setStatus('invalid_token');
          setError(exchangeErr.message || 'This reset link is invalid or has expired. Request a new one.');
          return;
        }
        setStatus('idle');
        return;
      }

      // No params: either already in a recovery session via global handler,
      // or the user navigated here directly. Check for an active session.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus('idle');
      } else {
        setStatus('invalid_token');
        setError('No active reset session. Request a new password reset email from the sign-in page.');
      }
    };

    handle();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setStatus('submitting');
    const supabase = createSupabaseBrowserClient();

    // Capture the email FIRST while we still have the recovery session.
    const { data: { user: recoveryUser } } = await supabase.auth.getUser();
    const userEmail = recoveryUser?.email;

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setStatus('error');
      setError(updateError.message);
      return;
    }

    // The recovery session is valid for client-side ops but is flagged as
    // 'recovery' which some SSR routes don't accept as a fully-authenticated
    // session — that's why /profile was still showing 'sign in' after a
    // successful reset. Fix: sign out the recovery session, then sign in
    // fresh with the new password. Now both client + server see a normal
    // authenticated session.
    if (userEmail) {
      try {
        await supabase.auth.signOut();
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: userEmail, password });
        if (signInError) {
          // Sign-in with the brand-new password failed — fall through to
          // success state anyway since the password DID update; user just
          // has to sign in manually.
          console.warn('[reset-password] re-signin failed', signInError.message);
        }
      } catch (e) {
        console.warn('[reset-password] re-signin threw', e);
      }
    }

    setStatus('success');
    setTimeout(() => {
      // Hard reload so SSR re-evaluates with the fresh auth cookie.
      window.location.href = '/profile';
    }, 1200);
  };

  return (
    <main className="flex min-h-[calc(100dvh-var(--app-header-height,4rem))] items-center justify-center bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/60 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.4)]">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-[-0.02em] text-slate-950 sm:text-3xl">Set a new password</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          You're signed in via the password reset link. Choose a new password and you're back in.
        </p>

        {status === 'verifying' ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="h-5 w-5 flex-shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            <p className="text-sm font-medium text-slate-600">Verifying your reset link…</p>
          </div>
        ) : status === 'invalid_token' ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">Reset link expired or invalid</p>
            <p className="text-xs text-rose-600/80">{error}</p>
            <a href="/signin" className="inline-block rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white">
              Back to sign in
            </a>
          </div>
        ) : status === 'success' ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">Password updated. Redirecting…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">New password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Confirm password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
                placeholder="Re-enter password"
                autoComplete="new-password"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60"
            >
              {status === 'submitting' ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
