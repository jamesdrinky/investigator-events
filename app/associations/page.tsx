import type { Metadata } from 'next';
import { AssociationsDirectory } from '@/components/associations/associations-directory';
import { AssociationLogoMarquee } from '@/components/associations/association-logo-marquee';
import { Reveal } from '@/components/motion/reveal';
import { buildAssociationDirectory, getAssociationStats } from '@/lib/data/associations';
import { fetchAllEvents } from '@/lib/data/events';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';

export const metadata: Metadata = {
  title: 'Associations | Investigator Events',
  description: 'Browse professional investigator associations and industry bodies. Find your association, see upcoming events, and verify your membership.'
};

export const dynamic = 'force-dynamic';

export default async function AssociationsPage() {
  const events = await fetchAllEvents();
  const associations = buildAssociationDirectory(events);

  // Check which associations have dedicated pages in the DB
  const supabase = await createSupabaseSSRServerClient();
  const { data: pages } = await supabase.from('association_pages' as any).select('slug');
  const pageSlugs = new Set((pages ?? []).map((p: any) => p.slug));
  associations.forEach((a) => { a.hasPage = pageSlugs.has(a.slug); });

  const stats = getAssociationStats(associations);

  const marqueeItems = associations.map((a) => ({
    slug: a.slug,
    shortName: a.shortName,
    logoSrc: a.logoSrc,
    country: a.country,
    eventCount: a.eventCount,
  }));

  return (
    <section className="relative overflow-hidden">
      {/* ── Hero — gradient orbs + dot grid for the futuristic vocabulary ── */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-12 pt-28 sm:pb-20 sm:pt-32">
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.20),transparent_65%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-1/4 -right-24 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.16),transparent_65%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.10),transparent_65%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

        <div className="container-shell relative">
          {/* Split: headline left, 3D marquee right */}
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600 backdrop-blur-sm sm:tracking-[0.3em]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)] animate-pulse" />
                  Network
                </span>
                <h1 className="mt-2 text-[2.25rem] font-bold leading-[0.92] tracking-[-0.05em] text-slate-950 sm:mt-4 sm:text-[3.5rem] lg:text-[5rem]">
                  The{' '}
                  <span
                    className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
                    style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
                  >
                    associations
                  </span>{' '}
                  behind the calendar.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-6 sm:text-lg">
                  Browse by region and country, then open the calendar view for the events each organisation is linked to.
                </p>
              </div>
            </Reveal>

            {/* 3D perspective marquee — desktop only */}
            <AssociationLogoMarquee items={marqueeItems} />
          </div>

          {/* Stats row — gradient values for a more dashboard feel */}
          <Reveal delay={0.06}>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-4 sm:gap-4">
              {[
                { label: 'Associations', value: stats.associationCount, color: 'from-blue-600 to-cyan-500' },
                { label: 'Countries', value: stats.countryCount, color: 'from-violet-600 to-fuchsia-500' },
                { label: 'Regions', value: stats.regionCount, color: 'from-cyan-600 to-teal-500' },
                { label: 'Linked Live', value: stats.liveCoverageAssociations, color: 'from-emerald-600 to-green-500' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/80 bg-white/90 px-4 py-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] backdrop-blur-sm transition hover:border-white hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] sm:px-5 sm:py-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-[11px]">{item.label}</p>
                  <p className={`mt-2 bg-gradient-to-r ${item.color} bg-clip-text text-[2.2rem] font-bold tracking-[-0.04em] text-transparent sm:text-[3rem]`}>{item.value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Why join banner — dashboard-finisher styled ── */}
      <div className="container-shell relative pt-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 px-6 py-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.55)] sm:rounded-3xl sm:px-8 sm:py-7">
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300/80">Not a member yet?</p>
                <p className="mt-2 text-base font-bold leading-tight text-white sm:text-lg">Why joining an association matters.</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300/85">Credibility, premium pricing, referrals, and access to networks no open platform can replicate.</p>
              </div>
              <a href="/why-join-an-association" className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-950 shadow-[0_8px_20px_-8px_rgba(255,255,255,0.4)] transition active:scale-95">
                Learn why →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Directory ── */}
      <div className="container-shell relative py-10 sm:py-16">
        <AssociationsDirectory associations={associations} stats={stats} />
      </div>
    </section>
  );
}
