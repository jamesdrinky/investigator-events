'use client';

import { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';

const STORAGE_KEY = 'ie_newsletter_dismissed';

export function NewsletterBanner() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Show after a short delay, only if not dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    // Dismiss for 7 days
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
      setMessage(data?.message ?? 'Subscribed!');
      setEmail('');
      // Permanently dismiss after subscribing
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
      <div className="mx-auto max-w-3xl px-4 pb-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
          {/* Close button */}
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>

          {status === 'success' ? (
            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Mail className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-emerald-700">{message}</p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-start gap-3 pr-8">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Stay in the loop</p>
                  <p className="text-xs text-slate-500">
                    Weekly brief — new events, approaching dates, one featured listing. Free, no spam.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  disabled={status === 'loading'}
                  className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60 sm:px-5"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>

              {status === 'error' && (
                <p className="mt-2 text-xs text-rose-600">{message}</p>
              )}

              <p className="mt-2 text-[10px] text-slate-400">
                By subscribing you consent to receive our weekly newsletter. Unsubscribe anytime.{' '}
                <a href="/privacy" className="underline hover:text-slate-600">Privacy policy</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
