'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AssociationLogoBadge } from '@/components/association-logo-badge';
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

  if (start <= todayTime && end >= todayTime) return 'Live';

  const diffDays = Math.round((start - todayTime) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return 'Today';
  if (diffDays <= 3) return `${Math.max(diffDays, 0)} days`;
  if (diffDays <= 7) return 'This week';
  return 'Upcoming';
}

function getMonthInsights(events: EventItem[], monthKey: string) {
  const monthEvents = events.filter((event) => getMonthKey(event.date) === monthKey);
  const countries = Array.from(new Set(monthEvents.map((event) => event.country)));
  const associations = Array.from(new Set(monthEvents.map((event) => event.association ?? event.organiser)));
  const regionCounts = monthEvents.reduce<Record<string, number>>((acc, event) => {
    acc[event.region] = (acc[event.region] ?? 0) + 1;
    return acc;
  }, {});

  const strongestRegions = Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([region]) => region);

  const weekCounts = monthEvents.reduce<Record<number, number>>((acc, event) => {
    const day = parseDate(event.date).getUTCDate();
    const week = Math.ceil(day / 7);
    acc[week] = (acc[week] ?? 0) + 1;
    return acc;
  }, {});

  const busiestWeekEntry = Object.entries(weekCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0];

  return {
    monthEvents,
    countries,
    associations,
    strongestRegions,
    busiestWeek: busiestWeekEntry ? `Week ${busiestWeekEntry[0]}` : 'Week 1'
  };
}

function getPriorityEvents(events: EventItem[]) {
  return [...events].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.eventScope !== b.eventScope) return a.eventScope === 'main' ? -1 : 1;
    return parseDate(a.date).getTime() - parseDate(b.date).getTime();
  });
}

function getMonthFeedGroups(events: EventItem[]) {
  const groups = new Map<string, EventItem[]>();

  for (const event of events) {
    const monthKey = getMonthKey(event.date);
    const existing = groups.get(monthKey) ?? [];
    existing.push(event);
    groups.set(monthKey, existing);
  }

  return Array.from(groups.entries())
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([monthKey, monthEvents]) => {
    const orderedEvents = sortEventsByDate(monthEvents);
    const countries = Array.from(new Set(monthEvents.map((event) => event.country)));
    const associations = Array.from(new Set(monthEvents.map((event) => event.association ?? event.organiser)));

    return {
      monthKey,
      label: formatMonthLabel(monthKey),
      monthEvents: orderedEvents,
      countries,
      associations
    };
  });
}

