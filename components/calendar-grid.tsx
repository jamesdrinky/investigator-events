import type { EventItem } from '@/lib/data/events';
import { parseDate } from '@/lib/utils/date';

interface CalendarGridProps {
  events: EventItem[];
  monthKey: string;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayMs = 24 * 60 * 60 * 1000;

interface WeekCell {
  day: number | null;
  date: Date;
  iso: string;
  inMonth: boolean;
}

function buildWeekCells(year: number, month: number): WeekCell[][] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const startsOn = (firstOfMonth.getUTCDay() + 6) % 7;
  const gridStart = new Date(Date.UTC(year, month - 1, 1 - startsOn));
  const weeks: WeekCell[][] = [];

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week: WeekCell[] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const current = new Date(gridStart.getTime() + (weekIndex * 7 + dayIndex) * dayMs);
      const inMonth = current.getUTCMonth() === month - 1;

      week.push({
        day: inMonth ? current.getUTCDate() : null,
        date: current,
        iso: current.toISOString().slice(0, 10),
        inMonth
      });
    }

    weeks.push(week);
  }

  return weeks;
}

function getEventsForDate(events: EventItem[], isoDate: string) {
  const current = parseDate(isoDate).getTime();

  return events.filter((event) => {
    const start = parseDate(event.date).getTime();
    const end = (event.endDate ? parseDate(event.endDate) : parseDate(event.date)).getTime();
    return start <= current && end >= current;
  });
}

function getLeadEvent(dayEvents: EventItem[]) {
  return [...dayEvents].sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }

    if (a.eventScope !== b.eventScope) {
      return a.eventScope === 'main' ? -1 : 1;
    }

    return a.title.localeCompare(b.title);
  })[0] ?? null;
}

function isToday(isoDate: string) {
  return isoDate === new Date().toISOString().slice(0, 10);
}

export function CalendarGrid({ events, monthKey, selectedDate, onSelectDate }: CalendarGridProps) {
  const [year, month] = monthKey.split('-').map(Number);
  const weeks = buildWeekCells(year, month);

  return (
    <section aria-label="Calendar month overview" className="rounded-[1rem] border border-slate-200 bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-4">
      <div className="overflow-x-auto">
        <div className="min-w-[42rem] space-y-2">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600"
              >
                {day}
              </div>
            ))}
          </div>

          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-2">
              {week.map((cell, dayIndex) => {
                const dayEvents = cell.inMonth ? getEventsForDate(events, cell.iso) : [];
                const leadEvent = getLeadEvent(dayEvents);
                const selected = cell.iso === selectedDate;
                const hasEvents = dayEvents.length > 0;
                const today = cell.inMonth && isToday(cell.iso);

                return (
                  <button
                    key={`${weekIndex}-${dayIndex}`}
                    type="button"
                    disabled={!cell.inMonth}
                    onClick={() => cell.inMonth && onSelectDate(cell.iso)}
                    className={`min-h-[5.6rem] rounded-[0.9rem] border px-2.5 py-2 text-left transition duration-150 sm:min-h-[6.4rem] ${
                      !cell.inMonth
                        ? 'cursor-default border-transparent bg-slate-50/70 text-slate-300'
                        : selected
                          ? 'border-sky-500 bg-sky-100 shadow-[0_14px_28px_-18px_rgba(14,165,233,0.5)]'
                          : today
                            ? hasEvents
                              ? 'border-sky-700 bg-sky-700 text-white shadow-[0_14px_28px_-18px_rgba(2,132,199,0.55)]'
                              : 'border-slate-900 bg-slate-100'
                            : hasEvents
                              ? 'border-sky-300 bg-sky-50 hover:border-sky-400 hover:bg-sky-100/80 hover:shadow-[0_12px_24px_-20px_rgba(14,165,233,0.4)]'
                              : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm'
                    }`}
                  >
                    {cell.inMonth ? (
                      <div className="flex h-full flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${
                                today && hasEvents && !selected ? 'text-sky-100' : 'text-slate-600'
                              }`}
                            >
                              {weekDays[dayIndex]}
                            </p>
                            <p className={`mt-1 text-lg font-semibold leading-none ${today && hasEvents && !selected ? 'text-white' : 'text-slate-950'}`}>
                              {cell.day}
                            </p>
                          </div>

                          {hasEvents ? (
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                                today && hasEvents && !selected
                                  ? 'bg-white/16 text-white'
                                  : 'border border-sky-300 bg-white text-sky-700'
                              }`}
                            >
                              {dayEvents.length}
                            </span>
                          ) : null}
                        </div>

                        {hasEvents ? (
                          <div className="mt-2 min-w-0">
                            <p
                              className={`truncate text-[11px] font-medium ${
                                today && hasEvents && !selected ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {leadEvent?.title}
                            </p>
                            {dayEvents.length > 1 ? (
                              <p className={`mt-1 text-[10px] ${today && hasEvents && !selected ? 'text-sky-100' : 'text-slate-600'}`}>
                                +{dayEvents.length - 1} events
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <div className="mt-auto" />
                        )}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
