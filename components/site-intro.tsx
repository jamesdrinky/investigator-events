'use client';

import { useState, useEffect, useCallback } from 'react';
import { SpiralAnimation } from '@/components/ui/spiral-animation';

export function SiteIntro() {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const seen = localStorage.getItem('ie-intro-seen');
    if (!seen) {
      setShow(true);
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => dismiss(), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = useCallback(() => {
    if (dismissed) return;
    setDismissed(true);
    setFadeOut(true);
    localStorage.setItem('ie-intro-seen', '1');
    setTimeout(() => setShow(false), 900);
  }, [dismissed]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] transition-opacity duration-800 ${fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      style={{ background: '#06091a' }}
      onClick={dismiss}
    >
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>

      {/* Centered branding */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.4em] text-cyan-400/50 transition-opacity duration-1000 sm:text-xs"
          style={{ animationDelay: '1s' }}
        >
          Investigator Events
        </p>
        <p className="mt-3 text-[11px] tracking-[0.15em] text-white/15">
          Global Event Discovery
        </p>
      </div>

      {/* Skip hint at bottom */}
      <div className="absolute inset-x-0 bottom-8 z-10 text-center">
        <button
          onClick={dismiss}
          className="text-[10px] uppercase tracking-[0.2em] text-white/20 transition-colors hover:text-white/50"
        >
          Tap to skip
        </button>
      </div>
    </div>
  );
}
