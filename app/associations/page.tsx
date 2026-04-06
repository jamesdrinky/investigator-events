import type { Metadata } from 'next';
import { AssociationsDirectory } from '@/components/associations/associations-directory';
import { AssociationFeatureCards } from '@/components/associations/association-feature-cards';
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
      <div className="pointer-events-none absolute left-[6%] top-[10%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(22,104,255,0.12),transparent_72%)] blur-3xl" />
      <div className="container-shell relative">
        <Reveal>
          <header className="mb-6 overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_54%,#f4fbff_100%)] p-6 shadow-[0_34px_84px_-52px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_28%,rgba(255,255,255,0.1)_56%,rgba(255,255,255,0)_100%)]" />
            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="eyebrow">Associations</p>
                <h1 className="section-title">Investigator associations linked to live events.</h1>
                <p className="section-copy max-w-3xl">
                  Browse associations by region and country, then open the calendar view for the events each organisation is linked to.
                </p>
              </div>

              <AssociationFeatureCards />
            </div>
          </header>
        </Reveal>

        <AssociationsDirectory associations={associations} stats={stats} />
      </div>
    </section>
  );
}
