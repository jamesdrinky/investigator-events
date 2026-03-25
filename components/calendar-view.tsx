'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarGrid } from '@/components/calendar-grid';
import { DayPreviewModal } from '@/components/day-preview-modal';
import { EventCard } from '@/components/event-card';
import { EventModal } from '@/components/event-modal';
import { FilterBar } from '@/components/filter-bar';
import type { EventItem } from '@/lib/data/events';
import { formatMonthLabel, getMonthKey, parseDate, sortEventsByDate } from '@/lib/utils/date';

interface CalendarViewProps {
  events: EventItem[];
  initialAssociation?: string;
  initialSearch?: string;
  initialRegion?: string;
  initialMonth?: string;
}

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function shiftMonthKey(monthKey: string, direction: -1 | 1) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + direction, 1));
  return date.toISOString().slice(0, 7);
}

function isUpcoming(event: EventItem) {
  const today = new Date().toISOString().slice(0, 10);
  return (event.endDate ?? event.date) >= today;
}

function getTimeContext(event: EventItem) {
  const today = new Date().toISOString().slice(0, 10);
  const todayTime = parseDate(today).getTime();
  const start = parseDate(event.date).getTime();
  const end = parseDate(event.endDate ?? event.date).getTime();

  if (start <= todayTime && end >= todayTime) {
    return 'Live';
  }

  const diffDays = Math.round((start - todayTime) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) {
    return 'Today';
  }
  if (diffDays <= 2) {
    return `${Math.max(diffDays, 0)} days`;
  }

  return 'Upcoming';
}

function getMonthInsights(events: EventItem[], monthKey: string) {
  const monthEvents = events.filter((event) => getMonthKey(event.date) === monthKey);
  const countries = Array.from(new Set(monthEvents.map((event) => event.country)));
  const regions = Array.from(new Set(monthEvents.map((event) => event.region))).slice(0, 3);

  return {
    monthEvents,
    countries,
    regions
  };
}

