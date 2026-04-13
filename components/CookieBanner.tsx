'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[55] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-[1.8rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,246,255,0.96))] p-5 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.28)] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <p className="text-sm leading-relaxed text-slate-700">
          We use a cookie to remember your consent preference. No tracking or advertising cookies are used.{' '}
          <Link href="/privacy" className="font-semibold text-blue-700 underline-offset-2 hover:underline">
            Privacy policy
          </Link>
        </p>
        <div className="flex flex-none gap-2">
          <button
            onClick={decline}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-neutral-900 shadow-[0_8px_20px_-10px_rgba(15,23,42,0.14)] transition duration-300 hover:-translate-y-0.5"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-[linear-gradient(135deg,#1668ff,#14b8ff,#645bff)] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(22,104,255,0.44)] transition duration-300 hover:-translate-y-0.5"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
