'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { NewsletterSignupForm } from '@/components/newsletter-signup-form';

import type { COBEOptions } from 'cobe';

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.25,
  dark: 0.92,
  diffuse: 0.6,
  mapSamples: 20000,
  mapBrightness: 8,
  baseColor: [0.12, 0.14, 0.28],
  markerColor: [0.08, 0.65, 1],
  glowColor: [0.08, 0.22, 0.6],
  markers: [
    { location: [51.5072, -0.1276], size: 0.08 },
    { location: [48.8566, 2.3522], size: 0.06 },
    { location: [40.7128, -74.006], size: 0.07 },
    { location: [52.52, 13.405], size: 0.05 },
    { location: [41.9028, 12.4964], size: 0.05 },
    { location: [25.2048, 55.2708], size: 0.06 },
    { location: [-33.8688, 151.2093], size: 0.05 },
    { location: [35.6762, 139.6503], size: 0.05 },
    { location: [53.3498, -6.2603], size: 0.04 },
    { location: [59.3293, 18.0686], size: 0.04 },
    { location: [50.8503, 4.3517], size: 0.04 },
    { location: [38.7223, -9.1393], size: 0.04 },
  ],
};

function CobeGlobe({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerMovement = useRef(0);
  const phiRef = useRef(0);
  const rRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.offsetWidth;

    const globe = createGlobe(canvasRef.current, {
      ...GLOBE_CONFIG,
      width: w * 2,
      height: w * 2,
    });

    let frame: number;
    const tick = () => {
      if (!pointerInteracting.current) phiRef.current += 0.004;
      globe.update({ phi: phiRef.current + rRef.current });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const t = setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1';
    }, 100);

    return () => {
      cancelAnimationFrame(frame);
      globe.destroy();
      clearTimeout(t);
    };
  }, []);

  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-0 transition-opacity duration-700"
        style={{ contain: 'layout paint size', cursor: 'grab' }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerMovement.current = delta;
            rRef.current = delta / 200;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerMovement.current = delta;
            rRef.current = delta / 200;
          }
        }}
      />
    </div>
  );
}

export function GlobeNewsletterSection() {
  return (
    <section
      id="newsletter"
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,#06091a,#0d1840)] px-5 py-10 shadow-[0_40px_120px_-40px_rgba(0,0,50,0.5)] sm:rounded-[3rem] sm:px-10 sm:py-16 lg:px-14"
    >
      {/* Subtle glow accents */}
      <div className="pointer-events-none absolute left-[5%] top-[10%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse,rgba(22,104,255,0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute right-[10%] bottom-[10%] h-48 w-48 rounded-full bg-[radial-gradient(ellipse,rgba(236,72,153,0.08),transparent_60%)]" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* Left: text + form */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-400 sm:text-xs">
            Newsletter
          </p>
          <h2 className="mt-4 max-w-[12ch] text-[2rem] font-semibold leading-[0.94] tracking-[-0.05em] text-white sm:text-[2.8rem] lg:text-[3.5rem]">
            Get free weekly event alerts
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-blue-200/50 sm:mt-5">
            New events, important dates, and key conferences sent straight to
            your inbox. No spam. Unsubscribe any time.
          </p>

          <div className="mt-6 hidden flex-wrap gap-2 sm:flex">
            {['New events', 'Upcoming dates', 'Featured events'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/70"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8">
            <NewsletterSignupForm />
          </div>
        </div>

        {/* Right: COBE globe */}
        <div className="relative mx-auto hidden w-full max-w-[26rem] lg:block">
          <CobeGlobe />
        </div>
      </div>
    </section>
  );
}
