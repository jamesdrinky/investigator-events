'use client';

import { useState, useEffect, useCallback } from 'react';
import { SpiralAnimation } from '@/components/ui/spiral-animation';

interface SpiralIntroProps {
  children: React.ReactNode;
}

export function SpiralIntro({ children }: SpiralIntroProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [enterVisible, setEnterVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('advice-intro-seen');
    if (seen) {
      setShowIntro(false);
    }
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    const timer = setTimeout(() => setEnterVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [showIntro]);

  const handleEnter = useCallback(() => {
    setFadeOut(true);
    sessionStorage.setItem('advice-intro-seen', '1');
    setTimeout(() => setShowIntro(false), 900);
  }, []);

  if (!showIntro) return <>{children}</>;

  return (
    <>
      {/* Spiral intro overlay — brand navy background */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-800 ${fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        style={{ background: '#06091a' }}
      >
        <div className="absolute inset-0">
          <SpiralAnimation />
        </div>

        {/* Enter content */}
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-1000 ease-out ${
            enterVisible && !fadeOut ? 'opacity-100' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.4em] text-cyan-400/60 sm:text-xs">
            Investigator Events
          </p>
          <button
            onClick={handleEnter}
            className="group relative text-[1.6rem] font-light uppercase tracking-[0.3em] text-white/80 transition-all duration-700 hover:tracking-[0.4em] hover:text-white sm:text-3xl"
          >
            Enter
            {/* Underline glow */}
            <span className="absolute -bottom-2 left-0 h-px w-full scale-x-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 transition-transform duration-500 group-hover:scale-x-100" />
          </button>
          <p className="mt-8 max-w-xs text-center text-[11px] leading-relaxed tracking-[0.1em] text-white/20 sm:text-xs">
            Conference Dos &amp; Don&apos;ts
          </p>
        </div>
      </div>

      {/* Content hidden behind, fades in */}
      <div className={`transition-opacity duration-500 ${fadeOut ? 'opacity-100' : 'opacity-0'}`}>
        {children}
      </div>
    </>
  );
}
