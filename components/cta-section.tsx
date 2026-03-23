import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

export function CTASection() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%,rgba(255,255,255,0.015))]" />
      <div className="container-shell">
        <Reveal>
          <div className="global-panel relative overflow-hidden p-8 sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_34%,rgba(255,255,255,0.015))]" />
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
