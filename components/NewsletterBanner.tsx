'use client';

import { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';

const STORAGE_KEY = 'ie_newsletter_dismissed';

export function NewsletterBanner() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'subscribed') return;
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) return;
    }
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;

      if (!res.ok) {
        setStatus('error');
        setMessage(data?.error ?? 'Something went wrong. Try again.');
        return;
      }

      setStatus('success');
      setMessage('You\'re in! Check your inbox.');
      setEmail('');
      localStorage.setItem(STORAGE_KEY, 'subscribed');
      setTimeout(() => setVisible(false), 3000);
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Try again.');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-2xl px-4 pb-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-blue-500/20 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-indigo-500/15 blur-[60px]" />

          {/* Close */}
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white/30 transition hover:bg-white/10 hover:text-white/60"
          >
            <X className="h-4 w-4" />
          </button>

          {status === 'success' ? (
            <div className="relative flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-emerald-400">{message}</p>
            </div>
          ) : (
            <div className="relative p-5 sm:p-6">
              <div className="flex items-start gap-3 pr-8">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">Don&apos;t miss the next big event</p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Join <span className="font-semibold text-blue-400">500+ investigators</span> getting the weekly brief — new events, dates, and one featured listing.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  disabled={status === 'loading'}
                  className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-white/8 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="h-11 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-400 hover:to-indigo-500 disabled:opacity-60 sm:px-6"
                >
                  {status === 'loading' ? '...' : 'Subscribe free'}
                </button>
              </form>

              {status === 'error' && (
                <p className="mt-2 text-xs text-rose-400">{message}</p>
              )}

              <p className="mt-3 text-[10px] text-slate-500">
                Free forever. No spam. Unsubscribe anytime.{' '}
                <a href="/privacy" className="underline hover:text-slate-400">Privacy policy</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
