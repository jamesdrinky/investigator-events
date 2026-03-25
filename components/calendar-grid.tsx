import { AssociationLogoBadge } from '@/components/association-logo-badge';
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

function getCategoryTone(category: string) {
  const label = category.toLowerCase();

  if (label.includes('training')) {
    return {
      dot: 'bg-violet-500',
      chip: 'border-violet-200/80 bg-violet-50 text-violet-700'
    };
  }

  if (label.includes('agm') || label.includes('meeting')) {
    return {
      dot: 'bg-[#FF2DA6]',
      chip: 'border-fuchsia-200/80 bg-white text-fuchsia-700'
    };
  }

  return {
    dot: 'bg-sky-500',
    chip: 'border-sky-200/80 bg-sky-50 text-sky-700'
  };
}

function getDensityLevel(count: number) {
  if (count >= 3) return 'high';
  if (count === 2) return 'medium';
  if (count === 1) return 'low';
  return 'none';
}

export function CalendarGrid({ events, monthKey, selectedDate, onSelectDate }: CalendarGridProps) {
  const [year, month] = monthKey.split('-').map(Number);
  const weeks = buildWeekCells(year, month);
  const desktopCells = weeks.map((week) =>
    week.map((cell) => ({
      ...cell,
      dayEvents: cell.inMonth ? getEventsForDate(events, cell.iso) : []
    }))
  );
  const mobileDays = weeks
    .flat()
    .filter((cell) => cell.inMonth)
    .map((cell) => ({
      ...cell,
      dayEvents: getEventsForDate(events, cell.iso)
    }))
    .filter((cell) => cell.dayEvents.length > 0);

  return (
    <section
      aria-label="Calendar month overview"
      className="rounded-[1.25rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-3 shadow-[0_20px_46px_-34px_rgba(15,23,42,0.14)] sm:p-4"
    >
      <div className="mb-4 hidden items-center justify-between rounded-[1.05rem] border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.12)] md:flex">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Month activity</p>
          <p className="mt-1 text-sm text-slate-600">Premium monthly view with density signals, ownership markers, and overlap visibility.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Active
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-violet-700">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            Training
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-200 bg-white px-2.5 py-1 text-fuchsia-700">
            <span className="h-2 w-2 rounded-full bg-[#FF2DA6]" />
            Meetings
          </span>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {mobileDays.length > 0 ? (
          mobileDays.map((cell) => {
            const leadEvent = getLeadEvent(cell.dayEvents);
            const today = isToday(cell.iso);
            const selected = cell.iso === selectedDate;
            const tone = leadEvent ? getCategoryTone(leadEvent.category) : getCategoryTone('conference');

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => onSelectDate(cell.iso)}
                className={`relative w-full overflow-hidden rounded-[1.1rem] border px-4 py-4 text-left transition ${
                  selected
                    ? 'border-sky-300 bg-[linear-gradient(135deg,rgba(239,246,255,1),rgba(245,243,255,0.96))] shadow-[0_16px_34px_-24px_rgba(14,165,233,0.26)]'
                    : today
                      ? 'border-slate-900 bg-slate-950 text-white'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${today && !selected ? 'text-white/65' : 'text-slate-500'}`}>
                      {cell.date.toLocaleString('en-GB', { weekday: 'short', timeZone: 'UTC' })}
                    </p>
                    <p className={`mt-1 text-2xl font-semibold tracking-[-0.04em] ${today && !selected ? 'text-white' : 'text-slate-950'}`}>
                      {cell.day}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      today && !selected ? 'bg-white/12 text-white' : 'border border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {cell.dayEvents.length} events
                  </span>
                </div>

                {leadEvent ? (
                  <div className="relative mt-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                          today && !selected ? 'border-white/15 bg-white/10 text-white' : tone.chip
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${today && !selected ? 'bg-white' : tone.dot}`} />
                        {leadEvent.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                          today && !selected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {leadEvent.region}
                      </span>
                    </div>

                    <AssociationLogoBadge
                      associationName={leadEvent.association ?? leadEvent.organiser}
                      compact
                      tone={today && !selected ? 'dark' : 'light'}
                      className="max-w-full"
                    />

                    <p
                      className={`text-sm font-semibold leading-snug ${today && !selected ? 'text-white' : 'text-slate-950'}`}
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {leadEvent.title}
                    </p>
                    <p className={`text-xs ${today && !selected ? 'text-white/70' : 'text-slate-600'}`}>
                      {leadEvent.city}, {leadEvent.country}
                    </p>
                    {cell.dayEvents.length > 1 ? (
                      <p className={`text-xs font-medium ${today && !selected ? 'text-white/70' : 'text-slate-600'}`}>
                        +{cell.dayEvents.length - 1} more active that day
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </button>
            );
          })
        ) : (
          <div className="rounded-[1rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            No active days in this month.
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[54rem] space-y-3">
          <div className="grid grid-cols-7 gap-2.5">
            {weekDays.map((day) => (
              <div key={day} className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {day}
              </div>
            ))}
          </div>

          {desktopCells.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-2.5">
              {week.map((cell, dayIndex) => {
                const dayEvents = cell.dayEvents;
                const leadEvent = getLeadEvent(dayEvents);
                const selected = cell.iso === selectedDate;
                const hasEvents = dayEvents.length > 0;
                const today = cell.inMonth && isToday(cell.iso);
                const tone = leadEvent ? getCategoryTone(leadEvent.category) : getCategoryTone('conference');
                const density = getDensityLevel(dayEvents.length);

                return (
                  <button
                    key={`${weekIndex}-${dayIndex}`}
                    type="button"
                    disabled={!cell.inMonth}
                    onClick={() => cell.inMonth && onSelectDate(cell.iso)}
                    className={`relative min-h-[8.9rem] overflow-hidden rounded-[1.05rem] border px-3.5 py-3.5 text-left transition duration-200 ${
                      !cell.inMonth
                        ? 'cursor-default border-slate-100 bg-slate-50/70 text-slate-300'
                        : selected
                          ? 'border-sky-300 bg-[linear-gradient(180deg,rgba(239,246,255,1),rgba(248,250,255,0.98))] shadow-[0_20px_44px_-28px_rgba(37,99,235,0.22)]'
                          : today
                            ? hasEvents
                              ? 'border-slate-950 bg-slate-950 text-white shadow-[0_24px_48px_-30px_rgba(15,23,42,0.42)]'
                              : 'border-slate-300 bg-slate-100'
                            : hasEvents
                              ? 'border-slate-200 bg-white shadow-[0_16px_34px_-28px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_24px_46px_-30px_rgba(37,99,235,0.18)]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_14px_24px_-24px_rgba(15,23,42,0.12)]'
                    }`}
                  >
                    {hasEvents && cell.inMonth ? (
                      <div
                        className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${
                          density === 'high'
                            ? 'bg-[linear-gradient(90deg,#2563EB,#7C3AED,#FF2DA6)]'
                            : density === 'medium'
                              ? 'bg-[linear-gradient(90deg,#2563EB,#7C3AED)]'
                              : 'bg-[#2563EB]'
                        }`}
                      />
                    ) : null}

                    {cell.inMonth ? (
                      <div className="flex h-full flex-col">
                        <div className="relative flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${
                                today && hasEvents && !selected ? 'text-white/65' : 'text-slate-600'
                              }`}
                            >
                              {weekDays[dayIndex]}
                            </p>
                            <p className={`mt-1 text-xl font-semibold leading-none tracking-[-0.04em] ${today && hasEvents && !selected ? 'text-white' : 'text-slate-950'}`}>
                              {cell.day}
                            </p>
                          </div>

                          {hasEvents ? (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                                today && hasEvents && !selected
                                  ? 'bg-white/12 text-white'
                                  : density === 'high'
                                    ? 'border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700'
                                    : 'border border-slate-200 bg-white text-slate-700'
                              }`}
                            >
                              {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                            </span>
                          ) : null}
                        </div>

                        {hasEvents ? (
                        <div className="relative mt-3 min-w-0 flex-1 space-y-2.5">
                          {leadEvent ? (
                              <>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span
                                    className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                                      today && hasEvents && !selected ? 'border-white/15 bg-white/10 text-white' : tone.chip
                                    }`}
                                  >
                                    <span className={`h-1.5 w-1.5 rounded-full ${today && hasEvents && !selected ? 'bg-white' : tone.dot}`} />
                                    {leadEvent.category.slice(0, 12)}
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                                      today && hasEvents && !selected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {density === 'high' ? 'Hot date' : leadEvent.country.slice(0, 10)}
                                  </span>
                                </div>
                                <AssociationLogoBadge
                                  associationName={leadEvent.association ?? leadEvent.organiser}
                                  mini
                                  overlay
                                  tone={today && hasEvents && !selected ? 'dark' : 'light'}
                                />
                              </>
                            ) : null}

                            <p
                              className={`line-clamp-2 text-[11px] font-semibold leading-[1.35] ${
                                today && hasEvents && !selected ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {leadEvent?.title}
                            </p>
                            <div className="mt-auto space-y-1">
                              <p className={`truncate text-[10px] font-medium ${today && hasEvents && !selected ? 'text-white/72' : 'text-slate-500'}`}>
                                {leadEvent?.city}, {leadEvent?.country}
                              </p>
                              {dayEvents.length > 1 ? (
                                <p
                                  className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                                    today && hasEvents && !selected ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  +{dayEvents.length - 1} more on this date
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
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
