'use client';

import { CalendarX, PlusCircle, Search } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { HolographicCard } from '@/components/ui/holographic-card';

const PANELS = [
  {
    title: 'Find Events Fast',
    description: 'See upcoming investigator events across the world in one place.',
    Icon: Search,
    gradient: 'from-blue-500 via-cyan-400 to-blue-600',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    iconShadow: 'shadow-[0_8px_30px_-6px_rgba(59,130,246,0.5)]',
  },
  {
    title: 'List for Free',
    description: 'Add your event in minutes and reach investigators, associations, and organisers worldwide.',
    Icon: PlusCircle,
    gradient: 'from-violet-500 via-purple-400 to-indigo-600',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    iconShadow: 'shadow-[0_8px_30px_-6px_rgba(124,58,237,0.5)]',
  },
  {
    title: 'Never Miss a Clash',
    description: 'Check what is already in the diary before you confirm your dates.',
    Icon: CalendarX,
    gradient: 'from-emerald-500 via-teal-400 to-cyan-500',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    iconShadow: 'shadow-[0_8px_30px_-6px_rgba(16,185,129,0.5)]',
  }
] as const;

export function WhyUseSection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-28">
      <div className="container-shell relative">
        <div className="app-mobile-shell">
          <Reveal>
            <div className="max-w-3xl">
              <p className="eyebrow">WHY USE THIS SITE</p>
              <h2 className="mt-2.5 text-[2rem] font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950 sm:mt-4 sm:text-5xl lg:text-[4.2rem]">
                A clearer way to plan the year ahead
              </h2>
            </div>
          </Reveal>

          <div className="mt-6 grid gap-4 sm:mt-14 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {PANELS.map(({ title, description, Icon, gradient, iconBg, iconShadow }, index) => (
              <Reveal key={title} delay={0.06 * index} y={24}>
                <HolographicCard className="rounded-[1.6rem] border border-white/70 bg-white/95 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.1)] sm:rounded-[2rem]">
                  {/* Gradient top border */}
                  <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${gradient} opacity-80 transition-opacity duration-300 group-hover:opacity-100`} />
                  {/* Glass highlight */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_40%,rgba(255,255,255,0.15)_60%,rgba(255,255,255,0)_100%)]" />
                  {/* Subtle radial glow on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:rounded-[2rem]" />

                  <div className="relative p-5 sm:p-8">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg} ${iconShadow} transition-transform duration-500 group-hover:scale-110 sm:h-14 sm:w-14`}>
                      <Icon className="h-6 w-6 text-white" strokeWidth={2} aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:mt-6 sm:text-2xl">
                      {title}
                    </h3>
                    <p className="mt-3 max-w-[34ch] text-[0.94rem] leading-relaxed text-slate-600 sm:mt-4">
                      {description}
                    </p>
                  </div>
                </HolographicCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
