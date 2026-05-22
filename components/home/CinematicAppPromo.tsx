'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .cap-reveal { visibility: hidden; }

  .cap-film-grain {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.04; mix-blend-mode: overlay;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .cap-bg-grid {
      background-size: 60px 60px;
      background-image:
          linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .cap-text-3d {
      color: #f8fafc;
      text-shadow:
          0 10px 30px rgba(0,0,0,0.6),
          0 2px 4px rgba(0,0,0,0.3);
  }

  .cap-text-silver {
      background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.4) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter:
          drop-shadow(0px 10px 20px rgba(0,0,0,0.3))
          drop-shadow(0px 2px 4px rgba(0,0,0,0.2));
  }

  .cap-text-card-silver {
      background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter:
          drop-shadow(0px 12px 24px rgba(0,0,0,0.8))
          drop-shadow(0px 4px 8px rgba(0,0,0,0.6));
  }

  .cap-depth-card {
      background: linear-gradient(145deg, #162C6D 0%, #0A101D 100%);
      box-shadow:
          0 40px 100px -20px rgba(0, 0, 0, 0.9),
          0 20px 40px -20px rgba(0, 0, 0, 0.8),
          inset 0 1px 2px rgba(255, 255, 255, 0.2),
          inset 0 -2px 4px rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.04);
      position: relative;
  }

  .cap-card-sheen {
      position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
      background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06) 0%, transparent 40%);
      mix-blend-mode: screen;
  }

  .cap-iphone-bezel {
      background-color: #111;
      box-shadow:
          inset 0 0 0 2px #52525B,
          inset 0 0 0 7px #000,
          0 40px 80px -15px rgba(0,0,0,0.9),
          0 15px 25px -5px rgba(0,0,0,0.7);
      transform-style: preserve-3d;
  }

  .cap-hardware-btn {
      background: linear-gradient(90deg, #404040 0%, #171717 100%);
      box-shadow:
          -2px 0 5px rgba(0,0,0,0.8),
          inset -1px 0 1px rgba(255,255,255,0.15),
          inset 1px 0 2px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(255,255,255,0.05);
  }

  .cap-screen-glare {
      background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }

  .cap-widget-depth {
      background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      box-shadow:
          0 10px 20px rgba(0,0,0,0.3),
          inset 0 1px 1px rgba(255,255,255,0.05),
          inset 0 -1px 1px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.03);
  }

  .cap-floating-badge {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 25px 50px -12px rgba(0, 0, 0, 0.8),
          inset 0 1px 1px rgba(255,255,255,0.2),
          inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  .cap-btn-light, .cap-btn-dark { transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); }
  .cap-btn-light {
      background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
      color: #0F172A;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .cap-btn-light:hover { transform: translateY(-3px); box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15), 0 20px 32px -6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06); }
  .cap-btn-dark {
      background: linear-gradient(180deg, #27272A 0%, #18181B 100%);
      color: #FFFFFF;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .cap-btn-dark:hover { transform: translateY(-3px); background: linear-gradient(180deg, #3F3F46 0%, #27272A 100%); }

  .cap-progress-ring {
      transform: rotate(-90deg);
      transform-origin: center;
      stroke-dasharray: 402;
      stroke-dashoffset: 402;
      stroke-linecap: round;
  }
`;

interface CinematicAppPromoProps {
  brandName?: string;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  className?: string;
}

export function CinematicAppPromo({
  brandName = 'IE',
  tagline1 = 'Investigate every event,',
  tagline2 = 'across the globe.',
  cardHeading = 'The PI calendar, in your pocket.',
  cardDescription = <><span className="text-white font-semibold">Investigator Events</span> brings every confirmed PI conference, AGM, and training event into one app — plus a verified network, Clash Checker, jobs board, and forum.</>,
  metricValue = 46,
  metricLabel = 'Live Events',
  ctaHeading = 'Take it everywhere.',
  ctaDescription = 'Download the Investigator Events app — events calendar, network, and Clash Checker on your phone.',
  className,
}: CinematicAppPromoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    // Heavy GSAP scroll-pin scene — desktop only. On mobile/tablet the
    // component is display:none via parent, so skip setup to avoid wasted
    // work + potential pin-trigger bugs on hidden elements.
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!mainCardRef.current || !mockupRef.current) return;
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        const rect = mainCardRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        mainCardRef.current!.style.setProperty('--mouse-x', `${mouseX}px`);
        mainCardRef.current!.style.setProperty('--mouse-y', `${mouseY}px`);
        const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
        const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
        gsap.to(mockupRef.current, {
          rotationY: xVal * 12,
          rotationX: -yVal * 12,
          ease: 'power3.out',
          duration: 1.2,
        });
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    // Desktop only — match the mousemove effect's gating above.
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;
    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      gsap.set('.cap-text-track', { autoAlpha: 0, y: 60, scale: 0.85, filter: 'blur(20px)', rotationX: -20 });
      gsap.set('.cap-text-days', { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' });
      gsap.set('.cap-main-card', { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set(['.cap-card-left', '.cap-card-right', '.cap-mockup', '.cap-floating', '.cap-phone-widget'], { autoAlpha: 0 });
      gsap.set('.cap-cta', { autoAlpha: 0, scale: 0.8, filter: 'blur(30px)' });

      const introTl = gsap.timeline({ delay: 0.3 });
      introTl
        .to('.cap-text-track', { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', rotationX: 0, ease: 'expo.out' })
        .to('.cap-text-days', { duration: 1.4, clipPath: 'inset(0 0% 0 0)', ease: 'power4.inOut' }, '-=1.0');

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=5000',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to(['.cap-hero-text', '.cap-bg-grid'], { scale: 1.15, filter: 'blur(20px)', opacity: 0.2, ease: 'power2.inOut', duration: 2 }, 0)
        .to('.cap-main-card', { y: 0, ease: 'power3.inOut', duration: 2 }, 0)
        .to('.cap-main-card', { width: '100%', height: '100%', borderRadius: '0px', ease: 'power3.inOut', duration: 1.5 })
        .fromTo(
          '.cap-mockup',
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 2.5 },
          '-=0.8',
        )
        .fromTo('.cap-phone-widget', { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: 'back.out(1.2)', duration: 1.5 }, '-=1.5')
        .to('.cap-progress-ring', { strokeDashoffset: 60, duration: 2, ease: 'power3.inOut' }, '-=1.2')
        .to('.cap-counter-val', { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 2, ease: 'expo.out' }, '-=2.0')
        .fromTo('.cap-floating', { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: 'back.out(1.5)', duration: 1.5, stagger: 0.2 }, '-=2.0')
        .fromTo('.cap-card-left', { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: 'power4.out', duration: 1.5 }, '-=1.5')
        .fromTo('.cap-card-right', { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 1.5 }, '<')
        .to({}, { duration: 2.5 })
        .set('.cap-hero-text', { autoAlpha: 0 })
        .set('.cap-cta', { autoAlpha: 1 })
        .to({}, { duration: 1.5 })
        .to(['.cap-mockup', '.cap-floating', '.cap-card-left', '.cap-card-right'], { scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: 'power3.in', duration: 1.2, stagger: 0.05 })
        .to(
          '.cap-main-card',
          { width: isMobile ? '92vw' : '85vw', height: isMobile ? '92vh' : '85vh', borderRadius: isMobile ? '32px' : '40px', ease: 'expo.inOut', duration: 1.8 },
          'pullback',
        )
        .to('.cap-cta', { scale: 1, filter: 'blur(0px)', ease: 'expo.inOut', duration: 1.8 }, 'pullback')
        .to('.cap-main-card', { y: -window.innerHeight - 300, ease: 'power3.in', duration: 1.5 });
    }, containerRef);

    return () => ctx.revert();
  }, [metricValue]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-screen h-screen overflow-hidden flex items-center justify-center bg-slate-950 text-white font-sans antialiased', className)}
      style={{ perspective: '1500px' }}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="cap-film-grain" aria-hidden="true" />
      <div className="cap-bg-grid absolute inset-0 z-0 pointer-events-none opacity-50" aria-hidden="true" />

      {/* HERO TEXTS */}
      <div className="cap-hero-text absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 will-change-transform">
        <h2 className="cap-text-track cap-reveal cap-text-3d text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tight mb-2">
          {tagline1}
        </h2>
        <h2 className="cap-text-days cap-reveal cap-text-silver text-5xl md:text-7xl lg:text-[6rem] font-extrabold tracking-tighter">
          {tagline2}
        </h2>
      </div>

      {/* CTA BUTTONS */}
      <div className="cap-cta absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 cap-reveal pointer-events-auto will-change-transform">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight cap-text-silver">
          {ctaHeading}
        </h2>
        <p className="text-white/60 text-lg md:text-xl mb-12 max-w-xl mx-auto font-light leading-relaxed">
          {ctaDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <a
            href="https://apps.apple.com/app/id6769977101"
            aria-label="Download on the App Store"
            className="cap-btn-light flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-8 h-8 transition-transform group-hover:scale-105" fill="currentColor" viewBox="0 0 384 512" aria-hidden="true">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase mb-[-2px]">Download on the</div>
              <div className="text-xl font-bold leading-none tracking-tight">App Store</div>
            </div>
          </a>
          <a
            href="#"
            aria-label="Coming soon to Google Play"
            className="cap-btn-dark flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background"
          >
            <svg className="w-7 h-7 transition-transform group-hover:scale-105" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true">
              <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-[-2px]">Coming soon to</div>
              <div className="text-xl font-bold leading-none tracking-tight">Google Play</div>
            </div>
          </a>
        </div>
      </div>

      {/* PHYSICAL DEEP BLUE CARD */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: '1500px' }}>
        <div
          ref={mainCardRef}
          className="cap-main-card cap-depth-card relative overflow-hidden cap-reveal flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[32px] md:rounded-[40px]"
        >
          <div className="cap-card-sheen" aria-hidden="true" />
          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">
            {/* TOP / RIGHT: BRAND */}
            <div className="cap-card-right cap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2 className="text-6xl md:text-[6rem] lg:text-[8rem] font-black uppercase tracking-tighter cap-text-card-silver lg:mt-0">
                {brandName}
              </h2>
            </div>

            {/* MIDDLE / CENTER: IPHONE MOCKUP */}
            <div className="cap-mockup order-2 lg:order-2 relative w-full h-[380px] lg:h-[600px] flex items-center justify-center z-10" style={{ perspective: '1000px' }}>
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.65] md:scale-90 lg:scale-100">
                <div ref={mockupRef} className="relative w-[280px] h-[580px] rounded-[3rem] cap-iphone-bezel flex flex-col will-change-transform transform-style-3d">
                  <div className="absolute top-[120px] -left-[3px] w-[3px] h-[25px] cap-hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[160px] -left-[3px] w-[3px] h-[45px] cap-hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[220px] -left-[3px] w-[3px] h-[45px] cap-hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[170px] -right-[3px] w-[3px] h-[70px] cap-hardware-btn rounded-r-md z-0 scale-x-[-1]" aria-hidden="true" />
                  <div className="absolute inset-[7px] bg-[#050914] rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-white z-10">
                    <div className="absolute inset-0 cap-screen-glare z-40 pointer-events-none" aria-hidden="true" />
                    <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
                    </div>
                    <div className="relative w-full h-full pt-12 px-5 pb-8 flex flex-col">
                      <div className="cap-phone-widget flex justify-between items-center mb-8">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Live now</span>
                          <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">Calendar</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white/5 text-neutral-200 flex items-center justify-center font-bold text-sm border border-white/10 shadow-lg shadow-black/50">IE</div>
                      </div>
                      <div className="cap-phone-widget relative w-44 h-44 mx-auto flex items-center justify-center mb-8 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
                        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                          <circle cx="88" cy="88" r="64" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                          <circle className="cap-progress-ring" cx="88" cy="88" r="64" fill="none" stroke="#3B82F6" strokeWidth="12" />
                        </svg>
                        <div className="text-center z-10 flex flex-col items-center">
                          <span className="cap-counter-val text-4xl font-extrabold tracking-tighter text-white">0</span>
                          <span className="text-[8px] text-blue-200/50 uppercase tracking-[0.1em] font-bold mt-0.5">{metricLabel}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="cap-phone-widget cap-widget-depth rounded-2xl p-3 flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 flex items-center justify-center mr-3 border border-blue-400/20 shadow-inner">
                            <svg className="w-4 h-4 text-blue-400 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <div className="flex-1">
                            <div className="h-2 w-20 bg-neutral-300 rounded-full mb-2 shadow-inner" />
                            <div className="h-1.5 w-12 bg-neutral-600 rounded-full shadow-inner" />
                          </div>
                        </div>
                        <div className="cap-phone-widget cap-widget-depth rounded-2xl p-3 flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center mr-3 border border-emerald-400/20 shadow-inner">
                            <svg className="w-4 h-4 text-emerald-400 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          </div>
                          <div className="flex-1">
                            <div className="h-2 w-16 bg-neutral-300 rounded-full mb-2 shadow-inner" />
                            <div className="h-1.5 w-24 bg-neutral-600 rounded-full shadow-inner" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-white/20 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    </div>
                  </div>
                </div>

                <div className="cap-floating absolute flex top-6 lg:top-12 left-[-15px] lg:left-[-80px] cap-floating-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-blue-500/20 to-blue-900/10 flex items-center justify-center border border-blue-400/30 shadow-inner">
                    <span className="text-base lg:text-xl drop-shadow-lg" aria-hidden="true">⚡</span>
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">Clash Checker</p>
                    <p className="text-blue-200/50 text-[10px] lg:text-xs font-medium">Compare any two events</p>
                  </div>
                </div>

                <div className="cap-floating absolute flex bottom-12 lg:bottom-20 right-[-15px] lg:right-[-80px] cap-floating-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-indigo-500/20 to-indigo-900/10 flex items-center justify-center border border-indigo-400/30 shadow-inner">
                    <span className="text-base lg:text-lg drop-shadow-lg" aria-hidden="true">🌍</span>
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">19 countries</p>
                    <p className="text-blue-200/50 text-[10px] lg:text-xs font-medium">100+ verified PIs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM / LEFT: COPY */}
            <div className="cap-card-left cap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full lg:max-w-none px-4 lg:px-0">
              <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-0 lg:mb-5 tracking-tight">
                {cardHeading}
              </h3>
              <p className="hidden md:block text-blue-100/70 text-sm md:text-base lg:text-lg font-normal leading-relaxed mx-auto lg:mx-0 max-w-sm lg:max-w-none">
                {cardDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
