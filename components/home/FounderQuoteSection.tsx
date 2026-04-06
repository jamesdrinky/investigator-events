'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from '@/components/motion/reveal';

export function FounderQuoteSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Light gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(239,246,255,0.5)_0%,rgba(224,231,255,0.4)_25%,rgba(237,233,254,0.3)_50%,rgba(255,255,255,0)_100%)]" />

      <div className="container-shell relative">
        <div className="app-mobile-shell">
          <Reveal>
            {/* ── Card with animated gradient border ── */}
            <div className="relative mx-auto max-w-5xl rounded-[1.8rem] p-[2px] sm:rounded-[2.5rem]">
              {/* Animated gradient border */}
              <div
                className="absolute inset-0 rounded-[1.8rem] sm:rounded-[2.5rem]"
                style={{
                  background: 'linear-gradient(92deg, #3b82f6, #22d3ee, #a855f7, #ec4899, #3b82f6)',
                  backgroundSize: '300% 100%',
                  animation: reducedMotion ? 'none' : 'gradient-text-cycle 6s ease-in-out infinite',
                }}
              />

              {/* Inner card */}
              <div className="relative rounded-[calc(1.8rem-2px)] bg-white p-8 sm:rounded-[calc(2.5rem-2px)] sm:p-12 lg:p-16">
                <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-16">
                  {/* ── Portrait with rings ── */}
                  <div className="relative shrink-0">
                    {/* Outer rotating ring */}
                    <motion.div
                      animate={reducedMotion ? {} : { rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-[-24%] rounded-full border border-dashed border-blue-400/25"
                    />
                    {/* Inner ring */}
                    <motion.div
                      animate={reducedMotion ? {} : { rotate: -360 }}
                      transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-[-14%] rounded-full border border-dashed border-violet-400/20"
                    />
                    {/* Pulsing glow */}
                    <motion.div
                      animate={reducedMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-[-8%] rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/15 blur-xl"
                    />

                    {/* Portrait */}
                    <div className="relative h-28 w-28 overflow-hidden rounded-full ring-[3px] ring-white shadow-[0_12px_40px_-8px_rgba(99,102,241,0.3)] sm:h-36 sm:w-36 lg:h-44 lg:w-44">
                      <Image
                        src="/faces/mike2.png"
                        alt="Mike LaCorte"
                        width={176}
                        height={176}
                        className="h-full w-full scale-[1.15] object-cover object-[center_30%]"
                        sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px"
                      />
                    </div>
                  </div>

                  {/* ── Content ── */}
                  <div className="text-center lg:text-left">
                    <p className="eyebrow">Founder&apos;s Note</p>
                    <blockquote className="mt-5 text-[1.4rem] font-semibold leading-[1.3] tracking-[-0.025em] text-slate-950 sm:mt-6 sm:text-[1.8rem] sm:leading-[1.32] lg:text-[2.2rem] lg:leading-[1.28]">
                      &ldquo;I built this site because I kept missing events I wanted to attend, not through lack
                      of interest, but because no one could see what was already in the diary. One shared
                      calendar changes that.&rdquo;
                    </blockquote>
                    <div className="mt-6 sm:mt-8">
                      <p className="text-lg font-semibold text-slate-950">Mike LaCorte</p>
                      <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 lg:mx-0">
                        Founder, Investigator Events · CEO, Conflict International · President, Association
                        of British Investigators · Secretary General, IKD
                      </p>
                    </div>
                    <Link
                      href="/about"
                      className="btn-glow mt-6 inline-flex px-6 py-3 text-sm sm:mt-8"
                    >
                      Read the full story →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
