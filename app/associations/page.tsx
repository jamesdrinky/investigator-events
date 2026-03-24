import type { Metadata } from 'next';
import { AssociationsDirectory } from '@/components/associations/associations-directory';
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="container-shell relative">
        <Reveal>
          <header className="mb-6 overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_54%,#f4fbff_100%)] p-6 shadow-[0_34px_84px_-52px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="eyebrow">Associations</p>
                <h1 className="section-title">The organisations behind the calendar.</h1>
                <p className="section-copy max-w-3xl">
                  Browse investigator associations by region and country, then jump straight to the events each network is linked to.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-blue-700">Credible network</p>
                  <p className="mt-2 text-sm text-slate-700">Real associations, visible logos, direct links, and linked event counts.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-700">Browse faster</p>
                  <p className="mt-2 text-sm text-slate-700">Filter by region or country before opening the connected calendar view.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-700">Global signal</p>
                  <p className="mt-2 text-sm text-slate-700">The network view helps the platform feel international, not local or isolated.</p>
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
