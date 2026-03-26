'use client';

import Image from 'next/image';
import Link from 'next/link';

export function FounderQuoteSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-shell">
        <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-slate-200 bg-white p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[5rem_minmax(0,1fr)] lg:items-start">
            <div className="flex justify-center lg:justify-start">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1">
                <Image
                  src="/faces/mike1.webp"
                  alt="Mike LaCorte"
                  width={64}
                  height={64}
                  className="h-14 w-14 rounded-full object-cover"
                  sizes="56px"
                />
              </div>
            </div>

            <div className="border-l-4 border-blue-600 pl-5 sm:pl-6">
              <p className="eyebrow">FOUNDER&apos;S NOTE</p>
              <blockquote className="mt-5 text-xl font-medium leading-8 tracking-[-0.02em] text-slate-950 sm:text-2xl sm:leading-9">
                “I built this site because I kept missing events I wanted to attend, not through lack of interest, but because no one could see what was already in the diary. One shared calendar changes that.”
              </blockquote>
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-900">Mike LaCorte</p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Founder, Investigator Events | CEO, Conflict International | President, Association of British Investigators | Secretary General, IKD
                </p>
              </div>
              <Link
                href="/about"
                className="mt-6 inline-flex items-center text-sm font-semibold text-blue-700 transition-colors hover:text-slate-950"
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
