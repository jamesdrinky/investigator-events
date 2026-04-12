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
                <p className="eyebrow">Associations</p>
                <h1 className="mt-4 text-[2.5rem] font-bold leading-[0.9] tracking-[-0.06em] text-slate-950 sm:text-[3.5rem] lg:text-[5rem]">
                  The investigator associations behind the calendar.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:mt-6 sm:text-lg">
                  Browse associations by region and country, then open the calendar view for the events each organisation is linked to.
                </p>
              </div>
            </Reveal>

            {/* 3D perspective marquee — desktop only */}
            <AssociationLogoMarquee items={marqueeItems} />
          </div>

          {/* Stats row */}
          <Reveal delay={0.06}>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-4 sm:gap-4">
              {[
                { label: 'Associations', value: stats.associationCount, color: 'text-blue-600' },
                { label: 'Countries', value: stats.countryCount, color: 'text-violet-600' },
                { label: 'Regions', value: stats.regionCount, color: 'text-cyan-600' },
                { label: 'Linked Live', value: stats.liveCoverageAssociations, color: 'text-emerald-600' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/80 bg-white/90 px-4 py-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] sm:px-5 sm:py-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-[11px]">{item.label}</p>
                  <p className={`mt-2 text-[2.2rem] font-bold tracking-[-0.04em] sm:text-[3rem] ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Directory ── */}
      <div className="container-shell relative py-10 sm:py-16">
        <AssociationsDirectory associations={associations} stats={stats} />
      </div>
    </section>
  );
}
