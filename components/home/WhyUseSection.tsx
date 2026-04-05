'use client';

import { CalendarX, PlusCircle, Search } from 'lucide-react';

const PANELS = [
  {
    title: 'Find Events Fast',
    description: 'See upcoming investigator events across the world in one place.',
    Icon: Search,
    iconClassName: 'border-blue-100 bg-blue-50 text-blue-600 group-hover:border-blue-200'
  },
  {
    title: 'List for Free',
    description: 'Add your event in minutes and reach investigators, associations, and organisers worldwide.',
    Icon: PlusCircle,
    iconClassName: 'border-violet-100 bg-violet-50 text-violet-600 group-hover:border-violet-200'
  },
  {
    title: 'Never Miss a Clash',
    description: 'Check what is already in the diary before you confirm your dates.',
    Icon: CalendarX,
    iconClassName: 'border-emerald-100 bg-emerald-50 text-emerald-600 group-hover:border-emerald-200'
  }
] as const;

const ICON_DARK_RESPONSIVE_CLASSNAMES: Record<string, string> = {
  'border-blue-100 bg-blue-50 text-blue-600 group-hover:border-blue-200':
    'lg:border-blue-500/30 lg:bg-blue-500/15 lg:text-blue-400 lg:group-hover:border-blue-400/50',
  'border-violet-100 bg-violet-50 text-violet-600 group-hover:border-violet-200':
    'lg:border-violet-500/30 lg:bg-violet-500/15 lg:text-violet-400 lg:group-hover:border-violet-400/50',
  'border-emerald-100 bg-emerald-50 text-emerald-600 group-hover:border-emerald-200':
    'lg:border-emerald-500/30 lg:bg-emerald-500/15 lg:text-emerald-400 lg:group-hover:border-emerald-400/50',
};

export function WhyUseSection() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-20">
      {/* Subtle section transition from dark hero above */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,#f4f8ff,transparent)]" />
      <div className="container-shell relative">
        <div className="app-mobile-shell">
        <div className="max-w-3xl">
          <p className="eyebrow">WHY USE THIS SITE</p>
          <h2 className="mt-3 text-[2rem] font-semibold leading-[0.98] tracking-[-0.045em] text-slate-950 sm:mt-4 sm:text-5xl">
            A clearer way to plan the year ahead
          </h2>
        </div>

        <div className="mt-6 grid gap-3.5 sm:mt-10 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {PANELS.map(({ title, description, Icon, iconClassName }) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-[1.15rem] border border-slate-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(245,248,255,0.92))] p-3.5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.12)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_52px_-32px_rgba(15,23,42,0.16)] sm:rounded-[1.35rem] sm:p-5 lg:bg-[linear-gradient(145deg,#0d1525,#111e38)] lg:p-7 lg:shadow-[0_0_0_1px_rgba(99,102,241,0.12),0_28px_64px_-32px_rgba(0,0,40,0.7)] lg:hover:shadow-[0_0_0_1px_rgba(99,102,241,0.28),0_36px_80px_-30px_rgba(76,90,255,0.3)]"
            >
              <div className="absolute inset-x-0 top-0 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.6),rgba(56,189,248,0.55),rgba(236,72,153,0.3),transparent)] lg:block" />
              <div className={`flex h-10 w-10 items-center justify-center rounded-[0.8rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors duration-200 sm:h-11 sm:w-11 lg:h-14 lg:w-14 lg:rounded-[0.95rem] ${iconClassName} ${ICON_DARK_RESPONSIVE_CLASSNAMES[iconClassName] ?? ''}`}>
                <Icon className="h-6 w-6" strokeWidth={2.1} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-[1.1rem] font-semibold leading-[1.12] tracking-[-0.03em] text-slate-950 sm:text-[1.18rem] lg:mt-5 lg:text-[1.32rem] lg:tracking-[-0.035em] lg:text-white">
                {title}
              </h3>
              <p className="mt-2.5 max-w-[31ch] text-sm leading-6 text-slate-600 lg:mt-3 lg:text-slate-400">
                {description}
              </p>
            </article>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
