import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

interface FinalConversionCTAProps {
  totalMembers: number;
  countriesCount: number;
}

export function FinalConversionCTA({ totalMembers, countriesCount }: FinalConversionCTAProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 sm:py-24">
      {/* Ambient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.3),transparent_55%)] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.2),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="container-shell relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">Join free</span>
            </div>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Ready to join{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                {totalMembers}+ investigators
              </span>
              ?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
              Create your free profile in 2 minutes. Browse events. Verify membership. Connect with peers across {countriesCount} countries.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
              <Link
                href="/signup"
                className="group relative inline-flex min-h-[3.25rem] items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-violet-600 px-8 py-4 text-sm font-bold text-white shadow-[0_20px_50px_-15px_rgba(59,130,246,0.65)] transition active:scale-[0.98] sm:text-base"
              >
                <span className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                Create my free profile
                <span className="ml-2 transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/calendar"
                className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full border border-white/20 px-8 py-4 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:bg-white/5 sm:text-base"
              >
                Browse events first
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium text-white/50 sm:text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                Free forever
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                No credit card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                Sign in with Apple or LinkedIn
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
