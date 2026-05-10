'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollTarget = document.querySelector<HTMLElement>('[data-app-content]') ?? window;
    const getScrollTop = () => scrollTarget === window ? window.scrollY : (scrollTarget as HTMLElement).scrollTop;
    const onScroll = () => setVisible(getScrollTop() > 600);

    onScroll();
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollTarget.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  const scrollToTop = () => {
    const scrollTarget = document.querySelector<HTMLElement>('[data-app-content]');
    if (scrollTarget) {
      scrollTarget.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-24 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-lg transition hover:bg-slate-50 hover:text-slate-900 sm:bottom-8 sm:right-8"
      aria-label="Back to top"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
