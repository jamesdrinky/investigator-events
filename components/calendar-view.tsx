'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CalendarGrid } from '@/components/calendar-grid';
import { DayPreviewModal } from '@/components/day-preview-modal';
import { EventCoverMedia } from '@/components/event-cover-media';
import { EventModal } from '@/components/event-modal';
import { FilterBar } from '@/components/filter-bar';
import { SaveDateLinks } from '@/components/save-date-links';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate, formatMonthLabel, getEventDurationDays, getMonthKey, sortEventsByDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';
import { getCountryFlag } from '@/lib/utils/location';

interface CalendarViewProps {
  events: EventItem[];
  initialAssociation?: string;
}

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function shiftMonthKey(monthKey: string, direction: -1 | 1) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + direction, 1));
  return date.toISOString().slice(0, 7);
}

export function CalendarView({ events, initialAssociation }: CalendarViewProps) {
  const sortedEvents = useMemo(() => sortEventsByDate(events), [events]);
  const countries = useMemo(() => Array.from(new Set(sortedEvents.map((event) => event.country))), [sortedEvents]);
  const categories = useMemo(() => Array.from(new Set(sortedEvents.map((event) => event.category))), [sortedEvents]);
  const monthKeys = useMemo(() => Array.from(new Set(sortedEvents.map((event) => getMonthKey(event.date)))), [sortedEvents]);
  const associations = useMemo(
    () => Array.from(new Set(sortedEvents.map((event) => event.association ?? event.organiser))).sort((a, b) => a.localeCompare(b)),
    [sortedEvents]
  );

  const [filters, setFilters] = useState({
    country: 'All',
    region: 'All',
    month: 'All',
    category: 'All',
    association: initialAssociation ?? 'All'
  });
  const [scope, setScope] = useState<'main' | 'all'>('main');
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [previewDate, setPreviewDate] = useState<string | null>(null);
  const [calendarMonthKey, setCalendarMonthKey] = useState<string>(() => monthKeys[0] ?? getCurrentMonthKey());

  const regions = useMemo(() => {
    const filteredByCountry =
      filters.country === 'All' ? sortedEvents : sortedEvents.filter((event) => event.country === filters.country);
    return Array.from(new Set(filteredByCountry.map((event) => event.region)));
  }, [filters.country, sortedEvents]);

  const baseFilteredEvents = useMemo(() => {
    return sortedEvents.filter((event) => {
      const matchesScope = scope === 'all' || event.eventScope === 'main';
      const matchesCountry = filters.country === 'All' || event.country === filters.country;
      const matchesRegion = filters.region === 'All' || event.region === filters.region;
      const matchesCategory = filters.category === 'All' || event.category === filters.category;
      const matchesAssociation =
        filters.association === 'All' || (event.association ?? event.organiser) === filters.association;

      return matchesScope && matchesCountry && matchesRegion && matchesCategory && matchesAssociation;
    });
  }, [filters, scope, sortedEvents]);

  const filteredEvents = useMemo(() => {
    if (filters.month === 'All') {
      return baseFilteredEvents;
    }

    return baseFilteredEvents.filter((event) => formatMonthLabel(getMonthKey(event.date)) === filters.month);
  }, [baseFilteredEvents, filters.month]);

  const groupedListEvents = useMemo(() => {
    return filteredEvents.reduce<Record<string, EventItem[]>>((acc, event) => {
      const key = getMonthKey(event.date);
      acc[key] = acc[key] ? [...acc[key], event] : [event];
      return acc;
    }, {});
  }, [filteredEvents]);

  const highlightedCountries = useMemo(
    () => Array.from(new Set(filteredEvents.map((event) => event.country))).slice(0, 8),
    [filteredEvents]
  );

  const monthOptions = monthKeys.map((monthKey) => formatMonthLabel(monthKey));
  const hasActiveFilters = Object.values(filters).some((value) => value !== 'All');
  const eventScopeLabel = scope === 'main' ? 'Major conferences and flagship meetings' : 'Full event view including secondary listings';
  const activeMonth = calendarMonthKey;
  const activeMonthEvents = activeMonth ? baseFilteredEvents.filter((event) => getMonthKey(event.date) === activeMonth) : [];
  const activeAssociations = Array.from(new Set(filteredEvents.map((event) => event.association ?? event.organiser))).slice(0, 4);
  const activeRegions = Array.from(new Set(activeMonthEvents.map((event) => event.region))).slice(0, 4);
  const shouldShowEmptyState = view === 'list' ? filteredEvents.length === 0 : baseFilteredEvents.length === 0;
  const previewDateEvents = useMemo(() => {
    if (!previewDate) {
      return [];
    }

    const current = new Date(`${previewDate}T00:00:00Z`).getTime();

    return activeMonthEvents.filter((event) => {
      const start = new Date(`${event.date}T00:00:00Z`).getTime();
      const end = new Date(`${(event.endDate ?? event.date)}T00:00:00Z`).getTime();
      return start <= current && end >= current;
    });
  }, [activeMonthEvents, previewDate]);

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

  return (
    <div className="space-y-5">
      <motion.section
        className="surface-flat relative overflow-hidden p-5 sm:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_24%,rgba(36,212,199,0.035))]" />
        <div className="relative">
          <p className="eyebrow">Calendar Overview</p>
          <p className="section-copy mt-3 max-w-4xl">
            Compare live dates across countries, associations, and categories. The calendar starts with major events, then
            opens up to secondary meetings when you need the wider schedule.
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-flat p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Current view</p>
              <p className="mt-2 text-base text-white">{eventScopeLabel}</p>
              <p className="mt-2 text-sm text-slate-300">
                Filter by association or organiser to isolate one network, then scan by month to spot collisions or open
                windows.
              </p>
            </div>
            <div className="surface-flat p-4">
              <div className="flex flex-wrap gap-2">
                {highlightedCountries.map((country) => (
                  <span key={country} className="city-chip">
                    {country}
                  </span>
                ))}
                {highlightedCountries.length > 0 ? <span className="global-chip">global coverage scan</span> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeAssociations.map((association) => (
                  <span key={association} className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-300">
                    {association}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <FilterBar
        countries={countries}
        regions={regions}
        months={monthOptions}
        categories={categories}
        associations={associations}
        scope={scope}
        view={view}
        values={filters}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilters}
        onChangeScope={setScope}
        onChangeView={setView}
        onReset={() =>
          setFilters({
            country: 'All',
            region: 'All',
            month: 'All',
            category: 'All',
            association: 'All'
          })
        }
      />

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
            <div className="space-y-6">
              {Object.entries(groupedListEvents)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([monthKey, monthEvents]) => (
                  <section key={monthKey} className="space-y-3">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <h3 className="font-[var(--font-serif)] text-2xl text-white">{formatMonthLabel(monthKey)}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {monthEvents.length} live {monthEvents.length === 1 ? 'event' : 'events'} in this timeline group
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {monthEvents.map((event) => (
                        (() => {
                          const durationDays = getEventDurationDays(event);

                          return (
                            <article
                              key={event.id}
                              className={`relative overflow-hidden rounded-[1.9rem] p-4 transition duration-300 sm:p-5 ${
                                event.featured ? 'surface-cinematic' : 'surface-elevated'
                              }`}
                            >
                              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_26%,rgba(36,212,199,0.03))]" />
                              <div className="relative grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)_12rem] lg:items-start">
                                <div className="surface-flat rounded-[1.45rem] px-4 py-4">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{formatMonthLabel(monthKey)}</p>
                                  <p className="mt-3 text-lg font-semibold text-white">{formatEventDate(event)}</p>
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="global-chip">{event.region}</span>
                                    <span className="city-chip">
                                      {durationDays} day{durationDays === 1 ? '' : 's'}
                                    </span>
                                  </div>
                                </div>

                                <div className="min-w-0 space-y-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <h4 className="text-2xl font-semibold leading-tight text-white">{event.title}</h4>
                                      <p className="mt-2 text-sm text-slate-300">
                                        {event.city}, {event.country}
                                      </p>
                                    </div>
                                    <span className="country-chip shrink-0">
                                      <span>{getCountryFlag(event.country)}</span>
                                      <span>{event.country}</span>
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <span className="city-chip">{event.association ?? event.organiser}</span>
                                    <span className="city-chip">{event.category}</span>
                                    {event.featured ? <span className="global-chip">Featured</span> : null}
                                  </div>

                                  <p className="text-sm leading-relaxed text-slate-300">
                                    {event.description || 'Open the event record for organiser details, dates, and the official source link.'}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-3 pt-1">
                                    <SaveDateLinks event={event} compact />
                                    <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Keep the date in your own calendar</span>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-4 lg:items-end">
                                  <EventCoverMedia
                                    title={event.title}
                                    city={event.city}
                                    country={event.country}
                                    region={event.region}
                                    category={event.category}
                                    coverImage={event.coverImage}
                                    coverImageAlt={event.coverImageAlt}
                                    compact
                                    className="w-full lg:w-[11rem]"
                                    priorityLabel={event.featured ? 'Featured event' : event.category}
                                  />
                                  <div className="flex flex-wrap gap-3 lg:justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedEvent(event)}
                                      className="btn-primary px-5 py-2.5"
                                    >
                                      Preview event
                                    </button>
                                    <Link href={`/events/${getEventSlug(event)}`} className="btn-secondary px-5 py-2.5">
                                      Open event page
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </article>
                          );
                        })()
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
            {activeMonth ? (
              <section className="space-y-4">
                <div className="surface-elevated relative overflow-hidden p-4 sm:p-5">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.028),transparent_44%,rgba(255,255,255,0.018))]" />
                  <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                    <p className="eyebrow">Month Overview</p>
                      <p className="mt-3 font-[var(--font-serif)] text-3xl text-white">{formatMonthLabel(activeMonth)}</p>
                      <p className="mt-2 text-sm text-slate-300">
                        Scan the full month, then open any live date for a richer event preview.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:items-end">
                      <div className="inline-flex w-full items-stretch gap-2 sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            const previousMonth = shiftMonthKey(activeMonth, -1);
                            setCalendarMonthKey(previousMonth);
                            if (filters.month !== 'All') {
                              setFilters({ ...filters, month: 'All' });
                            }
                          }}
                          className="inline-flex min-h-14 flex-1 items-center justify-center rounded-[1.2rem] border border-white/12 bg-white/[0.035] px-5 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/[0.06] active:translate-y-0"
                        >
                          Previous month
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
                          className="inline-flex min-h-14 flex-1 items-center justify-center rounded-[1.2rem] border border-signal/22 bg-[linear-gradient(180deg,rgba(54,168,255,0.14),rgba(255,255,255,0.05))] px-5 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:border-signal/34 hover:bg-[linear-gradient(180deg,rgba(54,168,255,0.18),rgba(255,255,255,0.07))] active:translate-y-0"
                        >
                          Next month
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <span className="rounded-full border border-white/12 bg-white/[0.035] px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-300">
                          {activeMonthEvents.length} this month
                        </span>
                        {activeRegions.map((region) => (
                          <span key={region} className="global-chip">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <CalendarGrid
                  events={activeMonthEvents}
                  monthKey={activeMonth}
                  selectedDate={previewDate}
                  onSelectDate={setPreviewDate}
                />
              </section>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {shouldShowEmptyState && (
        <motion.div className="surface-flat relative overflow-hidden p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                  category: 'All',
                  association: 'All'
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
