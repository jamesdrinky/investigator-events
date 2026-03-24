import Link from 'next/link';

export default function EventNotFound() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="container-shell">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <p className="eyebrow">Event Detail</p>
          <h1 className="section-title">No event found</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
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
