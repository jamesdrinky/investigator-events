'use client';

import { useState, useEffect, useRef } from 'react';
import { SpiralAnimation } from '@/components/ui/spiral-animation';

export function SiteIntro() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);
  const dismissedRef = useRef(false);

  // TODO: Re-enable for production
  // useEffect(() => {
  //   const seen = localStorage.getItem('ie-intro-seen');
  //   if (seen) {
  //     setShow(false);
  //     window.dispatchEvent(new CustomEvent('intro-complete'));
  //     return;
  //   }
  // }, []);

  useEffect(() => {
    if (!show) return;
    const t1 = setTimeout(() => setTextVisible(true), 2000);
    const t2 = setTimeout(() => setSkipVisible(true), 4000);
    const t3 = setTimeout(() => doDismiss(), 12000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show]);

  function doDismiss() {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setFadeOut(true);
    // Remove the data attribute so hero's poll detects completion
    // This happens 300ms into the fade — hero starts animating while spiral still dissolves
    setTimeout(() => {
      const el = document.querySelector('[data-site-intro]');
      if (el) el.removeAttribute('data-site-intro');
    }, 300);
    // localStorage.setItem('ie-intro-seen', '1'); // TODO: re-enable
    setTimeout(() => setShow(false), 1600);
  }

  if (!show) return null;

  return (
    <div
      data-site-intro
      className={`fixed inset-0 z-[200] ${fadeOut ? 'pointer-events-none' : ''}`}
      style={{ background: '#06091a' }}
      onClick={doDismiss}
    >
      <div
        className="absolute inset-0 transition-opacity duration-[1500ms]"
        style={{ opacity: fadeOut ? 0 : 1 }}
      >
        <SpiralAnimation />
      </div>

      <div
        className="absolute inset-0 bg-[#06091a]/30 transition-opacity duration-1000"
        style={{ opacity: textVisible && !fadeOut ? 1 : 0 }}
      />

      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-[1200ms] ease-out"
        style={{
          opacity: textVisible && !fadeOut ? 1 : 0,
          transform: textVisible && !fadeOut ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-cyan-400/60 sm:text-xs">
          Investigator Events
        </p>
        <p className="mt-2 text-[11px] tracking-[0.18em] text-white/20 sm:text-xs">
          Global Event Discovery
        </p>
      </div>

      <div
        className="absolute inset-x-0 bottom-10 z-10 text-center transition-opacity duration-700"
        style={{ opacity: skipVisible && !fadeOut ? 1 : 0 }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); doDismiss(); }}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-white/40 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white/60"
        >
          Enter Site
        </button>
      </div>
    </div>
  );
}
