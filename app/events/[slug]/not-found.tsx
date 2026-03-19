import Link from 'next/link';
import { PageAtmosphere } from '@/components/global/page-atmosphere';

export default function EventNotFound() {
  return (
    <section className="section-pad relative overflow-hidden">
      <PageAtmosphere />
      <div className="container-shell">
        <div className="lux-panel mx-auto max-w-2xl p-8 text-center sm:p-10">
          <p className="eyebrow">Event Detail</p>
          <h1 className="section-title">No event found</h1>
          <p className="section-copy">
            This event is not available in the live database or has not been approved for public listing.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/calendar" className="btn-primary px-5 py-2.5">
              Return to Calendar
            </Link>
            <Link href="/submit-event" className="btn-secondary px-5 py-2.5">
              Submit an Event
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
