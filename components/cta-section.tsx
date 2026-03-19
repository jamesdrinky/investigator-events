import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

export function CTASection() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(54,168,255,0.12),transparent_22%),radial-gradient(circle_at_82%_68%,rgba(255,104,203,0.08),transparent_18%)]" />
      <div className="container-shell">
        <Reveal>
          <div className="global-panel relative overflow-hidden p-8 sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(54,168,255,0.2),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(255,104,203,0.1),transparent_32%),radial-gradient(circle_at_56%_52%,rgba(29,214,202,0.08),transparent_28%)]" />
            <div className="map-sweep pointer-events-none absolute inset-y-0 left-[-22%] w-[46%] bg-[linear-gradient(90deg,transparent,rgba(215,238,255,0.16),transparent)] blur-xl" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">Submit Event</p>
                <h2 className="section-title">Add a conference, training event, or association meeting to the world map</h2>
                <p className="section-copy">
                  Organisers can send listings into review so they appear inside the live international network rather than
                  sitting in a static directory.
                </p>
              </div>

              <Link href="/submit-event" className="btn-primary">
                Submit an Event
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
