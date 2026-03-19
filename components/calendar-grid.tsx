import { CalendarEventBlock } from '@/components/calendar-event-block';
import type { EventItem } from '@/lib/data/events';
import { parseDate } from '@/lib/utils/date';

interface CalendarGridProps {
  events: EventItem[];
  monthKey: string;
  onSelectEvent: (event: EventItem) => void;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarGrid({ events, monthKey, onSelectEvent }: CalendarGridProps) {
  const [year, month] = monthKey.split('-').map(Number);
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const startsOn = (firstOfMonth.getUTCDay() + 6) % 7;
  const cells = Array.from({ length: startsOn + daysInMonth }, (_, index) => index - startsOn + 1);

  const eventsByDay = events.reduce<Record<number, EventItem[]>>((acc, event) => {
    const start = parseDate(event.date);
    const end = event.endDate ? parseDate(event.endDate) : start;

    for (let time = start.getTime(); time <= end.getTime(); time += 24 * 60 * 60 * 1000) {
      const current = new Date(time);

      if (current.getUTCFullYear() !== year || current.getUTCMonth() !== month - 1) {
        continue;
      }

      const day = current.getUTCDate();
      acc[day] = acc[day] ? [...acc[day], event] : [event];
    }

    return acc;
  }, {});

  return (
    <section className="global-panel overflow-hidden" aria-label="Calendar month view">
      <div className="grid grid-cols-7 border-b border-white/10 bg-[linear-gradient(180deg,rgba(77,163,255,0.14),rgba(255,255,255,0.04),rgba(52,211,153,0.08))]">
        {weekDays.map((day) => (
          <div key={day} className="px-2 py-3 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const inMonth = day > 0;
          const dayEvents = inMonth ? eventsByDay[day] ?? [] : [];

          return (
            <div
              key={`${day}-${idx}`}
              className="min-h-[8.6rem] border-b border-r border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.005))] p-1.5 sm:min-h-[10.5rem] sm:p-2"
            >
              {inMonth && (
                <>
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <p className="text-xs text-slate-400">{day}</p>
                    {dayEvents.length > 0 ? <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{dayEvents.length} live</p> : null}
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents
                      .sort((a, b) => Number(b.featured) - Number(a.featured) || Number(Boolean(b.endDate)) - Number(Boolean(a.endDate)))
                      .slice(0, 3)
                      .map((event, eventIndex) => (
                        <CalendarEventBlock
                          key={`${event.id}-${eventIndex}`}
                          event={event}
                          compact={eventIndex > 0 && !event.featured}
                          onSelect={onSelectEvent}
                        />
                      ))}
                    {dayEvents.length > 3 && (
                      <p className="px-1 text-[11px] uppercase tracking-[0.14em] text-slate-500">+{dayEvents.length - 3} more events</p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
