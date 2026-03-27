'use client';

import Image from 'next/image';
import Link from 'next/link';

export function FounderQuoteSection() {
  return (
    <section className="py-12 sm:py-20">
      <div className="container-shell">
        <div className="mx-auto max-w-5xl rounded-[1.35rem] border border-slate-200 bg-white p-4 sm:rounded-[1.75rem] sm:p-8 lg:p-10">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[5rem_minmax(0,1fr)] lg:items-start">
            <div className="flex justify-center lg:justify-start">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1 sm:h-16 sm:w-16">
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

            <div className="border-l-4 border-blue-600 pl-4 sm:pl-6">
              <p className="eyebrow">FOUNDER&apos;S NOTE</p>
              <blockquote className="mt-4 text-[1.05rem] font-medium leading-7 tracking-[-0.02em] text-slate-950 sm:mt-5 sm:text-2xl sm:leading-9">
                “I built this site because I kept missing events I wanted to attend, not through lack of interest, but because no one could see what was already in the diary. One shared calendar changes that.”
              </blockquote>
              <div className="mt-4 sm:mt-6">
                <p className="text-sm font-semibold text-slate-900">Mike LaCorte</p>
                <p className="mt-2 hidden max-w-3xl text-sm leading-6 text-slate-600 sm:block">
                  Founder, Investigator Events | CEO, Conflict International | President, Association of British Investigators | Secretary General, IKD
                </p>
              </div>
              <Link
                href="/about"
                className="mt-4 inline-flex items-center text-sm font-semibold text-blue-700 transition-colors hover:text-slate-950 sm:mt-6"
              >
                Read the full story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
