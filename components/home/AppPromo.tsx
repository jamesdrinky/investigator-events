'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Calendar, Users, Zap, MapPin } from 'lucide-react';

interface AppPromoProps {
  liveEventCount: number;
  countriesCount: number;
}

/**
 * Sleek non-pinned iOS app promo. Same visual vocabulary as the cinematic
 * version (deep blue depth card, iPhone mockup, floating glass badges,
 * count-up of live events) but rendered as a normal-flow section so the
 * page's scroll pace stays fast.
 *
 * Count-up triggers ONCE when the section enters the viewport. No
 * scroll-scrubbed animation, no pin, no GSAP — pure IntersectionObserver
 * + a small RAF tween for the number.
 */
export function AppPromo({ liveEventCount, countriesCount }: AppPromoProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Count-up animation when the section becomes visible.
  useEffect(() => {
    if (!visible) return;
    const target = liveEventCount;
    const duration = 1600;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounter(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, liveEventCount]);

  const progressOffset = visible ? 402 - (402 * 0.85) : 402;

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      {/* Aurora backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.32),transparent_55%)] blur-3xl" />
        <div className="absolute top-1/3 right-0 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.24),transparent_60%)] blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
      </div>

      <div className="container-shell relative">
        {/* Deep premium card */}
        <div
          className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem]"
          style={{
            background: 'linear-gradient(145deg, #162C6D 0%, #0A101D 100%)',
            boxShadow:
              '0 40px 100px -20px rgba(0,0,0,0.9), 0 20px 40px -20px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {/* Subtle card sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(800px circle at 50% 30%, rgba(255,255,255,0.05) 0%, transparent 50%)',
              mixBlendMode: 'screen',
            }}
          />

          <div className="relative grid items-center gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-14 lg:py-20">
            {/* LEFT: copy + CTAs */}
            <div
              className="text-center lg:text-left"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-24px)',
                transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">Investigator Events for iOS</span>
              </div>

              <h2 className="mt-5 text-4xl font-extrabold leading-[0.96] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]">
                Take the calendar{' '}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                  everywhere
                </span>
                .
              </h2>

              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-blue-100/65 sm:text-lg lg:mx-0">
                Every confirmed PI conference, AGM, and training event — plus a verified network, Clash Checker, jobs board, and forum — in your pocket.
              </p>

              {/* Feature pills */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
                  <Calendar className="h-3 w-3 text-blue-300" /> Events calendar
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
                  <Users className="h-3 w-3 text-violet-300" /> Network
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
                  <Zap className="h-3 w-3 text-amber-300" /> Clash Checker
                </span>
              </div>

              {/* App Store buttons */}
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <a
                  href="https://apps.apple.com/app/id6769977101"
                  aria-label="Download on the App Store"
                  className="group flex items-center justify-center gap-3 rounded-2xl px-6 py-3.5 text-slate-900 transition active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
                    boxShadow:
                      '0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  <svg className="h-7 w-7 transition-transform group-hover:scale-105" fill="currentColor" viewBox="0 0 384 512" aria-hidden="true">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Download on the</div>
                    <div className="text-lg font-bold leading-none tracking-tight">App Store</div>
                  </div>
                </a>

                <a
                  href="#"
                  aria-label="Coming soon to Google Play"
                  className="group flex items-center justify-center gap-3 rounded-2xl px-6 py-3.5 text-white transition active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(180deg, #27272A 0%, #18181B 100%)',
                    boxShadow:
                      '0 0 0 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.8)',
                  }}
                >
                  <svg className="h-6 w-6 transition-transform group-hover:scale-105" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Coming soon to</div>
                    <div className="text-lg font-bold leading-none tracking-tight">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            {/* RIGHT: iPhone mockup */}
            <div
              className="relative flex items-center justify-center"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.92)',
                transition: 'opacity 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s, transform 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s',
              }}
            >
              <div className="relative">
                {/* iPhone bezel */}
                <div
                  className="relative h-[460px] w-[230px] rounded-[2.5rem] sm:h-[520px] sm:w-[260px] sm:rounded-[3rem]"
                  style={{
                    backgroundColor: '#111',
                    boxShadow:
                      'inset 0 0 0 2px #52525B, inset 0 0 0 7px #000, 0 40px 80px -15px rgba(0,0,0,0.9), 0 15px 25px -5px rgba(0,0,0,0.7)',
                  }}
                >
                  {/* Inner screen */}
                  <div className="absolute inset-[7px] overflow-hidden rounded-[2rem] bg-[#050914] text-white shadow-[inset_0_0_15px_rgba(0,0,0,1)] sm:rounded-[2.5rem]">
                    {/* Screen glare */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{ background: 'linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%)' }}
                    />

                    {/* Dynamic Island */}
                    <div className="absolute left-1/2 top-[6px] z-50 flex h-[24px] w-[90px] -translate-x-1/2 items-center justify-end rounded-full bg-black px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)] sm:h-[28px] sm:w-[100px]">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    </div>

                    {/* App content */}
                    <div className="relative flex h-full w-full flex-col px-4 pt-10 pb-6 sm:px-5 sm:pt-12 sm:pb-8">
                      <div className="mb-6 flex items-center justify-between sm:mb-8">
                        <div className="flex flex-col">
                          <span className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-neutral-400 sm:text-[10px]">Live now</span>
                          <span className="text-lg font-bold tracking-tight text-white drop-shadow-md sm:text-xl">Calendar</span>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-neutral-200 shadow-lg shadow-black/50 sm:h-9 sm:w-9 sm:text-sm">IE</div>
                      </div>

                      {/* Progress ring + count */}
                      <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] sm:mb-8 sm:h-44 sm:w-44">
                        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                          <circle cx="50%" cy="50%" r="64" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                          <circle
                            cx="50%"
                            cy="50%"
                            r="64"
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray="402"
                            strokeDashoffset={progressOffset}
                            style={{
                              transform: 'rotate(-90deg)',
                              transformOrigin: 'center',
                              transition: 'stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)',
                            }}
                          />
                        </svg>
                        <div className="z-10 flex flex-col items-center text-center">
                          <span className="text-3xl font-extrabold tracking-tighter text-white sm:text-4xl">{counter}</span>
                          <span className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.1em] text-blue-200/50 sm:text-[8px]">Live events</span>
                        </div>
                      </div>

                      {/* Stat rows */}
                      <div className="space-y-2.5 sm:space-y-3">
                        <div
                          className="flex items-center rounded-2xl p-2.5 sm:p-3"
                          style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.03)',
                          }}
                        >
                          <div className="mr-2.5 flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-blue-600/5 shadow-inner sm:mr-3 sm:h-10 sm:w-10">
                            <Calendar className="h-3.5 w-3.5 text-blue-400 drop-shadow-md sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1.5 h-2 w-20 rounded-full bg-neutral-300 shadow-inner" />
                            <div className="h-1.5 w-12 rounded-full bg-neutral-600 shadow-inner" />
                          </div>
                        </div>

                        <div
                          className="flex items-center rounded-2xl p-2.5 sm:p-3"
                          style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.03)',
                          }}
                        >
                          <div className="mr-2.5 flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 shadow-inner sm:mr-3 sm:h-10 sm:w-10">
                            <Users className="h-3.5 w-3.5 text-emerald-400 drop-shadow-md sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1.5 h-2 w-16 rounded-full bg-neutral-300 shadow-inner" />
                            <div className="h-1.5 w-24 rounded-full bg-neutral-600 shadow-inner" />
                          </div>
                        </div>
                      </div>

                      {/* Home indicator */}
                      <div className="absolute bottom-1.5 left-1/2 h-1 w-[100px] -translate-x-1/2 rounded-full bg-white/20 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    </div>
                  </div>
                </div>

                {/* Floating glass badges */}
                <div
                  className="absolute -left-12 top-8 hidden items-center gap-3 rounded-2xl p-4 backdrop-blur-md sm:flex"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    boxShadow:
                      '0 0 0 1px rgba(255, 255, 255, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 1px rgba(0,0,0,0.5)',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translate(0, 0)' : 'translate(-20px, 12px)',
                    transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.5s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.5s',
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/30 bg-gradient-to-b from-amber-500/20 to-amber-900/10 shadow-inner">
                    <Zap className="h-5 w-5 text-amber-300 drop-shadow-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-white">Clash Checker</p>
                    <p className="text-xs font-medium text-blue-200/55">Compare any two events</p>
                  </div>
                </div>

                <div
                  className="absolute -right-12 bottom-14 hidden items-center gap-3 rounded-2xl p-4 backdrop-blur-md sm:flex"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    boxShadow:
                      '0 0 0 1px rgba(255, 255, 255, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 1px rgba(0,0,0,0.5)',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translate(0, 0)' : 'translate(20px, 12px)',
                    transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.7s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.7s',
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/30 bg-gradient-to-b from-violet-500/20 to-violet-900/10 shadow-inner">
                    <MapPin className="h-5 w-5 text-violet-300 drop-shadow-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-white">{countriesCount} countries</p>
                    <p className="text-xs font-medium text-blue-200/55">100+ verified PIs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust line below the card */}
        <p className="mt-6 text-center text-[11px] font-medium text-white/45 sm:text-xs">
          Available on iOS now <ArrowRight className="inline h-3 w-3" /> Android coming soon
        </p>
      </div>
    </section>
  );
}
