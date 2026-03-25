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
    <section className="py-16 sm:py-20">
      <div className="container-shell">
        <div className="max-w-3xl">
          <p className="eyebrow">WHY USE THIS SITE</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-5xl">
            A clearer way to plan the year ahead
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {PANELS.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-blue-600">
                <Icon className="h-5 w-5" strokeWidth={2.05} aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                {title}
              </h3>
              <p className="mt-2.5 max-w-[32ch] text-sm leading-6 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
