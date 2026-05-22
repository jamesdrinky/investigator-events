'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Calendar, MapPin } from 'lucide-react';
import type { EventItem } from '@/lib/data/events';

interface MobileHeroProps {
  events: EventItem[];
  stats: Array<{ label: string; value: string | number }>;
}

/**
 * Mobile-only hero. Desktop keeps the globe via HomepageHero.
 * This is a completely different layout — no globe, no D3, just clean
 * premium typography + a featured event card peek + stats strip.
 */
export function MobileHero({ events, stats }: MobileHeroProps) {
  const featured = events[0];

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 pb-8 pt-8 sm:hidden">
      {/* Premium aurora backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.4),transparent_55%)] blur-3xl" />
        <div className="absolute top-1/3 right-0 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.32),transparent_60%)] blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.22),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="container-shell relative">
        {/* Animated chip */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">Investigator events calendar</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-center text-[2.5rem] font-extrabold leading-[0.96] tracking-[-0.04em] text-white">
          Never miss another{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
              investigator event
            </span>
            <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-300 opacity-50 blur-sm" />
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-md text-center text-[15px] leading-relaxed text-white/65">
          The global home of private investigators. Discover conferences, connect with verified peers, and stay ahead.
        </p>

        {/* CTAs */}
        <div className="mt-6 flex flex-col items-stretch gap-3">
          <Link
            href="/signup"
            className="group relative inline-flex min-h-[3.25rem] items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-violet-600 px-7 py-4 text-sm font-bold text-white shadow-[0_20px_50px_-15px_rgba(59,130,246,0.65)] transition active:scale-[0.98]"
          >
            <span className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            Create your profile
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/calendar"
            className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full border border-white/20 bg-white/[0.03] px-7 py-4 text-sm font-semibold text-white/90 backdrop-blur-sm transition active:scale-[0.98]"
          >
            Browse events
          </Link>
        </div>

        <p className="mt-4 text-center text-[11px] font-medium text-white/45">
          100+ investigators · 19 countries · Verified community
        </p>

        {/* Stats strip — tight 3-column */}
        <div className="mt-7 grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center backdrop-blur-sm">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">{stat.label}</p>
              <p className="mt-1 text-2xl font-extrabold leading-none text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Featured event preview card */}
        {featured && (
          <div className="mt-8">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Featured this week</p>
            <Link
              href={`/events/${(featured as any).slug ?? ''}`}
              className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.6)] backdrop-blur-sm active:scale-[0.99]"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                {featured.coverImage && (
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
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
                  <h3 className="mt-2.5 text-lg font-bold leading-tight text-white">{featured.title}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-white/70">
                    <Calendar className="h-3 w-3" />
                    <span>{featured.date}</span>
                    <span className="mx-1 opacity-50">·</span>
                    <MapPin className="h-3 w-3" />
                    <span>{featured.city}, {featured.country}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
