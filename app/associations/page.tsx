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
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-12 pt-28 sm:pb-20 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.06),transparent_35%)]" />

        <div className="container-shell relative">
          {/* Split: headline left, 3D marquee right */}
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600/75 sm:text-xs sm:tracking-[0.3em] sm:font-semibold sm:text-blue-600">Network</p>
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

      {/* ── Why join banner ── */}
      <div className="container-shell relative pt-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 px-6 py-5 sm:px-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Not a member of an association?</p>
              <p className="mt-0.5 text-xs text-slate-500">Discover why joining a professional investigation association can transform your career and credibility.</p>
            </div>
            <a href="/why-join-an-association" className="flex-shrink-0 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
              Learn why
            </a>
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
