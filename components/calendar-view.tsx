'use client';

import { AnimatePresence, motion } from 'framer-motion';
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

export function CalendarView({ events, initialAssociation, initialSearch, initialRegion, initialMonth }: CalendarViewProps) {
  const sortedEvents = useMemo(() => sortEventsByDate(events), [events]);
  const countries = useMemo(() => Array.from(new Set(sortedEvents.map((event) => event.country))), [sortedEvents]);
  const categories = useMemo(() => Array.from(new Set(sortedEvents.map((event) => event.category))), [sortedEvents]);
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

  const groupedListEvents = useMemo(() => {
    return filteredEvents.reduce<Record<string, EventItem[]>>((acc, event) => {
      const key = getMonthKey(event.date);
      acc[key] = acc[key] ? [...acc[key], event] : [event];
      return acc;
    }, {});
  }, [filteredEvents]);

  const monthOptions = monthKeys.map((monthKey) => formatMonthLabel(monthKey));
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => (key === 'search' ? value.trim().length > 0 : value !== 'All'));
  const eventScopeLabel = scope === 'main' ? 'Major conferences and flagship meetings' : 'All approved listings including training and smaller gatherings';
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
        className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(244,248,255,0.92))] p-5 shadow-[0_30px_70px_-34px_rgba(15,23,42,0.16)] sm:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(22,104,255,0.07),transparent_24%),radial-gradient(circle_at_84%_20%,rgba(20,184,255,0.06),transparent_20%)]" />
        <div className="relative grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.6rem] border border-white/70 bg-white/72 p-4 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.12)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Current view</p>
            <p className="mt-2 text-base font-medium text-slate-950">{eventScopeLabel}</p>
            <p className="mt-2 text-sm text-slate-600">
              Use search and filters to narrow by association, region, month, country, or category without losing the wider calendar context.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.6rem] border border-white/70 bg-[linear-gradient(145deg,rgba(239,246,255,0.96),rgba(255,255,255,0.92))] p-4 shadow-[0_18px_44px_-34px_rgba(36,76,170,0.12)]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-700">Major vs all</p>
              <p className="mt-2 text-sm text-slate-700">Major Events is the quicker planning view. All Events is the wider industry scan.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/70 bg-[linear-gradient(145deg,rgba(236,254,255,0.96),rgba(255,255,255,0.92))] p-4 shadow-[0_18px_44px_-34px_rgba(14,165,233,0.12)]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-700">Fast scanning</p>
              <p className="mt-2 text-sm text-slate-700">Timeline for detail, month view for date clustering and collision checks.</p>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-wrap gap-2">
            {activeAssociations.map((association) => (
              <span key={association} className="city-chip">
                {association}
              </span>
            ))}
            {activeRegions.map((region) => (
              <span key={region} className="global-chip">
                {region}
              </span>
            ))}
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
            search: '',
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
            <div className="space-y-7">
              {Object.entries(groupedListEvents)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([monthKey, monthEvents]) => (
                  <section key={monthKey} className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <h3 className="font-[var(--font-serif)] text-3xl text-slate-950">{formatMonthLabel(monthKey)}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {monthEvents.length} live {monthEvents.length === 1 ? 'event' : 'events'} in this month
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {monthEvents.map((event) => {
                        const durationDays = getEventDurationDays(event);

                        return (
                          <article
                            key={event.id}
                            className={`group relative overflow-hidden rounded-[2rem] p-4 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 sm:p-5 ${
                              event.featured
                                ? 'border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_52%,#f4fbff_100%)] shadow-[0_30px_60px_-36px_rgba(22,104,255,0.2)] hover:shadow-[0_42px_88px_-40px_rgba(22,104,255,0.26)]'
                                : 'border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.9))] shadow-[0_22px_48px_-34px_rgba(15,23,42,0.16)] hover:shadow-[0_36px_76px_-36px_rgba(15,23,42,0.2)]'
                            }`}
                          >
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(22,104,255,0.07),transparent_22%),radial-gradient(circle_at_86%_76%,rgba(20,184,255,0.05),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_56%,rgba(255,255,255,0)_100%)]" />
                            <div className="relative grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)_auto] lg:items-start">
                              <EventCoverMedia
                                title={event.title}
                                city={event.city}
                                country={event.country}
                                region={event.region}
                                category={event.category}
                                coverImage={event.coverImage}
                                coverImageAlt={event.coverImageAlt}
                                associationName={event.association ?? event.organiser}
                                featured={event.featured}
                                compact
                                className="h-[13rem] w-full"
                              />

                              <div className="min-w-0">
                                <div className="flex flex-wrap gap-2">
                                  <span className="city-chip">{formatMonthLabel(monthKey)}</span>
                                  <span className="global-chip">{event.region}</span>
                                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-violet-700">
                                    {event.category}
                                  </span>
                                </div>
                                <h4 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 transition duration-300 group-hover:text-blue-700">
                                  {event.title}
                                </h4>
                                <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-blue-700">
                                  {formatEventDate(event)}
                                </p>
                                <p className="mt-2 text-sm text-slate-600">
                                  {event.city}, {event.country} · Hosted by {event.association ?? event.organiser}
                                </p>
                                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                                  {event.description || 'Open the event record for the official website, organiser details, and saving options.'}
                                </p>
                              </div>

                              <div className="flex flex-col gap-3 lg:min-w-[12rem] lg:items-end">
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-700">
                                  {durationDays} day{durationDays === 1 ? '' : 's'}
                                </span>
                                <button type="button" onClick={() => setSelectedEvent(event)} className="btn-primary w-full px-5 py-2.5 lg:w-auto">
                                  Preview
                                </button>
                                <Link href={`/events/${getEventSlug(event)}`} className="btn-secondary w-full px-5 py-2.5 lg:w-auto">
                                  Open page
                                </Link>
                                <SaveDateLinks event={event} compact />
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
            {activeMonth ? (
              <section className="space-y-4">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(245,249,255,0.92))] p-4 shadow-[0_24px_52px_-30px_rgba(15,23,42,0.15)] sm:p-5">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(22,104,255,0.07),transparent_24%),radial-gradient(circle_at_78%_24%,rgba(20,184,255,0.06),transparent_20%)]" />
                  <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="eyebrow">Month View</p>
                      <p className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">{formatMonthLabel(activeMonth)}</p>
                      <p className="mt-2 text-sm text-slate-600">Open any date to see which events are active across that day.</p>
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
                          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-[1.2rem] border border-white/85 bg-white/92 px-5 text-sm font-medium text-slate-700 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.14)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50"
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
                          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-[1.2rem] border border-sky-600 bg-[linear-gradient(135deg,#1668ff,#14b8ff)] px-5 text-sm font-medium text-white shadow-[0_24px_48px_-28px_rgba(22,104,255,0.46)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
                        >
                          Next
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-500">
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

                <CalendarGrid events={activeMonthEvents} monthKey={activeMonth} selectedDate={previewDate} onSelectDate={setPreviewDate} />
              </section>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {shouldShowEmptyState && (
        <motion.div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(245,249,255,0.92))] p-8 text-center shadow-[0_24px_52px_-30px_rgba(15,23,42,0.14)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-lg font-semibold text-slate-950">
            {events.length === 0 ? 'No live events yet' : 'No events match this view'}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {events.length === 0
              ? 'Approved events will appear here once they have been added to the live calendar.'
              : scope === 'main' && !hasActiveFilters
                ? 'No major events are visible in the current dataset. Switch to All Events to widen the calendar.'
                : 'Try broadening your filters to explore more regions, months, and event categories.'}
          </p>
          {(hasActiveFilters || scope === 'main') && events.length > 0 && (
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
              className="mt-5 inline-flex rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-900"
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
