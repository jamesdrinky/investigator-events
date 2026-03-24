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
      <div className="container-shell">
        <Reveal>
          <header className="mb-6 relative overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.1),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(139,92,246,0.08),transparent_24%),radial-gradient(circle_at_62%_84%,rgba(34,197,94,0.07),transparent_24%)]" />
            <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="eyebrow">Associations</p>
                <h1 className="section-title">A global network of investigator associations and professional bodies</h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                  Browse the organisations behind the events, grouped by region and country so the network feels branded,
                  connected, and easy to understand.
                </p>
              </div>

              <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-sky-700">Platform read</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700">Global</p>
                    <p className="mt-1 text-sm text-slate-700">Country and region-led network view</p>
                  </div>
                  <div className="rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-violet-700">Credible</p>
                    <p className="mt-1 text-sm text-slate-700">Real associations with branded identity</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-700">Connected</p>
                    <p className="mt-1 text-sm text-slate-700">Direct paths to sites and linked events</p>
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
