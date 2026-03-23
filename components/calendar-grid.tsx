import type { EventItem } from '@/lib/data/events';
import { parseDate } from '@/lib/utils/date';
import { getRegionPalette } from '@/lib/utils/location';

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

function formatWeekRange(week: WeekCell[]) {
  const inMonthCells = week.filter((cell) => cell.inMonth);

  if (inMonthCells.length === 0) {
    return '';
  }

  const first = inMonthCells[0];
  const last = inMonthCells[inMonthCells.length - 1];
  const firstLabel = first.date.toLocaleString('en-GB', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const lastLabel = last.date.toLocaleString('en-GB', { month: 'short', day: 'numeric', timeZone: 'UTC' });

  return `${firstLabel} - ${lastLabel}`;
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

function getDayTone(dayEvents: EventItem[], leadEvent: EventItem | null) {
  if (!dayEvents.length) {
    return 'idle';
  }

  if (leadEvent?.featured || leadEvent?.eventScope === 'main') {
    return 'major';
  }

  return 'active';
}

export function CalendarGrid({ events, monthKey, selectedDate, onSelectDate }: CalendarGridProps) {
  const [year, month] = monthKey.split('-').map(Number);
  const weeks = buildWeekCells(year, month);

  return (
    <section className="global-panel relative overflow-hidden p-5 sm:p-6" aria-label="Calendar month overview">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.022),transparent_18%,transparent_82%,rgba(255,255,255,0.012))]" />

      <div className="relative space-y-5">
        <div className="grid min-w-[66rem] grid-cols-[6.75rem_repeat(7,minmax(8rem,1fr))] gap-4 px-1">
          <div />
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="min-w-[66rem] space-y-5">
            {weeks.map((week, weekIndex) => {
              const weekEvents = week.flatMap((cell) => (cell.inMonth ? getEventsForDate(events, cell.iso) : []));
              const uniqueWeekEventIds = new Set(weekEvents.map((event) => event.id));
              const activeDayCount = week.filter((cell) => cell.inMonth && getEventsForDate(events, cell.iso).length > 0).length;

              return (
                <div
                  key={`week-${weekIndex}`}
                  className="grid grid-cols-[6.75rem_repeat(7,minmax(8rem,1fr))] gap-4 rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(10,16,27,0.96),rgba(6,10,18,0.98))] p-4 shadow-[0_26px_54px_-42px_rgba(2,6,23,0.95)]"
                >
                  <div className="flex min-h-[12.75rem] flex-col justify-between rounded-[1.35rem] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.012))] px-3 py-3.5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Week {weekIndex + 1}</p>
                      <p className="mt-2 text-sm font-medium text-slate-100">{formatWeekRange(week) || 'Outside month'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-300">
                        {activeDayCount} active day{activeDayCount === 1 ? '' : 's'}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        {uniqueWeekEventIds.size} live event{uniqueWeekEventIds.size === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  {week.map((cell, dayIndex) => {
                    const dayEvents = cell.inMonth ? getEventsForDate(events, cell.iso) : [];
                    const selected = cell.iso === selectedDate;
                    const leadEvent = getLeadEvent(dayEvents);
                    const palette = leadEvent ? getRegionPalette(leadEvent.region) : null;
                    const tone = getDayTone(dayEvents, leadEvent);
                    const isActive = dayEvents.length > 0;

                    return (
                      <button
                        key={`${weekIndex}-${dayIndex}`}
                        type="button"
                        disabled={!cell.inMonth || !isActive}
                        onClick={() => isActive && onSelectDate(cell.iso)}
                        className={`relative min-h-[12.75rem] overflow-hidden rounded-[1.35rem] border px-4 py-4 text-left transition duration-200 ${
                          cell.inMonth
                            ? selected
                              ? 'border-signal/30 bg-[linear-gradient(180deg,rgba(54,168,255,0.16),rgba(255,255,255,0.06))] shadow-[0_18px_34px_-24px_rgba(54,168,255,0.75)]'
                              : isActive
                                ? tone === 'major'
                                  ? 'border-white/14 bg-[linear-gradient(180deg,rgba(30,64,175,0.24),rgba(255,255,255,0.06))] shadow-[0_20px_36px_-28px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 hover:border-white/24 hover:shadow-[0_24px_46px_-28px_rgba(59,130,246,0.56)]'
                                  : 'border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(255,255,255,0.05))] hover:-translate-y-0.5 hover:border-white/22 hover:bg-[linear-gradient(180deg,rgba(30,41,59,0.98),rgba(255,255,255,0.07))]'
                                : 'cursor-default border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.016),rgba(255,255,255,0.008))]'
                            : 'border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.004))]'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <div
                              className="pointer-events-none absolute inset-x-0 top-0 h-px"
                              style={{ backgroundColor: palette?.line ?? 'rgba(184,228,255,0.45)' }}
                            />
                            <div
                              className="pointer-events-none absolute inset-0 opacity-100"
                              style={{
                                background:
                                  tone === 'major'
                                    ? `radial-gradient(circle at 14% 12%, ${palette?.glow ?? 'rgba(54,168,255,0.18)'}, transparent 32%)`
                                    : `radial-gradient(circle at 14% 12%, ${palette?.glow ?? 'rgba(54,168,255,0.12)'}, transparent 26%)`
                              }}
                            />
                          </>
                        ) : null}

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p
                              className={`text-[10px] uppercase tracking-[0.18em] ${
                                cell.inMonth
                                  ? isActive
                                    ? 'text-slate-400'
                                    : 'text-slate-600'
                                  : 'text-slate-700'
                              }`}
                            >
                              {weekDays[dayIndex]}
                            </p>
                            <p
                              className={`mt-2 text-[2rem] font-semibold leading-none ${
                                cell.inMonth
                                  ? isActive
                                    ? 'text-white'
                                    : 'text-slate-400'
                                  : 'text-slate-700'
                              }`}
                            >
                              {cell.day ?? ''}
                            </p>
                          </div>

                          {cell.inMonth && dayEvents.length > 0 ? (
                            <span className="rounded-full border border-white/12 bg-black/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                              {dayEvents.length} live
                            </span>
                          ) : null}
                        </div>

                        {cell.inMonth ? (
                          dayEvents.length > 0 ? (
                            <div className="mt-6 space-y-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: palette?.line ?? 'rgba(184,228,255,0.78)' }}
                                />
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-300">
                                  {leadEvent?.featured ? 'Featured lead' : leadEvent?.category ?? 'Live event'}
                                </p>
                              </div>

                              {leadEvent ? (
                                <div className="space-y-2.5">
                                  <p className="line-clamp-3 text-[13px] font-medium leading-snug text-white">
                                    {leadEvent.title}
                                  </p>
                                </div>
                              ) : null}

                              {dayEvents.length > 1 ? (
                                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                  +{dayEvents.length - 1} more
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <div className="mt-10">
                              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-700">Open date</p>
                            </div>
                          )
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
