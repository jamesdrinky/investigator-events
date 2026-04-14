'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from '@/components/motion/reveal';
import { ShinyButton } from '@/components/ui/shiny-button';

export function FounderQuoteSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-16 sm:py-28">
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
              <div className="relative rounded-[calc(1.8rem-2px)] bg-white p-6 sm:rounded-[calc(2.5rem-2px)] sm:p-12 lg:p-16">
                {/* ── Mobile layout: horizontal compact ── */}
                <div className="flex items-start gap-4 sm:hidden">
                  {/* Portrait — no rings on mobile */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-[0_8px_24px_-6px_rgba(99,102,241,0.25)]">
                    <Image
                      src="/faces/mike2.png"
                      alt="Mike LaCorte"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover object-top"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-600">Founder&apos;s Note</p>
                    <blockquote className="mt-2 text-[1.1rem] font-semibold leading-[1.35] tracking-[-0.02em] text-slate-950">
                      &ldquo;I have spent my career in this industry and I still get a buzz walking into a room full of investigators. The problem was never a lack of good events. It was that nobody could see them all in one place.&rdquo;
                    </blockquote>
                    <p className="mt-3 text-sm font-semibold text-slate-950">Mike LaCorte</p>
                    <p className="mt-0.5 text-xs text-slate-400">Founder, Investigator Events</p>
                    <Link
                      href="/profile/mike-lacorte"
                      className="mt-3 inline-flex items-center text-sm font-semibold text-blue-600"
                    >
                      View profile →
                    </Link>
                  </div>
                </div>

                {/* ── Desktop layout: large with rings ── */}
                <div className="hidden sm:flex sm:flex-col sm:items-center sm:gap-8 lg:flex-row lg:items-center lg:gap-16">
                  {/* Portrait with rings */}
                  <div className="relative shrink-0">
                    <motion.div
                      animate={reducedMotion ? {} : { rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-[-24%] rounded-full border border-dashed border-blue-400/25"
                    />
                    <motion.div
                      animate={reducedMotion ? {} : { rotate: -360 }}
                      transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-[-14%] rounded-full border border-dashed border-violet-400/20"
                    />
                    <motion.div
                      animate={reducedMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-[-8%] rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/15 blur-xl"
                    />
                    <div className="relative h-36 w-36 overflow-hidden rounded-full ring-[3px] ring-white shadow-[0_12px_40px_-8px_rgba(99,102,241,0.3)] lg:h-44 lg:w-44">
                      <Image
                        src="/faces/mike2.png"
                        alt="Mike LaCorte"
                        width={176}
                        height={176}
                        className="h-full w-full object-cover object-top"
                        sizes="(max-width: 1024px) 144px, 176px"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center lg:text-left">
                    <p className="eyebrow">Founder&apos;s Note</p>
                    <blockquote className="mt-6 text-[1.8rem] font-semibold leading-[1.32] tracking-[-0.025em] text-slate-950 lg:text-[2.2rem] lg:leading-[1.28]">
                      &ldquo;I have spent my career in this industry and I still get a buzz walking into a room full of investigators. The problem was never a lack of good events. It was that nobody could see them all in one place.&rdquo;
                    </blockquote>
                    <div className="mt-8">
                      <p className="text-lg font-semibold text-slate-950">Mike LaCorte</p>
                      <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 lg:mx-0">
                        Founder, Investigator Events
                      </p>
                    </div>
                    <Link href="/profile/mike-lacorte" className="mt-8 inline-flex">
                      <ShinyButton className="px-6 py-3 text-sm">View profile</ShinyButton>
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
