import Link from 'next/link';

const placements = [
  {
    title: 'Homepage visibility',
    text: 'Premium placement beside featured events, weekly updates, and association discovery.'
  },
  {
    title: 'Featured conference support',
    text: 'Give a major event or training series stronger visibility in the calendar and weekly brief.'
  },
  {
    title: 'Supplier spotlight',
    text: 'Relevant tools and services can appear in a cleaner, industry-specific partner area.'
  }
];

const partnerGroups = ['OSINT tools', 'Training providers', 'Investigative software', 'Industry suppliers', 'Professional services'];

export function HomePartnerVisibility() {
  return (
    <section className="section-pad relative overflow-hidden pt-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(54,168,255,0.08),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%,rgba(255,255,255,0.015))]" />
      <div className="container-shell">
        <div className="global-panel relative overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_34%,rgba(255,255,255,0.01))]" />
          <div className="relative grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div>
              <p className="eyebrow">Sponsors & Partners</p>
              <h2 className="section-title">Built to support sponsor visibility, supplier exposure, and promoted events</h2>
              <p className="section-copy max-w-xl">
                This platform is not only for browsing dates. It also gives associations, featured conferences, sponsors,
                and relevant suppliers a credible place to appear in front of the investigator industry.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {partnerGroups.map((group) => (
                  <span key={group} className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200">
                    {group}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/advertise" className="btn-primary px-5 py-2.5">
                  View Partner Options
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {placements.map((placement) => (
                <article key={placement.title} className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{placement.title}</p>
                  <p className="mt-3 text-base text-white">{placement.text}</p>
                </article>
              ))}
              <article className="rounded-[1.35rem] border border-emerald-300/16 bg-[linear-gradient(180deg,rgba(41,211,163,0.08),rgba(255,255,255,0.02))] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">Phase 1 structure</p>
                <p className="mt-3 text-base text-white">
                  Associations page visibility, featured event treatment, weekly brief mentions, and advertiser inquiry
                  flow are already part of the product foundation.
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
