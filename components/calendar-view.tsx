'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { CategoryIcon } from '@/components/category-icon';
import { CalendarGrid } from '@/components/calendar-grid';
import { EventModal } from '@/components/event-modal';
import { FilterBar } from '@/components/filter-bar';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate, formatMonthLabel, getMonthKey, sortEventsByDate } from '@/lib/utils/date';

interface CalendarViewProps {
  events: EventItem[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const sortedEvents = useMemo(() => sortEventsByDate(events), [events]);
  const countries = useMemo(() => Array.from(new Set(sortedEvents.map((event) => event.country))), [sortedEvents]);
  const categories = useMemo(() => Array.from(new Set(sortedEvents.map((event) => event.category))), [sortedEvents]);
  const monthKeys = useMemo(() => Array.from(new Set(sortedEvents.map((event) => getMonthKey(event.date)))), [sortedEvents]);

  const [filters, setFilters] = useState({
    country: 'All',
    region: 'All',
    month: 'All',
    category: 'All'
  });
  const [scope, setScope] = useState<'main' | 'all'>('main');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const regions = useMemo(() => {
    const filteredByCountry =
      filters.country === 'All' ? sortedEvents : sortedEvents.filter((event) => event.country === filters.country);
    return Array.from(new Set(filteredByCountry.map((event) => event.region)));
  }, [filters.country, sortedEvents]);

  const filteredEvents = useMemo(() => {
    return sortedEvents.filter((event) => {
      const matchesScope = scope === 'all' || event.eventScope === 'main';
      const eventMonth = formatMonthLabel(getMonthKey(event.date));
      const matchesCountry = filters.country === 'All' || event.country === filters.country;
      const matchesRegion = filters.region === 'All' || event.region === filters.region;
      const matchesMonth = filters.month === 'All' || eventMonth === filters.month;
      const matchesCategory = filters.category === 'All' || event.category === filters.category;

      return matchesScope && matchesCountry && matchesRegion && matchesMonth && matchesCategory;
    });
  }, [filters, scope, sortedEvents]);

  const groupedListEvents = useMemo(() => {
    return filteredEvents.reduce<Record<string, EventItem[]>>((acc, event) => {
      const key = getMonthKey(event.date);
      acc[key] = acc[key] ? [...acc[key], event] : [event];
      return acc;
    }, {});
  }, [filteredEvents]);

  const activeMonth = useMemo(() => {
    if (!monthKeys.length) {
      return '';
    }

    if (filters.month !== 'All') {
      const match = monthKeys.find((key) => formatMonthLabel(key) === filters.month);
      return match ?? monthKeys[0];
    }

    if (filteredEvents.length > 0) {
      return getMonthKey(filteredEvents[0].date);
    }

    return monthKeys[0];
  }, [filteredEvents, filters.month, monthKeys]);

  const highlightedCountries = useMemo(
    () => Array.from(new Set(filteredEvents.map((event) => event.country))).slice(0, 8),
    [filteredEvents]
  );

  const monthOptions = monthKeys.map((monthKey) => formatMonthLabel(monthKey));
  const hasActiveFilters = Object.values(filters).some((value) => value !== 'All');

  return (
    <div className="space-y-7">
      <motion.section
        className="global-panel relative overflow-hidden p-5 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55 }}
      >
        <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(139,169,255,0.12),transparent_24%),radial-gradient(circle_at_82%_70%,rgba(127,228,199,0.08),transparent_22%)]" />
        <div className="relative">
          <p className="eyebrow">Calendar Overview</p>
          <p className="section-copy mt-3 max-w-4xl">
            Use the live calendar to compare event dates across regions, track major meetings first, and then widen the
            view when you need training sessions or smaller member events.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {highlightedCountries.map((country) => (
              <span key={country} className="city-chip">
                {country}
              </span>
            ))}
            {highlightedCountries.length > 0 ? <span className="global-chip">global coverage scan</span> : null}
          </div>
        </div>
      </motion.section>

