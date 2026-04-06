'use client';

import { CalendarX, PlusCircle, Search } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { GlowCard } from '@/components/ui/gradient-card-showcase';

const PANELS = [
  {
    title: 'Find Events Fast',
    description: 'See upcoming investigator events across the world in one place.',
    Icon: Search,
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    iconShadow: 'shadow-[0_8px_30px_-6px_rgba(59,130,246,0.5)]',
    glowFrom: '#3b82f6',
    glowTo: '#06b6d4',
  },
  {
    title: 'List for Free',
    description: 'Add your event in minutes and reach investigators, associations, and organisers worldwide.',
    Icon: PlusCircle,
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    iconShadow: 'shadow-[0_8px_30px_-6px_rgba(124,58,237,0.5)]',
    glowFrom: '#8b5cf6',
    glowTo: '#ec4899',
  },
  {
    title: 'Never Miss a Clash',
    description: 'Check what is already in the diary before you confirm your dates.',
    Icon: CalendarX,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    iconShadow: 'shadow-[0_8px_30px_-6px_rgba(16,185,129,0.5)]',
    glowFrom: '#10b981',
    glowTo: '#06b6d4',
  },
] as const;

export function WhyUseSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-[linear-gradient(165deg,#06091a_0%,#0a1228_35%,#0d1840_60%,#0a1228_100%)] px-6 py-20 sm:py-28 lg:py-32">
        {/* Ambient glow accents */}
        <div className="pointer-events-none absolute left-[-5%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(ellipse,rgba(59,130,246,0.08),transparent_55%)]" />
        <div className="pointer-events-none absolute right-[-3%] bottom-[10%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(ellipse,rgba(236,72,153,0.06),transparent_55%)]" />

        <div className="container-shell relative">
          <div className="app-mobile-shell">
            <Reveal>
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400 sm:text-xs">
                  WHY USE THIS SITE
                </p>
                <h2 className="mt-4 text-[2.4rem] font-semibold leading-[0.94] tracking-[-0.05em] text-white sm:text-5xl lg:text-[4.2rem]">
                  A clearer way to plan the year ahead
                </h2>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {PANELS.map(({ title, description, Icon, iconBg, iconShadow, glowFrom, glowTo }, index) => (
                <Reveal key={title} delay={0.06 * index} y={24}>
                  <GlowCard
                    title={title}
                    description={description}
                    gradientFrom={glowFrom}
                    gradientTo={glowTo}
                  >
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${iconShadow} transition-transform duration-500 group-hover:scale-110 sm:mb-6 sm:h-14 sm:w-14 sm:rounded-2xl`}>
                      <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2} aria-hidden="true" />
                    </div>
                  </GlowCard>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
