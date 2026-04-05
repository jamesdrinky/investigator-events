'use client';

import Image from 'next/image';
import Link from 'next/link';

export function FounderQuoteSection() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-24">
      {/* Dark navy section background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(170deg,#f4f8ff_0%,#0a1128_18%,#0c1535_60%,#091028_100%)]" />
      {/* Background glows */}
      <div className="pointer-events-none absolute left-[10%] top-[20%] h-80 w-80 rounded-full bg-[radial-gradient(ellipse,rgba(22,104,255,0.22),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[12%] bottom-[18%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse,rgba(111,86,255,0.18),transparent_65%)] blur-3xl" />
      <div className="container-shell relative">
        <div className="app-mobile-shell">
        <div
          className="mx-auto max-w-5xl overflow-hidden rounded-[1.35rem] border bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-3.5 shadow-[0_44px_120px_-52px_rgba(0,0,50,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl sm:rounded-[1.75rem] sm:p-8 lg:p-10"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          {/* Top gradient shimmer line */}
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.5),rgba(56,189,248,0.5),transparent)]" />
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[5rem_minmax(0,1fr)] lg:items-start">
            <div className="flex justify-center lg:justify-start">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full border p-1 sm:h-16 sm:w-16"
                style={{ borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)' }}
              >
                <Image
                  src="/faces/mike1.webp"
                  alt="Mike LaCorte"
                  width={64}
                  height={64}
                  className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
                  sizes="56px"
                />
              </div>
            </div>

            <div className="border-l-4 border-blue-400/60 pl-4 sm:pl-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-blue-400 sm:text-xs">
                FOUNDER&apos;S NOTE
              </p>
              <blockquote className="mt-4 text-[1.05rem] font-medium leading-7 tracking-[-0.02em] text-white sm:mt-5 sm:text-2xl sm:leading-9">
                &ldquo;I built this site because I kept missing events I wanted to attend, not through lack
                of interest, but because no one could see what was already in the diary. One shared
                calendar changes that.&rdquo;
              </blockquote>
              <div className="mt-4 sm:mt-6">
                <p className="text-sm font-semibold text-white/90">Mike LaCorte</p>
                <p className="mt-2 hidden max-w-3xl text-sm leading-6 text-slate-400 sm:block">
                  Founder, Investigator Events | CEO, Conflict International | President, Association
                  of British Investigators | Secretary General, IKD
                </p>
              </div>
              <Link
                href="/about"
                className="mt-4 inline-flex items-center text-sm font-semibold text-blue-400 transition-colors hover:text-white sm:mt-6"
              >
                Read the full story
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
