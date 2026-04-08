'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, List, X, MapPin } from 'lucide-react';
import { CalendarGrid } from '@/components/calendar-grid';
import { EventCard } from '@/components/event-card';
import { EventModal } from '@/components/event-modal';
import { FilterBar } from '@/components/filter-bar';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate, formatMonthLabel, getMonthKey, parseDate, sortEventsByDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';
import { getAssociationBrandLogoSrc } from '@/lib/utils/association-branding';
import { EventCardAttendees } from '@/components/EventCardAttendees';

interface CalendarViewProps {
  events: EventItem[];
  initialAssociation?: string;
  initialSearch?: string;
  initialRegion?: string;
  initialMonth?: string;
  initialView?: 'list' | 'calendar';
}

function getCurrentMonthKey() { return new Date().toISOString().slice(0, 7); }
function shiftMonthKey(mk: string, dir: -1 | 1) { const [y, m] = mk.split('-').map(Number); return new Date(Date.UTC(y, m - 1 + dir, 1)).toISOString().slice(0, 7); }
function isUpcoming(e: EventItem) { return (e.endDate ?? e.date) >= new Date().toISOString().slice(0, 10); }

function getPriorityEvents(events: EventItem[]) {
  return [...events].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.eventScope !== b.eventScope) return a.eventScope === 'main' ? -1 : 1;
    return parseDate(a.date).getTime() - parseDate(b.date).getTime();
  });
}

function getMonthFeedGroups(events: EventItem[]) {
  const groups = new Map<string, EventItem[]>();
  for (const e of events) { const mk = getMonthKey(e.date); groups.set(mk, [...(groups.get(mk) ?? []), e]); }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([monthKey, evts]) => ({
    monthKey, label: formatMonthLabel(monthKey), events: sortEventsByDate(evts), countryCount: new Set(evts.map((e) => e.country)).size,
  }));
}