function MonthSignalPanel({
  monthLabel,
  eventCount,
  countryCount,
  regions
}: {
  monthLabel: string;
  eventCount: number;
  countryCount: number;
  regions: string[];
}) {
  return (
    <section className="space-y-3 border-b border-slate-200 pb-4">
      <motion.div
        className="h-px w-full origin-left bg-[linear-gradient(90deg,rgba(14,165,233,0.95),rgba(139,92,246,0.92),rgba(236,72,153,0.72),rgba(236,72,153,0))]"
        initial={{ scaleX: 0.72, opacity: 0.75 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Live global event signal</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">{monthLabel}</h2>
        </div>
        <div className="space-y-1 text-sm text-slate-600 sm:text-base">
          <p className="font-medium text-slate-900">
            {eventCount} events across {countryCount} countries
          </p>
          <p>Key regions: {regions.length ? regions.join(', ') : 'Global coverage'}</p>
        </div>
      </div>
    </section>
  );
}

function SignalStrip({
  events,
  highlightedEventId,
  onHighlight
}: {
  events: EventItem[];
  highlightedEventId: string | null;
  onHighlight: (eventId: string | null) => void;
}) {
  const signalEvents = events.slice(0, 8);
  const loopEvents = [...signalEvents, ...signalEvents];

  if (!signalEvents.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Signal strip</p>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Hover cards to sync the feed</p>
      </div>

      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {signalEvents.map((event, index) => {
            const active = highlightedEventId === event.id;
            return (
              <button
                key={event.id}
                type="button"
                onMouseEnter={() => onHighlight(event.id)}
                onMouseLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(event.id)}
                onBlur={() => onHighlight(null)}
                className={`flex min-w-[17rem] shrink-0 items-center gap-3 rounded-[1rem] border px-3 py-3 text-left transition ${
                  active ? 'border-sky-300 bg-sky-50 shadow-[0_14px_30px_-22px_rgba(14,165,233,0.4)]' : 'border-slate-200 bg-white'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${index % 3 === 0 ? 'bg-sky-500' : index % 3 === 1 ? 'bg-violet-500' : 'bg-pink-500'} animate-pulse`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{event.city}</p>
                  <p className="truncate text-xs uppercase tracking-[0.16em] text-slate-500">
                    {event.category} • {getTimeContext(event)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-[1.05rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_16px_40px_-30px_rgba(15,23,42,0.16)] md:block">
        <motion.div
          className="flex w-max gap-3 px-3 py-3"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
        >
          {loopEvents.map((event, index) => {
            const active = highlightedEventId === event.id;

            return (
              <button
                key={`${event.id}-${index}`}
                type="button"
                onMouseEnter={() => onHighlight(event.id)}
                onMouseLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(event.id)}
                onBlur={() => onHighlight(null)}
                className={`flex min-w-[18rem] items-center gap-3 rounded-[0.95rem] border px-3.5 py-3 text-left transition ${
                  active
                    ? 'border-sky-300 bg-sky-50 shadow-[0_16px_32px_-24px_rgba(14,165,233,0.45)]'
                    : 'border-slate-200 bg-white/94 hover:border-slate-300'
                }`}
              >
                <span className={`relative flex h-2.5 w-2.5 shrink-0 rounded-full ${index % 3 === 0 ? 'bg-sky-500' : index % 3 === 1 ? 'bg-violet-500' : 'bg-pink-500'} animate-pulse`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{event.city}</p>
                  <p className="truncate text-xs uppercase tracking-[0.16em] text-slate-500">
                    {event.category} • {getTimeContext(event)}
                  </p>
                </div>
              </button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export function CalendarView({ events, initialAssociation, initialSearch, initialRegion, initialMonth }: CalendarViewProps) {
  const sortedEvents = useMemo(() => sortEventsByDate(events), [events]);
  const countries = useMemo(() => Array.from(new Set(sortedEvents.map((event) => event.country))).sort(), [sortedEvents]);
  const categories = useMemo(() => Array.from(new Set(sortedEvents.map((event) => event.category))).sort(), [sortedEvents]);
  const monthKeys = useMemo(() => Array.from(new Set(sortedEvents.map((event) => getMonthKey(event.date)))), [sortedEvents]);
  const associations = useMemo(
    () => Array.from(new Set(sortedEvents.map((event) => event.association ?? event.organiser))).sort((a, b) => a.localeCompare(b)),
    [sortedEvents]
  );

  const [filters, setFilters] = useState({
    search: initialSearch ?? '',
    country: 'All',
    region: initialRegion ?? 'All',
    month: initialMonth ?? 'All',
    category: 'All',
    association: initialAssociation ?? 'All'
  });
  const [scope, setScope] = useState<'main' | 'all'>('main');
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [previewDate, setPreviewDate] = useState<string | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [calendarMonthKey, setCalendarMonthKey] = useState<string>(() => monthKeys[0] ?? getCurrentMonthKey());
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const listRef = useRef<HTMLElement | null>(null);
  const calendarRef = useRef<HTMLElement | null>(null);
  const hasMounted = useRef(false);

  const regions = useMemo(() => {
    const filteredByCountry =
      filters.country === 'All' ? sortedEvents : sortedEvents.filter((event) => event.country === filters.country);
    return Array.from(new Set(filteredByCountry.map((event) => event.region))).sort();
  }, [filters.country, sortedEvents]);

  const baseFilteredEvents = useMemo(() => {
    return sortedEvents.filter((event) => {
      const matchesScope = scope === 'all' || event.eventScope === 'main';
      const matchesCountry = filters.country === 'All' || event.country === filters.country;
      const matchesRegion = filters.region === 'All' || event.region === filters.region;
      const matchesCategory = filters.category === 'All' || event.category === filters.category;
      const matchesAssociation =
        filters.association === 'All' || (event.association ?? event.organiser) === filters.association;
      const searchNeedle = filters.search.trim().toLowerCase();
      const matchesSearch =
        searchNeedle.length === 0 ||
        [event.title, event.city, event.country, event.region, event.category, event.association ?? '', event.organiser]
          .join(' ')
          .toLowerCase()
          .includes(searchNeedle);

      return matchesScope && matchesCountry && matchesRegion && matchesCategory && matchesAssociation && matchesSearch;
    });
  }, [filters, scope, sortedEvents]);

  const filteredEvents = useMemo(() => {
    if (filters.month === 'All') {
      return baseFilteredEvents;
    }

    return baseFilteredEvents.filter((event) => formatMonthLabel(getMonthKey(event.date)) === filters.month);
  }, [baseFilteredEvents, filters.month]);

  const upcomingEvents = useMemo(() => filteredEvents.filter(isUpcoming), [filteredEvents]);
  const visibleEvents = useMemo(() => (upcomingEvents.length > 0 ? upcomingEvents : filteredEvents).slice(0, 12), [filteredEvents, upcomingEvents]);
  const visibleEventIds = useMemo(() => new Set(visibleEvents.map((event) => event.id)), [visibleEvents]);
  const signalMonthKey = visibleEvents[0] ? getMonthKey(visibleEvents[0].date) : getCurrentMonthKey();
  const signalMonthInsights = useMemo(() => getMonthInsights(filteredEvents, signalMonthKey), [filteredEvents, signalMonthKey]);
  const activeMonth = calendarMonthKey;
  const activeMonthEvents = useMemo(
    () => (activeMonth ? baseFilteredEvents.filter((event) => getMonthKey(event.date) === activeMonth) : []),
    [activeMonth, baseFilteredEvents]
  );
  const previewDateEvents = useMemo(() => {
    if (!previewDate) {
      return [];
    }

    const current = parseDate(previewDate).getTime();
    return activeMonthEvents.filter((event) => {
      const start = parseDate(event.date).getTime();
      const end = parseDate(event.endDate ?? event.date).getTime();
      return start <= current && end >= current;
    });
  }, [activeMonthEvents, previewDate]);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => (key === 'search' ? value.trim().length > 0 : value !== 'All'));
  const shouldShowEmptyState = filteredEvents.length === 0;
  const monthOptions = monthKeys.map((monthKey) => formatMonthLabel(monthKey));
  const activeMonthVisibleCount = activeMonthEvents.filter(isUpcoming).length || activeMonthEvents.length;
  const selectedMonthLabel = formatMonthLabel(activeMonth);

  useEffect(() => {
    if (filters.month === 'All') {
      return;
    }

    const matchingMonth = monthKeys.find((monthKey) => formatMonthLabel(monthKey) === filters.month);
    if (matchingMonth) {
      setCalendarMonthKey(matchingMonth);
    }
  }, [filters.month, monthKeys]);

  useEffect(() => {
    setPreviewDate(null);
  }, [activeMonth]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (view === 'calendar') {
      setCalendarExpanded(true);
      calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [view]);

  return (
    <div className="space-y-7">
      <FilterBar
        countries={countries}
        regions={regions}
        months={monthOptions}
        categories={categories}
        associations={associations}
        scope={scope}
        view={view}
        values={filters}
        resultCount={filteredEvents.length}
        upcomingCount={upcomingEvents.length}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilters}
        onChangeScope={setScope}
        onChangeView={setView}
        onReset={() =>
          setFilters({
            search: '',
            country: 'All',
            region: 'All',
            month: 'All',
            category: 'All',
            association: 'All'
          })
        }
      />

      <section className="relative space-y-5">
        <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.12),transparent_72%)]" />
        <div className="pointer-events-none absolute right-0 top-6 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.1),transparent_72%)]" />
        <div className="relative space-y-5">
          <MonthSignalPanel
            monthLabel={formatMonthLabel(signalMonthKey)}
            eventCount={signalMonthInsights.monthEvents.length}
            countryCount={signalMonthInsights.countries.length}
            regions={signalMonthInsights.regions}
          />

          <SignalStrip events={visibleEvents} highlightedEventId={highlightedEventId} onHighlight={setHighlightedEventId} />
        </div>
      </section>

      <section
        ref={listRef}
        className="relative space-y-5 rounded-[1.4rem] border border-slate-200/90 bg-white p-4 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.2)] sm:p-5 lg:p-6"
        id="event-list"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[1.4rem] bg-[radial-gradient(circle_at_18%_0%,rgba(14,165,233,0.08),transparent_28%),radial-gradient(circle_at_82%_0%,rgba(139,92,246,0.08),transparent_26%)]" />
        <div className="relative flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Primary surface</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">Upcoming events</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Scan the next events, open the full record, and use the calendar only when you need date clustering.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.3)]">
              Showing {visibleEvents.length} of {filteredEvents.length}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.3)]">
              {scope === 'main' ? 'Major events' : 'All approved events'}
            </span>
          </div>
        </div>

        {!shouldShowEmptyState ? (
          <>
            <div className="relative grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {visibleEvents.map((event, index) => {
                const priority = index < 2 ? 'featured' : 'default';
                const wrapperClass =
                  index === 0 ? 'md:col-span-2 2xl:col-span-2' : index === 1 ? '2xl:col-span-2' : '';

                return (
                  <motion.div
                    key={event.id}
                    className={wrapperClass}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: index * 0.04 }}
                  >
                    <EventCard
                      event={event}
                      priority={priority}
                      isSignalActive={highlightedEventId === event.id}
                      onHoverChange={(active) => setHighlightedEventId(active ? event.id : null)}
                    />
                  </motion.div>
                );
              })}
            </div>

            {filteredEvents.length > visibleEvents.length ? (
              <div className="rounded-[1rem] border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-700">
                {filteredEvents.length - visibleEvents.length} more matching events remain in the dataset. Tighten filters or use the
                calendar below to narrow the schedule.
              </div>
            ) : null}
          </>
        ) : (
          <motion.div className="rounded-[1rem] border border-slate-200 bg-slate-50/90 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-lg font-semibold text-slate-950">
              {events.length === 0 ? 'No live events yet' : 'No events match this view'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {events.length === 0
                ? 'Approved events will appear here once they have been added to the live calendar.'
                : scope === 'main' && !hasActiveFilters
                  ? 'No major events are visible in the current dataset. Switch to All to widen the scan.'
                  : 'Try broadening your filters to explore more regions, months, and event categories.'}
            </p>
            {(hasActiveFilters || scope === 'main') && events.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    search: '',
                    country: 'All',
                    region: 'All',
                    month: 'All',
                    category: 'All',
                    association: 'All'
                  });
                  setScope('all');
                }}
                className="mt-4 inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
              >
                View all live events
              </button>
            ) : null}
          </motion.div>
        )}
      </section>

      <section
        ref={calendarRef}
        className="space-y-4 rounded-[1.35rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,0.98))] p-4 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.18)] sm:p-5 lg:p-6"
        id="calendar-grid"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Secondary planning tool</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-2xl">Calendar</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Use the month grid to spot collisions, multi-day overlaps, and quiet dates after you have a shortlist.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-sm text-slate-700">
              {selectedMonthLabel}
            </span>
            <span className="rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-sm text-slate-700">
              {activeMonthVisibleCount} events
            </span>
            <button
              type="button"
              onClick={() => setCalendarExpanded((current) => !current)}
              className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
            >
              {calendarExpanded ? 'Hide calendar' : 'Show calendar'}
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className={`space-y-4 ${calendarExpanded || view === 'calendar' ? 'block' : 'hidden md:block'}`}
        >
          <div className="flex flex-col gap-3 rounded-[1rem] border border-slate-200 bg-white/90 p-3 shadow-[0_12px_26px_-22px_rgba(15,23,42,0.25)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">{selectedMonthLabel}</p>
              <p className="text-sm text-slate-600">Tap a date to preview which events are active.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const previousMonth = shiftMonthKey(activeMonth, -1);
                  setCalendarMonthKey(previousMonth);
                  if (filters.month !== 'All') {
                    setFilters({ ...filters, month: 'All' });
                  }
                }}
                className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextMonth = shiftMonthKey(activeMonth, 1);
                  setCalendarMonthKey(nextMonth);
                  if (filters.month !== 'All') {
                    setFilters({ ...filters, month: 'All' });
                  }
                }}
                className="inline-flex h-10 items-center rounded-xl border border-sky-600 bg-sky-600 px-4 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(2,132,199,0.55)] transition hover:bg-sky-500"
              >
                Next
              </button>
            </div>
          </div>

          <CalendarGrid events={activeMonthEvents} monthKey={activeMonth} selectedDate={previewDate} onSelectDate={setPreviewDate} />

          {previewDateEvents.length > 0 ? (
            <div className="rounded-[1rem] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.2)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Selected day</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{previewDate}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {previewDateEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        visibleEventIds.has(event.id)
                          ? 'border-sky-200 bg-sky-50 text-sky-700'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </section>

      <DayPreviewModal
        date={previewDate}
        events={previewDateEvents}
        onClose={() => setPreviewDate(null)}
        onPreviewEvent={(event) => setSelectedEvent(event)}
      />
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
