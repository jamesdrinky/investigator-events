import { Calendar, Users, Zap, MessageSquare, Briefcase, Landmark } from 'lucide-react';

interface Feature {
  icon: typeof Calendar;
  label: string;
  description: string;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    icon: Calendar,
    label: 'Events calendar',
    description: 'Every confirmed PI conference and training event in one place.',
    accent: 'text-blue-300 bg-blue-500/10 ring-blue-400/30',
  },
  {
    icon: Users,
    label: 'Network',
    description: 'Connect with verified investigators across 19 countries.',
    accent: 'text-violet-300 bg-violet-500/10 ring-violet-400/30',
  },
  {
    icon: Zap,
    label: 'Clash Checker',
    description: 'Compare any two events to see if their dates overlap.',
    accent: 'text-amber-300 bg-amber-500/10 ring-amber-400/30',
  },
  {
    icon: MessageSquare,
    label: 'Community forum',
    description: 'Discuss cases, share leads, ask peers for advice.',
    accent: 'text-emerald-300 bg-emerald-500/10 ring-emerald-400/30',
  },
  {
    icon: Briefcase,
    label: 'Jobs board',
    description: 'Investigation contracts and full-time roles worldwide.',
    accent: 'text-cyan-300 bg-cyan-500/10 ring-cyan-400/30',
  },
  {
    icon: Landmark,
    label: 'Associations',
    description: 'Browse the world’s leading PI and fraud examiner bodies.',
    accent: 'text-rose-300 bg-rose-500/10 ring-rose-400/30',
  },
];

export function WhatYouGet() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-12 sm:py-20">
      {/* Ambient backdrop — matches the rest of the design vocabulary */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.14),transparent_65%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
      </div>

      <div className="container-shell relative">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">Everything you get</span>
          </div>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            More than just a calendar.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
            The home of private investigators — discover events, connect with peers, and stay ahead.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm transition hover:border-white/15 hover:bg-white/[0.06] sm:p-5"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${feature.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-bold text-white sm:text-base">{feature.label}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/55 sm:text-xs">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
