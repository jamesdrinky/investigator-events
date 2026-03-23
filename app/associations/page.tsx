import type { Metadata } from 'next';
import { AssociationsDirectory } from '@/components/associations/associations-directory';
import { PageAtmosphere } from '@/components/global/page-atmosphere';
import { Reveal } from '@/components/motion/reveal';
import { buildAssociationDirectory, getAssociationStats } from '@/lib/data/associations';
import { fetchAllEvents } from '@/lib/data/events';

export const metadata: Metadata = {
  title: 'Associations | Investigator Events',
  description: 'Professional investigator associations and industry bodies across the global Investigator Events network.'
};

export const dynamic = 'force-dynamic';

export default async function AssociationsPage() {
  const events = await fetchAllEvents();
  const associations = buildAssociationDirectory(events);
  const stats = getAssociationStats(associations);

  return (
    <section className="section-pad relative overflow-hidden">
      <PageAtmosphere />
      <div className="container-shell">
        <Reveal>
          <header className="mb-6 relative overflow-hidden rounded-[2.2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(20,55,96,0.9),rgba(13,25,41,0.94)_30%,rgba(73,38,133,0.86)_100%)] p-6 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(139,169,255,0.24),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(127,228,199,0.18),transparent_24%),radial-gradient(circle_at_62%_84%,rgba(255,176,50,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_36%,rgba(255,255,255,0.018))]" />
            <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="eyebrow">Associations</p>
                <h1 className="section-title">A global network of investigator associations and professional bodies</h1>
                <p className="section-copy mt-4 max-w-3xl">The page should read like a branded ecosystem, with stronger identity, logos, and region-led presence.</p>
              </div>

              <div className="surface-flat p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Platform read</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="surface-flat rounded-2xl px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Global</p>
                    <p className="mt-1 text-sm text-slate-300">Country and region-led network view</p>
                  </div>
                  <div className="surface-flat rounded-2xl px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Credible</p>
                    <p className="mt-1 text-sm text-slate-300">Real associations with branded identity</p>
                  </div>
                  <div className="surface-flat rounded-2xl px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Connected</p>
                    <p className="mt-1 text-sm text-slate-300">Direct paths to sites and linked events</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </Reveal>
        <AssociationsDirectory associations={associations} stats={stats} />
      </div>
    </section>
  );
}