/* ── Horizontal scrolling event strip per month ── */
function MonthEventStrip({ events, label, countryCount }: { events: EventItem[]; label: string; countryCount: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanPrev(scrollLeft > 10);
    setCanNext(scrollWidth - scrollLeft - clientWidth > 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll, events]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <section className="space-y-3">
      {/* Month header */}
      <div className="flex items-center gap-3">
        <h3 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{label}</h3>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600">{events.length}</span>
        <span className="hidden text-[11px] text-slate-400 sm:inline">{countryCount} countries</span>
        <div className="ml-auto flex items-center gap-1.5">
          {canPrev && (
            <button onClick={() => scroll('left')} className="hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:bg-slate-50 sm:flex">
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
          )}
          {canNext && (
            <button onClick={() => scroll('right')} className="hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-900 bg-slate-900 transition hover:bg-slate-800 sm:flex">
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Scrolling strip */}
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
        {events.map((event) => {
          const logoSrc = getAssociationBrandLogoSrc(event.association ?? event.organiser);
          const imageSrc = (event.image_path && /^(\/(cities|events|images)\/|https?:\/\/)/.test(event.image_path) ? event.image_path : event.coverImage) ?? '/cities/fallback.jpg';

          return (
            <Link
              key={event.id}
              href={`/events/${getEventSlug(event)}`}
              className="group w-[17rem] flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(59,130,246,0.15)] sm:w-[19rem]"
            >
              {/* Image with logo */}
              <div className="relative h-40 w-full overflow-hidden sm:h-44">
                <Image src={imageSrc} alt={event.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Association logo — top-left */}
                {logoSrc ? (
                  <div className="absolute left-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-white/90 p-1.5 shadow-md sm:h-12 sm:w-12 sm:p-2">
                    <Image src={logoSrc} alt="" width={40} height={40} className="h-auto max-h-7 w-auto max-w-7 object-contain sm:max-h-8 sm:max-w-8" />
                  </div>
                ) : null}

                {/* Date — top-right */}
                <div className="absolute right-2.5 top-2.5 rounded-md bg-white/90 px-2 py-1 shadow-md">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600 sm:text-[10px]">{formatEventDate(event)}</p>
                </div>

                {/* Title over image */}
                <h4 className="absolute inset-x-0 bottom-0 px-3 pb-3 text-sm font-bold leading-tight text-white line-clamp-2 sm:text-base">{event.title}</h4>
              </div>

              {/* Bottom details */}
              <div className="space-y-2 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                  <p className="text-xs text-slate-500 line-clamp-1">{event.city}, {event.country}</p>
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500">{event.category}</span>
                </div>
                <EventCardAttendees eventId={event.id} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function CalendarView({ events, initialAssociation, initialSearch, initialRegion, initialMonth, initialView }: CalendarViewProps) {
  const sorted = useMemo(() => sortEventsByDate(events), [events]);
  const countries = useMemo(() => [...new Set(sorted.map((e) => e.country))].sort(), [sorted]);
  const categories = useMemo(() => [...new Set(sorted.map((e) => e.category))].sort(), [sorted]);
  const monthKeys = useMemo(() => [...new Set(sorted.map((e) => getMonthKey(e.date)))], [sorted]);
  const associations = useMemo(() => [...new Set(sorted.map((e) => e.association ?? e.organiser))].sort(), [sorted]);

  const [filters, setFilters] = useState({ search: initialSearch ?? '', country: 'All', region: initialRegion ?? 'All', month: initialMonth ?? 'All', category: 'All', association: initialAssociation ?? 'All' });
  const [scope, setScope] = useState<'main' | 'all'>('main');
  const [view, setView] = useState<'list' | 'calendar'>(initialView ?? 'list');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [previewDate, setPreviewDate] = useState<string | null>(null);
  const [calendarMK, setCalendarMK] = useState(() => {
    const current = getCurrentMonthKey();
    return monthKeys.includes(current) ? current : monthKeys.find((mk) => mk >= current) ?? monthKeys[0] ?? current;
  });
  const calRef = useRef<HTMLElement | null>(null);

  const regions = useMemo(() => {
    const f = filters.country === 'All' ? sorted : sorted.filter((e) => e.country === filters.country);
    return [...new Set(f.map((e) => e.region))].sort();
  }, [filters.country, sorted]);

  const baseFiltered = useMemo(() => sorted.filter((e) => {
    const s = scope === 'all' || e.eventScope === 'main';
    const c = filters.country === 'All' || e.country === filters.country;
    const r = filters.region === 'All' || e.region === filters.region;
    const cat = filters.category === 'All' || e.category === filters.category;
    const a = filters.association === 'All' || (e.association ?? e.organiser) === filters.association;
    const q = filters.search.trim().toLowerCase();
    const m = q.length === 0 || [e.title, e.city, e.country, e.region, e.category, e.association ?? '', e.organiser].join(' ').toLowerCase().includes(q);
    return s && c && r && cat && a && m;
  }), [filters, scope, sorted]);

  const filtered = useMemo(() => filters.month === 'All' ? baseFiltered : baseFiltered.filter((e) => formatMonthLabel(getMonthKey(e.date)) === filters.month), [baseFiltered, filters.month]);
  const prioritized = useMemo(() => getPriorityEvents(filtered), [filtered]);
  const upcoming = useMemo(() => prioritized.filter(isUpcoming), [prioritized]);
  const visible = useMemo(() => upcoming.length > 0 ? upcoming : prioritized, [prioritized, upcoming]);
  const featured = useMemo(() => visible.slice(0, 3), [visible]);
  const feed = useMemo(() => visible.slice(Math.min(featured.length, 3)), [featured.length, visible]);
  const monthGroups = useMemo(() => getMonthFeedGroups(feed.length > 0 ? feed : visible), [feed, visible]);
  const calendarEvents = useMemo(() => baseFiltered.filter((e) => getMonthKey(e.date) === calendarMK), [baseFiltered, calendarMK]);
  const previewEvents = useMemo(() => {
    if (!previewDate) return [];
    const t = parseDate(previewDate).getTime();
    return calendarEvents.filter((e) => parseDate(e.date).getTime() <= t && parseDate(e.endDate ?? e.date).getTime() >= t);
  }, [calendarEvents, previewDate]);
  const hasFilters = Object.entries(filters).some(([k, v]) => k === 'search' ? v.trim().length > 0 : v !== 'All');
  const monthOpts = monthKeys.map((mk) => formatMonthLabel(mk));
  const empty = filtered.length === 0;

  useEffect(() => { if (filters.month === 'All') return; const m = monthKeys.find((mk) => formatMonthLabel(mk) === filters.month); if (m) setCalendarMK(m); }, [filters.month, monthKeys]);
  useEffect(() => { setPreviewDate(null); }, [calendarMK]);
  useEffect(() => { if (view === 'calendar') calRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [view]);

  return (
    <div className="space-y-6">
      {/* ── View toggle + Filters ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('list')} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${view === 'list' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <List className="h-4 w-4" /> List
          </button>
          <button onClick={() => setView('calendar')} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${view === 'calendar' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <Calendar className="h-4 w-4" /> Calendar
          </button>
          <div className="ml-auto text-sm text-slate-400">{filtered.length} events</div>
        </div>
        <FilterBar countries={countries} regions={regions} months={monthOpts} categories={categories} associations={associations} scope={scope} view={view} values={filters} resultCount={filtered.length} upcomingCount={upcoming.length} hasActiveFilters={hasFilters} onChange={setFilters} onChangeScope={setScope} onChangeView={setView} onReset={() => setFilters({ search: '', country: 'All', region: 'All', month: 'All', category: 'All', association: 'All' })} />
      </div>

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <>
          {/* Featured — grid cards */}
          {!empty && featured.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-950 sm:text-xl">Featured</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((e, i) => (
                  <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }}>
                    <EventCard event={e} priority={i === 0 ? 'hero' : 'featured'} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Month-by-month horizontal scrolling strips */}
          {!empty ? (
            <div className="space-y-8">
              {monthGroups.map((g) => (
                <MonthEventStrip key={g.monthKey} events={g.events} label={g.label} countryCount={g.countryCount} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No events match this view. Broaden your filters to see more.
            </div>
          )}
        </>
      )}

      {/* ── CALENDAR VIEW ── */}
      {view === 'calendar' && (
        <section ref={calRef} className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <button onClick={() => setCalendarMK(shiftMonthKey(calendarMK, -1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-50">
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h2 className="text-lg font-bold text-slate-950 sm:text-xl">{formatMonthLabel(calendarMK)}</h2>
            <button onClick={() => setCalendarMK(shiftMonthKey(calendarMK, 1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 transition hover:bg-slate-800">
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <CalendarGrid events={calendarEvents} monthKey={calendarMK} selectedDate={previewDate} onSelectDate={setPreviewDate} />
          </div>

          <AnimatePresence>
            {previewDate && previewEvents.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-950">{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${previewDate}T00:00:00Z`))}</p>
                    <p className="text-xs text-slate-500">{previewEvents.length} events</p>
                  </div>
                  <button onClick={() => setPreviewDate(null)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"><X className="h-4 w-4 text-slate-500" /></button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {previewEvents.map((e) => <EventCard key={e.id} event={e} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Month events as horizontal strip */}
          {calendarEvents.length > 0 && (
            <MonthEventStrip events={calendarEvents} label={`All in ${formatMonthLabel(calendarMK)}`} countryCount={new Set(calendarEvents.map((e) => e.country)).size} />
          )}
        </section>
      )}

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
