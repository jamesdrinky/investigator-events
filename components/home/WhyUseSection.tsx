'use client';

import { CalendarX, PlusCircle, Search } from 'lucide-react';

const PANELS = [
  {
    title: 'Find Events Fast',
    description: 'See upcoming investigator events across the world in one place.',
    Icon: Search
  },
  {
    title: 'List for Free',
    description: 'Add your event in minutes and reach investigators, associations, and organisers worldwide.',
    Icon: PlusCircle
  },
  {
    title: 'Never Miss a Clash',
    description: 'Check what is already in the diary before you confirm your dates.',
    Icon: CalendarX
  }
] as const;

export function WhyUseSection() {
  return (
    <section className="py-12 sm:py-20">
      <div className="container-shell">
        <div className="max-w-3xl">
          <p className="eyebrow">WHY USE THIS SITE</p>
          <h2 className="mt-3 text-[2rem] font-semibold leading-[0.98] tracking-[-0.045em] text-slate-950 sm:mt-4 sm:text-5xl">
            A clearer way to plan the year ahead
          </h2>
        </div>

        <div className="mt-7 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {PANELS.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="group relative rounded-[1.2rem] border border-slate-300/90 bg-white p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-sky-300 sm:rounded-[1.35rem] sm:p-7"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(37,99,235,0),rgba(37,99,235,0.16),rgba(124,58,237,0.14),rgba(37,99,235,0))]" />
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] border border-sky-100 bg-slate-50 text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-colors duration-200 group-hover:border-sky-200 sm:h-12 sm:w-12 sm:rounded-[0.95rem]">
                <Icon className="h-5 w-5" strokeWidth={2.1} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-[1.15rem] font-semibold leading-[1.08] tracking-[-0.03em] text-slate-950 sm:mt-5 sm:text-[1.32rem] sm:tracking-[-0.035em]">
                {title}
              </h3>
              <p className="mt-2.5 max-w-[31ch] text-sm leading-5 text-slate-600 sm:mt-3 sm:leading-6">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