      <FilterBar
        countries={countries}
        regions={regions}
        months={monthOptions}
        categories={categories}
        values={filters}
        onChange={setFilters}
      />

      <motion.div
        className="global-panel relative overflow-hidden flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.06]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(139,169,255,0.12),transparent_28%),radial-gradient(circle_at_84%_46%,rgba(127,228,199,0.08),transparent_26%)]" />
        <div className="relative flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-white/15 bg-white/5 p-1">
              <button
              type="button"
              onClick={() => setScope('main')}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                scope === 'main' ? 'bg-signal text-white' : 'text-slate-300'
              }`}
            >
              Main events
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                scope === 'all' ? 'bg-signal text-white' : 'text-slate-300'
              }`}
            >
              All events
            </button>
          </div>
          <p className="text-sm text-slate-300">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} shown
          </p>
        </div>
        <div className="relative flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() =>
                setFilters({
                  country: 'All',
                  region: 'All',
                  month: 'All',
                  category: 'All'
                })
              }
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
            >
              Clear filters
            </button>
          )}
          <div className="rounded-full border border-white/15 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                view === 'calendar' ? 'bg-white text-slate-900' : 'text-slate-300'
              }`}
            >
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                view === 'list' ? 'bg-white text-slate-900' : 'text-slate-300'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === 'calendar' ? (
          <motion.div key="calendar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {activeMonth ? (
              <>
                <p className="mb-3 font-[var(--font-serif)] text-2xl text-white">{formatMonthLabel(activeMonth)}</p>
                <CalendarGrid
                  events={filteredEvents.filter((event) => getMonthKey(event.date) === activeMonth)}
                  monthKey={activeMonth}
                  onSelectEvent={setSelectedEvent}
                />
              </>
            ) : null}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="space-y-6">
              {Object.entries(groupedListEvents)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([monthKey, monthEvents]) => (
                  <section key={monthKey} className="space-y-3">
                    <h3 className="font-[var(--font-serif)] text-2xl text-white">{formatMonthLabel(monthKey)}</h3>
                    <div className="global-panel divide-y divide-white/10 overflow-hidden">
                      {monthEvents.map((event) => (
                        <article key={event.id} className="grid gap-3 p-4 transition duration-300 hover:bg-white/[0.03] sm:grid-cols-[170px_1fr_auto] sm:items-center sm:p-5">
                          <div className="text-sm text-slate-300">
                            <p className="font-medium text-slate-100">{formatEventDate(event)}</p>
                            <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-slate-400">
                              <CategoryIcon category={event.category} className="h-3.5 w-3.5" />
                              {event.category}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-base font-semibold text-white">{event.title}</h4>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span className="city-chip">{event.city}</span>
                              <span className="city-chip">{event.region}</span>
                              <span className="city-chip">{event.country}</span>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">Organiser: {event.organiser}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedEvent(event)}
                            className="inline-flex h-fit rounded-full border border-signal/40 bg-signal/10 px-4 py-2 text-xs font-medium text-signal2 hover:bg-signal2/10"
                          >
                            View details
                          </button>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredEvents.length === 0 && (
        <motion.div className="global-panel relative overflow-hidden p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-lg font-semibold text-white">
            {events.length === 0 ? 'No live events yet' : 'No events match this view'}
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            {events.length === 0
              ? 'Approved events will appear here once they have been added to the live calendar.'
              : scope === 'main' && !hasActiveFilters
                ? 'No live main events are available in the current dataset. Switch to all events to widen the view.'
                : 'Try broadening your filters to explore more regions, months, and event categories.'}
          </p>
          {(hasActiveFilters || scope === 'main') && events.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilters({
                  country: 'All',
                  region: 'All',
                  month: 'All',
                  category: 'All'
                });
                setScope('all');
              }}
              className="mt-5 inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
            >
              View all live events
            </button>
          )}
        </motion.div>
      )}

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
