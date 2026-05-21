'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { EventItem } from '@/lib/data/events';

interface HomepageHeroProps {
  events: EventItem[];
  stats: Array<{ label: string; value: string | number }>;
}

/**
 * Premium hero — refined for v2.
 * - Dropped the heavy D3 globe (rendered poorly on iOS WebView, slowed first paint)
 * - Floating event preview card on the right (desktop) gives the same "global" feel
 *   without 200kb of geo data + canvas rendering
 * - Tighter typography stack, more sophisticated gradients, animated chip
 */
export function HomepageHero({ events, stats }: HomepageHeroProps) {
  const heroEvent = events[0];

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 pb-12 pt-10 sm:pb-24 sm:pt-20">
      {/* Multi-layer aurora background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.35),transparent_55%)] blur-3xl" />
        <div className="absolute top-1/4 right-0 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.28),transparent_60%)] blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.2),transparent_60%)] blur-3xl" />
        {/* Fine dot grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        {/* Sweeping mesh sheen */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="container-shell relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          {/* Left: copy block */}
          <div className="relative text-center lg:text-left">
            {/* Animated chip */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">Private investigator network</span>
            </div>

            {/* Headline — display-class typography */}
            <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[0.94] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.5rem]">
              Never miss another{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                  investigator event
                </span>
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-300 opacity-50 blur-sm" />
              </span>
              .
            </h1>

            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/65 sm:text-lg lg:mx-0">
              The global home of private investigators. Discover conferences, connect with verified peers, and stay ahead.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-3 lg:justify-start">
              <Link
                href="/signup"
                className="group relative inline-flex min-h-[3.25rem] items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-violet-600 px-7 py-4 text-sm font-bold text-white shadow-[0_20px_50px_-15px_rgba(59,130,246,0.65)] transition active:scale-[0.98] sm:text-base"
              >
                <span className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                Create your profile
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/calendar"
                className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full border border-white/20 bg-white/[0.03] px-7 py-4 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/[0.07] sm:text-base"
              >
                Browse events
              </Link>
            </div>

            {/* Trust microcopy */}
            <p className="mt-5 text-[11px] font-medium text-white/45 sm:text-xs">
              100+ investigators · 19 countries · Verified community
            </p>

            {/* Stats strip */}
            <div className="mt-8 grid max-w-md grid-cols-3 gap-2 sm:gap-3 lg:max-w-none lg:mx-0">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/50 sm:text-[10px]">{stat.label}</p>
                  <p className="mt-1 text-2xl font-extrabold leading-none text-white sm:text-3xl">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating preview card stack — desktop only */}
          {heroEvent && (
            <div className="relative hidden lg:block">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
                {/* Glow halo behind cards */}
                <div className="absolute inset-0 -m-4 rounded-[3rem] bg-gradient-to-br from-blue-500/30 via-violet-500/20 to-cyan-500/20 blur-3xl" />

                {/* Back card #2 — most subtle */}
                {events[2] && (
                  <div className="absolute right-0 top-12 h-[88%] w-[88%] -rotate-3 transform rounded-[1.8rem] border border-white/10 bg-slate-900/70 shadow-2xl backdrop-blur-md">
                    <div className="relative h-full w-full overflow-hidden rounded-[1.8rem]">
                      {events[2].coverImage && (
                        <Image
                          src={events[2].coverImage}
                          alt=""
                          fill
                          className="object-cover opacity-30"
                          sizes="300px"
                          unoptimized
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Back card #1 */}
                {events[1] && (
                  <div className="absolute right-4 top-6 h-[92%] w-[92%] rotate-2 transform rounded-[1.8rem] border border-white/15 bg-slate-900/85 shadow-2xl backdrop-blur-md">
                    <div className="relative h-full w-full overflow-hidden rounded-[1.8rem]">
                      {events[1].coverImage && (
                        <Image
                          src={events[1].coverImage}
                          alt=""
                          fill
                          className="object-cover opacity-50"
                          sizes="400px"
                          unoptimized
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    </div>
                  </div>
                )}

                {/* Front card — main event */}
                <div className="absolute inset-0 overflow-hidden rounded-[1.8rem] border border-white/20 bg-slate-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
                  {heroEvent.coverImage && (
                    <Image
                      src={heroEvent.coverImage}
                      alt={heroEvent.title}
                      fill
                      className="object-cover"
                      sizes="450px"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      <Sparkles className="h-3 w-3 text-amber-300" /> Featured
                    </span>
                    <h3 className="mt-3 text-xl font-bold leading-tight text-white">{heroEvent.title}</h3>
                    <p className="mt-1 text-xs text-white/70">{heroEvent.city}, {heroEvent.country}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile-only floating preview card peek below the fold */}
        {heroEvent && (
          <div className="mt-10 lg:hidden">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Featured this week</p>
            <Link
              href={`/events/${(heroEvent as any).slug ?? ''}`}
              className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.6)] backdrop-blur-sm"
            >
              <div className="relative aspect-[5/3] overflow-hidden">
                {heroEvent.coverImage && (
                  <Image
                    src={heroEvent.coverImage}
                    alt={heroEvent.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                    <Sparkles className="h-3 w-3 text-amber-300" /> Featured
                  </span>
                  <h3 className="mt-2.5 text-lg font-bold leading-tight text-white">{heroEvent.title}</h3>
                  <p className="mt-1 text-xs text-white/70">{heroEvent.city}, {heroEvent.country}</p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
