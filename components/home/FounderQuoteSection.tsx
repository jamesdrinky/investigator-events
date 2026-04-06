'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

export function FounderQuoteSection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-28">
      {/* Soft gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(239,246,255,0.6)_0%,rgba(224,231,255,0.5)_25%,rgba(237,233,254,0.4)_50%,rgba(252,231,243,0.3)_75%,rgba(255,255,255,0)_100%)]" />
      {/* Floating gradient accents */}
      <div className="pointer-events-none absolute left-[5%] top-[10%] h-72 w-72 rounded-full bg-[radial-gradient(ellipse,rgba(99,102,241,0.12),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] bottom-[10%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse,rgba(236,72,153,0.1),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute left-[40%] top-[5%] h-48 w-48 rounded-full bg-[radial-gradient(ellipse,rgba(14,165,233,0.1),transparent_65%)] blur-3xl" />

      <div className="container-shell relative">
        <div className="app-mobile-shell">
          <Reveal>
            <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/80 p-5 shadow-[0_40px_100px_-40px_rgba(76,90,255,0.18)] backdrop-blur-xl sm:rounded-[2.5rem] sm:p-10 lg:p-14">
              {/* Glass highlight */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_30%,rgba(255,255,255,0.12)_55%,rgba(255,255,255,0)_100%)]" />
              {/* Gradient top shimmer line */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.5),rgba(14,165,233,0.5),rgba(236,72,153,0.4),transparent)]" />

              <div className="relative grid gap-5 sm:gap-8 lg:grid-cols-[5.5rem_minmax(0,1fr)] lg:items-start">
                <div className="flex justify-center lg:justify-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-1 shadow-[0_8px_30px_-10px_rgba(99,102,241,0.2)] sm:h-20 sm:w-20">
                    <Image
                      src="/faces/mike1.webp"
                      alt="Mike LaCorte"
                      width={80}
                      height={80}
                      className="h-14 w-14 rounded-full object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
                      sizes="72px"
                    />
                  </div>
                </div>

                <div>
                  <p className="eyebrow">FOUNDER&apos;S NOTE</p>
                  <blockquote className="mt-4 text-[1.15rem] font-semibold leading-[1.4] tracking-[-0.02em] text-slate-950 sm:mt-6 sm:text-[1.75rem] sm:leading-[1.35] lg:text-[2.15rem] lg:leading-[1.3]">
                    &ldquo;I built this site because I kept missing events I wanted to attend, not through lack
                    of interest, but because no one could see what was already in the diary. One shared
                    calendar changes that.&rdquo;
                  </blockquote>
                  <div className="mt-4 sm:mt-8">
                    <p className="text-base font-semibold text-slate-950 sm:text-lg">Mike LaCorte</p>
                    <p className="mt-2 hidden max-w-3xl text-sm leading-relaxed text-slate-500 sm:block">
                      Founder, Investigator Events | CEO, Conflict International | President, Association
                      of British Investigators | Secretary General, IKD
                    </p>
                  </div>
                  <Link
                    href="/about"
                    className="premium-link mt-4 inline-flex items-center text-sm font-semibold text-blue-600 transition-colors hover:text-slate-950 sm:mt-6"
                  >
                    Read the full story
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
