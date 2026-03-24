import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

export function CTASection() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="container-shell">
        <Reveal>
          <div className="global-panel p-6 sm:p-6 lg:p-6">
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