function SignalItem({
  event,
  active,
  onHighlight,
  variant = 'default'
}: {
  event: EventItem;
  active: boolean;
  onHighlight: (eventId: string | null) => void;
  variant?: 'default' | 'support' | 'accent';
}) {
  const variantClasses =
    variant === 'accent'
      ? active
        ? 'border-violet-300 bg-[linear-gradient(135deg,rgba(248,250,255,1),rgba(255,255,255,0.98))]'
        : 'border-violet-100 bg-[linear-gradient(135deg,rgba(248,250,255,1),rgba(255,255,255,0.98))]'
      : variant === 'support'
        ? active
          ? 'border-sky-300 bg-[linear-gradient(135deg,rgba(239,246,255,1),rgba(255,255,255,0.98))]'
          : 'border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,255,1),rgba(255,255,255,0.98))]'
        : active
          ? 'border-sky-300 bg-[linear-gradient(135deg,rgba(239,246,255,1),rgba(255,255,255,0.98))]'
          : 'border-slate-200 bg-white';

  return (
    <button
      type="button"
      onMouseEnter={() => onHighlight(event.id)}
      onMouseLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(event.id)}
      onBlur={() => onHighlight(null)}
      onClick={() => onHighlight(active ? null : event.id)}
      className={`group relative min-w-[17rem] overflow-hidden rounded-[1.1rem] border px-4 py-3 text-left transition duration-300 ${
        active
          ? `${variantClasses} shadow-[0_18px_42px_-28px_rgba(37,99,235,0.22)]`
          : `${variantClasses} shadow-[0_12px_30px_-24px_rgba(15,23,42,0.12)] hover:border-sky-200 hover:shadow-[0_18px_38px_-28px_rgba(15,23,42,0.16)]`
      }`}
    >
      <div className="flex min-h-[5.7rem] items-start gap-3">
        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.95)]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="line-clamp-1 pr-1 text-sm font-semibold leading-5 text-slate-950">{event.city}</p>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              {getTimeContext(event)}
            </span>
          </div>
          <p className="line-clamp-1 text-[11px] leading-4 uppercase tracking-[0.18em] text-slate-500">
            {event.country} • {event.category}
          </p>
          <AssociationLogoBadge associationName={event.association ?? event.organiser} compact overlay className="max-w-[9rem]" />
        </div>
      </div>
    </button>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  const accent =
    label === 'Events this month'
      ? 'border-sky-200'
      : label === 'Countries active'
        ? 'border-violet-200'
        : label === 'Busiest week'
          ? 'border-slate-300'
          : 'border-sky-100';
  return (
    <div className={`relative flex h-full min-h-[9.5rem] flex-col rounded-[1.25rem] border bg-white p-4 shadow-[0_16px_38px_-30px_rgba(15,23,42,0.12)] ${accent}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-[1.5rem] font-semibold leading-none tracking-[-0.05em] text-slate-950 sm:text-[1.65rem]">{value}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{detail}</p>
    </div>
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

  const regions = useMemo(() => {
    const filteredByCountry = filters.country === 'All' ? sortedEvents : sortedEvents.filter((event) => event.country === filters.country);
    return Array.from(new Set(filteredByCountry.map((event) => event.region))).sort();
  }, [filters.country, sortedEvents]);

  const baseFilteredEvents = useMemo(() => {
    return sortedEvents.filter((event) => {
      const matchesScope = scope === 'all' || event.eventScope === 'main';
      const matchesCountry = filters.country === 'All' || event.country === filters.country;
      const matchesRegion = filters.region === 'All' || event.region === filters.region;
      const matchesCategory = filters.category === 'All' || event.category === filters.category;
      const matchesAssociation = filters.association === 'All' || (event.association ?? event.organiser) === filters.association;
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
    if (filters.month === 'All') return baseFilteredEvents;
    return baseFilteredEvents.filter((event) => formatMonthLabel(getMonthKey(event.date)) === filters.month);
  }, [baseFilteredEvents, filters.month]);

  const prioritizedEvents = useMemo(() => getPriorityEvents(filteredEvents), [filteredEvents]);
  const upcomingEvents = useMemo(() => prioritizedEvents.filter(isUpcoming), [prioritizedEvents]);
  const visibleEvents = useMemo(() => (upcomingEvents.length > 0 ? upcomingEvents : prioritizedEvents), [prioritizedEvents, upcomingEvents]);
  const featuredEvents = useMemo(() => visibleEvents.slice(0, 3), [visibleEvents]);
  const feedEvents = useMemo(() => visibleEvents.slice(Math.min(featuredEvents.length, 3)), [featuredEvents.length, visibleEvents]);
  const monthFeedGroups = useMemo(() => getMonthFeedGroups(feedEvents.length > 0 ? feedEvents : visibleEvents), [feedEvents, visibleEvents]);
  const visibleEventIds = useMemo(() => new Set(visibleEvents.map((event) => event.id)), [visibleEvents]);
  const signalMonthKey = visibleEvents[0] ? getMonthKey(visibleEvents[0].date) : getCurrentMonthKey();
  const signalMonthInsights = useMemo(() => getMonthInsights(baseFilteredEvents, signalMonthKey), [baseFilteredEvents, signalMonthKey]);
  const activeMonthEvents = useMemo(() => baseFilteredEvents.filter((event) => getMonthKey(event.date) === calendarMonthKey), [baseFilteredEvents, calendarMonthKey]);
  const previewDateEvents = useMemo(() => {
    if (!previewDate) return [];
    const current = parseDate(previewDate).getTime();
    return activeMonthEvents.filter((event) => {
      const start = parseDate(event.date).getTime();
      const end = parseDate(event.endDate ?? event.date).getTime();
      return start <= current && end >= current;
    });
  }, [activeMonthEvents, previewDate]);
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => (key === 'search' ? value.trim().length > 0 : value !== 'All'));
  const monthOptions = monthKeys.map((monthKey) => formatMonthLabel(monthKey));
  const shouldShowEmptyState = filteredEvents.length === 0;

  useEffect(() => {
    if (filters.month === 'All') return;
    const matchingMonth = monthKeys.find((monthKey) => formatMonthLabel(monthKey) === filters.month);
    if (matchingMonth) setCalendarMonthKey(matchingMonth);
  }, [filters.month, monthKeys]);

  useEffect(() => {
    setPreviewDate(null);
  }, [calendarMonthKey]);

  useEffect(() => {
    if (view !== 'calendar') return;
    setCalendarExpanded(true);
    requestAnimationFrame(() => {
      calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [view]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-visible rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_32px_90px_-56px_rgba(15,23,42,0.18)] sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(37,99,235,0.1),transparent_24%),radial-gradient(circle_at_88%_8%,rgba(124,58,237,0.08),transparent_18%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)] lg:items-start">
          <div className="overflow-visible">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Events</p>
            <h1 className="mt-3 max-w-3xl overflow-visible text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-[3.6rem]">
              A{' '}
              <span className="relative inline-flex px-[0.16em] py-[0.08em]">
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-[8%] rounded-[0.5em] bg-[radial-gradient(circle,rgba(37,99,235,0.18),rgba(124,58,237,0.1),transparent_74%)] blur-[10px]"
                  animate={{ opacity: [0.36, 0.72, 0.36], scale: [0.98, 1.03, 0.98] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.span
                  className="relative inline-block pr-[0.06em] bg-[linear-gradient(90deg,#2563EB_0%,#2563EB_36%,#7C3AED_72%,#FF2DA6_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                >
                  live
                </motion.span>
              </span>{' '}
              global event intelligence surface.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Browse association-owned conferences, training events, and investigator gatherings across the year.
            </p>
          </div>

          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
            <StatCard
              label="Events this month"
              value={`${signalMonthInsights.monthEvents.length}`}
              detail={`${formatMonthLabel(signalMonthKey)} live scan`}
            />
            <StatCard
              label="Countries active"
              value={`${signalMonthInsights.countries.length}`}
              detail={signalMonthInsights.strongestRegions.join(' • ') || 'Global coverage'}
            />
            <StatCard label="Busiest week" value={signalMonthInsights.busiestWeek} detail="Peak calendar density" />
            <StatCard
              label="Associations"
              value={`${signalMonthInsights.associations.length}`}
              detail="Badged ownership across the feed"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Global event activity</p>
            <p className="mt-1 text-sm text-slate-600">A quick scan of upcoming dates, locations, and associations before you move into the full event list.</p>
          </div>
          <p className="hidden text-[11px] uppercase tracking-[0.18em] text-slate-400 md:block">Activity strip</p>
        </div>

        <div className="hidden rounded-[1.35rem] border border-slate-200 bg-white p-3 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] md:block">
          <div className="signal-marquee">
            <div className="signal-marquee-track py-1">
              {[...visibleEvents.slice(0, 6), ...visibleEvents.slice(0, 6)].map((event, index) => (
                <SignalItem
                  key={`${event.id}-${index}`}
                  event={event}
                  active={highlightedEventId === event.id}
                  onHighlight={setHighlightedEventId}
                  variant={index % 3 === 0 ? 'accent' : index % 3 === 1 ? 'support' : 'default'}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleEvents.slice(0, 8).map((event) => (
              <div key={event.id} className="w-[84vw] min-w-[17.5rem] max-w-[20rem] shrink-0">
                <SignalItem event={event} active={highlightedEventId === event.id} onHighlight={setHighlightedEventId} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="pt-1">
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
      </div>

      {!shouldShowEmptyState && featuredEvents.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Featured events</p>
              <h2 className="mt-1 text-[1.9rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.5rem]">Featured events</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">A closer look at key upcoming events, with a global activity map for the lead feature.</p>
          </div>

          <div className="hidden gap-4 md:grid xl:grid-cols-[minmax(0,1.36fr)_minmax(0,0.9fr)]">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
              <EventCard
                event={featuredEvents[0]}
                priority="hero"
                isSignalActive={highlightedEventId === featuredEvents[0].id}
                onHoverChange={(active) => setHighlightedEventId(active ? featuredEvents[0].id : null)}
              />
            </motion.div>
            <div className="grid gap-4">
              {featuredEvents.slice(1).map((event, index) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: (index + 1) * 0.05 }}>
                  <EventCard
                    event={event}
                    priority="featured"
                    isSignalActive={highlightedEventId === event.id}
                    onHoverChange={(active) => setHighlightedEventId(active ? event.id : null)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featuredEvents.map((event, index) => (
              <div key={event.id} className={`${index === 0 ? 'w-[88vw] max-w-[24rem]' : 'w-[76vw] max-w-[20rem]'} shrink-0`}>
                <EventCard
                  event={event}
                  priority={index === 0 ? 'hero' : 'featured'}
                  isSignalActive={highlightedEventId === event.id}
                  onHoverChange={(active) => setHighlightedEventId(active ? event.id : null)}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section ref={listRef} className="space-y-5" id="event-list">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Upcoming events</p>
            <h2 className="mt-1 text-[1.9rem] font-semibold tracking-[-0.045em] text-slate-950 sm:text-[2.25rem]">Events by month</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">Browse the rest of the year in clear monthly groups.</p>
        </div>

        {!shouldShowEmptyState ? (
          <div className="space-y-8">
            {monthFeedGroups.map((group, groupIndex) => (
              <section key={group.monthKey} className="space-y-4">
                <div className="flex flex-col gap-3 rounded-[1.3rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,255,0.98))] px-4 py-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)] sm:flex-row sm:items-end sm:justify-between sm:px-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Events by month</p>
                    <h3 className="mt-1 text-[1.45rem] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[1.78rem]">{group.label}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700">{group.monthEvents.length} events</span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
                      {group.countries.length} countries
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
                      {group.associations.length} associations
                    </span>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {group.monthEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: groupIndex * 0.03 + index * 0.02 }}
                    >
                      <EventCard
                        event={event}
                        priority="default"
                        isSignalActive={highlightedEventId === event.id}
                        onHoverChange={(active) => setHighlightedEventId(active ? event.id : null)}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.12)]">
            No events match this view right now. Broaden your filters to reveal more regions, dates, or associations.
          </div>
        )}
      </section>

      <section ref={calendarRef} className="relative overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-[0_26px_70px_-46px_rgba(15,23,42,0.16)] sm:p-5 lg:p-6" id="calendar-grid">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(37,99,235,0.08),transparent_24%),radial-gradient(circle_at_85%_0%,rgba(124,58,237,0.08),transparent_20%)]" />
        <div className="relative space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Calendar</p>
              <h2 className="mt-1 text-[1.75rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.15rem]">Calendar view</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">{formatMonthLabel(calendarMonthKey)}</span>
              <button
                type="button"
                onClick={() => {
                  setCalendarExpanded((current) => !current);
                  setView('calendar');
                }}
                className="inline-flex items-center rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
              >
                {calendarExpanded ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className={`space-y-4 ${calendarExpanded || view === 'calendar' ? 'block' : 'hidden md:block'}`}>
            <div className="flex flex-col gap-3 rounded-[1.1rem] border border-slate-200 bg-slate-50/90 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">Select a date to see the lead event, association, and any other activity on that day.</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCalendarMonthKey(shiftMonthKey(calendarMonthKey, -1));
                    if (filters.month !== 'All') setFilters({ ...filters, month: 'All' });
                  }}
                  className="inline-flex h-10 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalendarMonthKey(shiftMonthKey(calendarMonthKey, 1));
                    if (filters.month !== 'All') setFilters({ ...filters, month: 'All' });
                  }}
                  className="inline-flex h-10 items-center rounded-2xl border border-slate-900 bg-slate-900 px-4 text-sm font-semibold text-white"
                >
                  Next
                </button>
              </div>
            </div>

            <CalendarGrid events={activeMonthEvents} monthKey={calendarMonthKey} selectedDate={previewDate} onSelectDate={setPreviewDate} />

            {previewDateEvents.length > 0 ? (
              <div className="rounded-[1.1rem] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.12)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Selected day</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {previewDateEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        visibleEventIds.has(event.id)
                          ? 'border-sky-200 bg-sky-50 text-sky-700 shadow-[0_12px_26px_-22px_rgba(14,165,233,0.24)]'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <DayPreviewModal date={previewDate} events={previewDateEvents} onClose={() => setPreviewDate(null)} onPreviewEvent={(event) => setSelectedEvent(event)} />
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
