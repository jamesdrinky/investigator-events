'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * A quiet sign-up box meant to be dropped in many places rather than shouted
 * from one. It removes itself for anyone already on the list, so putting it
 * everywhere costs existing subscribers nothing.
 *
 * Suppression order, fastest first:
 *   1. the ie_newsletter cookie, read synchronously — no flash, no request
 *   2. /api/newsletter/status, which also covers a signed-in user whose
 *      account email is on the list from another browser
 *
 * Renders nothing until it knows, so it never appears and then vanishes.
 */

function hasCookie() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c === 'ie_newsletter=1');
}

export function NewsletterInline({
  heading = 'Every Monday, one email',
  sub = 'New events, approaching deadlines, one standout. A two-minute read.',
  source = 'inline',
  className = '',
  tone = 'light',
}: {
  heading?: string;
  sub?: string;
  source?: string;
  className?: string;
  /** 'dark' for the navy homepage hero, where light-on-white would vanish. */
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (hasCookie()) { setSubscribed(true); return; }
    let cancelled = false;
    fetch('/api/newsletter/status')
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setSubscribed(Boolean(d?.subscribed)); })
      .catch(() => { if (!cancelled) setSubscribed(false); });
    return () => { cancelled = true; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === 'loading') return;
    setState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json();
      if (!res.ok) { setState('error'); setMessage(data?.error ?? 'Something went wrong'); return; }
      setState('done');
      setMessage(data?.message ?? 'Check your email to confirm');
      trackEvent('newsletter_subscribed', { source });
    } catch {
      setState('error');
      setMessage('Something went wrong');
    }
  }

  // Unknown or already subscribed — show nothing at all.
  if (subscribed === null || subscribed === true) return null;

  if (state === 'done') {
    return (
      <div
        className={`rounded-2xl border p-4 text-center ${className} ${
          dark
            ? 'border-emerald-400/30 bg-emerald-400/10'
            : 'border-emerald-200/70 bg-emerald-50/50'
        }`}
      >
        <p className={`text-sm font-semibold ${dark ? 'text-emerald-200' : 'text-slate-900'}`}>{message}</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${className} ${
        dark ? 'border-white/12 bg-white/[0.06] backdrop-blur-sm' : 'border-slate-200/70 bg-slate-50/60'
      }`}
    >
      <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{heading}</p>
      <p className={`mt-1 text-xs leading-relaxed ${dark ? 'text-blue-100/60' : 'text-slate-500'}`}>{sub}</p>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@firm.com"
          aria-label="Email address"
          className={`h-11 min-w-0 flex-1 rounded-xl border px-3.5 text-[16px] outline-none transition focus:ring-2 sm:text-sm ${
            dark
              ? 'border-white/15 bg-white/10 text-white placeholder:text-blue-100/40 focus:border-blue-300 focus:ring-blue-400/25'
              : 'border-slate-200 bg-white text-slate-900 focus:border-blue-400 focus:ring-blue-400/20'
          }`}
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className={`h-11 shrink-0 rounded-xl px-5 text-sm font-semibold transition disabled:opacity-60 ${
            dark ? 'bg-white text-slate-950 hover:bg-blue-50' : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {state === 'loading' ? 'Joining…' : 'Subscribe free'}
        </button>
      </form>
      {state === 'error' && (
        <p className={`mt-2 text-xs ${dark ? 'text-rose-300' : 'text-rose-600'}`}>{message}</p>
      )}
    </div>
  );
}
