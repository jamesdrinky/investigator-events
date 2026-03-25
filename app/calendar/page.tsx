import { CalendarView } from '@/components/calendar-view';
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
    <section className="section-pad relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_38%,#ffffff_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(37,99,235,0.1),transparent_18%),radial-gradient(circle_at_84%_6%,rgba(124,58,237,0.08),transparent_16%)]" />
      <div className="container-shell relative">
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
