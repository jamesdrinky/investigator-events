'use client';

import { useState } from 'react';

type NewsletterFormState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
};

function inputClasses() {
  return 'h-13 rounded-[1.15rem] border border-white/80 bg-white/92 px-4 text-sm text-slate-800 outline-none shadow-[0_18px_40px_-34px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.8)] transition duration-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100';
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-[1.05rem] bg-[linear-gradient(135deg,#1668ff,#14b8ff,#645bff)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_28px_58px_-28px_rgba(22,104,255,0.48)] transition duration-500 hover:-translate-y-1 hover:scale-[1.01] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 lg:h-13 lg:w-auto lg:rounded-[1.15rem] lg:px-6"
    >
      {pending ? 'Subscribing...' : 'Subscribe'}
    </button>
  );
}

export function NewsletterSignupForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<NewsletterFormState>({ status: 'idle' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (state.status === 'loading') {
      return;
    }

    setState({ status: 'loading' });

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

      if (!response.ok) {
        setState({
          status: 'error',
          message: payload?.error ?? 'Unable to subscribe right now. Please try again shortly.'
        });
        return;
      }

      setState({
        status: 'success',
        message: payload?.message ?? 'Subscribed successfully'
      });
    } catch {
      setState({
        status: 'error',
        message: 'Unable to subscribe right now. Please try again shortly.'
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative grid gap-4 rounded-[1.5rem] border border-white/85 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-4 shadow-[0_34px_96px_-54px_rgba(15,23,42,0.16)] sm:gap-5 sm:rounded-[2.3rem] sm:p-6 lg:p-7"
    >
      <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.28),rgba(255,255,255,0)_26%,rgba(255,255,255,0.1)_54%,rgba(255,255,255,0)_100%)] sm:rounded-[2.3rem]" />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="grid gap-2 text-sm text-slate-600">
          <span>Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="Email address"
            className={inputClasses()}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={state.status === 'loading'}
          />
        </label>
        <div className="flex items-end">
          <SubmitButton pending={state.status === 'loading'} />
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-500">
        Weekly updates focused on new events, approaching dates, and one standout event.
      </p>

      <p className="text-xs leading-relaxed text-slate-400">
        Your details are stored securely and used only to process your submission. See our{' '}
        <a href="/privacy" className="underline underline-offset-2 hover:text-slate-600">privacy policy</a>.
      </p>

      {state.status === 'success' ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-700">{state.message}</p>
          <p className="mt-2 text-sm text-emerald-600">
            Want to build a profile and connect with investigators?{' '}
            <a href={`/signup?email=${encodeURIComponent(email)}`} className="font-bold text-blue-600 underline hover:text-blue-700">
              Create your free account
            </a>
          </p>
        </div>
      ) : null}
      {state.status === 'error' ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p>
      ) : null}
    </form>
  );
}
