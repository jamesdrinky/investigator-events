'use client';

import { CalendarX, PlusCircle, Search } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { HolographicCard } from '@/components/ui/holographic-card';
import { GlowCard } from '@/components/ui/gradient-card-showcase';

const PANELS = [
  {
    title: 'Find Events Fast',
    description: 'See upcoming investigator events across the world in one place.',
    Icon: Search,
    gradient: 'from-blue-500 via-cyan-400 to-blue-600',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    iconShadow: 'shadow-[0_8px_30px_-6px_rgba(59,130,246,0.5)]',
    glowFrom: '#3b82f6',
    glowTo: '#06b6d4',
  },
  {
    title: 'List for Free',
    description: 'Add your event in minutes and reach investigators, associations, and organisers worldwide.',
    Icon: PlusCircle,
    gradient: 'from-violet-500 via-purple-400 to-indigo-600',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    iconShadow: 'shadow-[0_8px_30px_-6px_rgba(124,58,237,0.5)]',
    glowFrom: '#8b5cf6',
    glowTo: '#ec4899',
  },
  {
    title: 'Never Miss a Clash',
    description: 'Check what is already in the diary before you confirm your dates.',
    Icon: CalendarX,
    gradient: 'from-emerald-500 via-teal-400 to-cyan-500',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    iconShadow: 'shadow-[0_8px_30px_-6px_rgba(16,185,129,0.5)]',
    glowFrom: '#10b981',
    glowTo: '#06b6d4',
  }
] as const;

export function WhyUseSection() {
  return (
    <section className="relative overflow-hidden">
      {/* ── Mobile: dark background with glow cards ── */}
      <div className="block sm:hidden">
        <div className="bg-[linear-gradient(165deg,#06091a_0%,#0a1228_35%,#0d1840_60%,#0a1228_100%)] px-6 py-20">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400">
                WHY USE THIS SITE
              </p>
              <h2 className="mt-4 text-[2.4rem] font-semibold leading-[0.94] tracking-[-0.05em] text-white">
                A clearer way to plan the year ahead
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6">
            {PANELS.map(({ title, description, Icon, iconBg, iconShadow, glowFrom, glowTo }, index) => (
              <Reveal key={title} delay={0.06 * index} y={24}>
                <GlowCard
                  title={title}
                  description={description}
                  gradientFrom={glowFrom}
                  gradientTo={glowTo}
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${iconShadow}`}>
                    <Icon className="h-5 w-5 text-white" strokeWidth={2} aria-hidden="true" />
                  </div>
                </GlowCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop: original holographic cards on light bg ── */}
      <div className="hidden py-28 sm:block">
        <div className="container-shell relative">
          <div className="app-mobile-shell">
            <Reveal>
              <div className="max-w-3xl">
                <p className="eyebrow">WHY USE THIS SITE</p>
                <h2 className="mt-4 text-5xl font-semibold leading-[0.94] tracking-[-0.05em] text-slate-950 lg:text-[4.2rem]">
                  A clearer way to plan the year ahead
                </h2>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {PANELS.map(({ title, description, Icon, gradient, iconBg, iconShadow }, index) => (
                <Reveal key={title} delay={0.06 * index} y={24}>
                  <HolographicCard className="rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.1)]">
                    {/* Gradient top border */}
                    <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${gradient} opacity-80 transition-opacity duration-300 group-hover:opacity-100`} />
                    {/* Glass highlight */}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_40%,rgba(255,255,255,0.15)_60%,rgba(255,255,255,0)_100%)]" />
                    {/* Subtle radial glow on hover */}
                    <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative p-8">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg} ${iconShadow} transition-transform duration-500 group-hover:scale-110`}>
                        <Icon className="h-6 w-6 text-white" strokeWidth={2} aria-hidden="true" />
                      </div>
                      <h3 className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.03em] text-slate-950">
                        {title}
                      </h3>
                      <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-slate-600">
                        {description}
                      </p>
                    </div>
                  </HolographicCard>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
