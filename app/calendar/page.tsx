import { CalendarView } from '@/components/calendar-view';
import { Reveal } from '@/components/motion/reveal';
import { fetchAllEvents } from '@/lib/data/events';

export const dynamic = 'force-dynamic';

export default async function CalendarPage({
  searchParams
}: {
  searchParams?: { association?: string; search?: string; region?: string; month?: string };
}) {
  const events = await fetchAllEvents();
  const initialAssociation = searchParams?.association ? decodeURIComponent(searchParams.association) : undefined;
  const initialSearch = searchParams?.search ? decodeURIComponent(searchParams.search) : undefined;
  const initialRegion = searchParams?.region ? decodeURIComponent(searchParams.region) : undefined;
  const initialMonth = searchParams?.month ? decodeURIComponent(searchParams.month) : undefined;

  return (
    <section className="section-pad relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(37,99,235,0.1),transparent_22%),radial-gradient(circle_at_86%_8%,rgba(124,58,237,0.1),transparent_20%)]" />
      <div className="container-shell relative">
        <Reveal>
          <header className="mb-6 border-b border-slate-200/90 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Events</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">Events</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
              Discover upcoming investigator conferences, training sessions, and association events, then use the calendar to plan around them.
            </p>
          </header>
        </Reveal>

        <CalendarView
          events={events}
          initialAssociation={initialAssociation}
          initialSearch={initialSearch}
          initialRegion={initialRegion}
          initialMonth={initialMonth}
        />
      </div>
    </section>
  );
}
