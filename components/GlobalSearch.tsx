'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, MapPin, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { getCountryFlag } from '@/lib/utils/location';
import { UserAvatar } from '@/components/UserAvatar';

type EventResult = { id: string; title: string; slug: string | null; start_date: string | null; city: string; country: string; association: string | null; organiser: string | null; description: string | null };
type PersonResult = { id: string; full_name: string | null; username: string | null; avatar_url: string | null; country: string | null; specialisation: string | null };

export function GlobalSearch({ isDark }: { isDark?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<EventResult[]>([]);
  const [people, setPeople] = useState<PersonResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const totalResults = events.length + people.length;

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setEvents([]); setPeople([]); return; }
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    // Sanitize search term for PostgREST - escape special chars
    const safe = q.replace(/[%_\\()\[\]]/g, '');
    if (!safe) { setEvents([]); setPeople([]); setLoading(false); return; }
    const [{ data: ev }, { data: ppl }] = await Promise.all([
      supabase.from('events').select('id, title, slug, start_date, city, country, association, organiser, description').eq('approved', true).or(`title.ilike.%${safe}%,city.ilike.%${safe}%,country.ilike.%${safe}%,association.ilike.%${safe}%,organiser.ilike.%${safe}%,description.ilike.%${safe}%`).limit(8),
      supabase.from('profiles').select('id, full_name, username, avatar_url, country, specialisation').eq('is_public', true).or(`full_name.ilike.%${safe}%,username.ilike.%${safe}%,specialisation.ilike.%${safe}%,country.ilike.%${safe}%`).limit(5),
    ]);
    setEvents(ev ?? []);
    setPeople(ppl ?? []);
    setLoading(false);
    setFocusIndex(-1);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, doSearch]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navigate = (path: string) => {
    setOpen(false);
    setMobileOpen(false);
    setQuery('');
    router.push(path as any);
  };

  const allItems: Array<{ type: 'event' | 'person'; data: EventResult | PersonResult }> = [
    ...events.map((e) => ({ type: 'event' as const, data: e })),
    ...people.map((p) => ({ type: 'person' as const, data: p })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIndex((i) => Math.min(i + 1, allItems.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIndex((i) => Math.max(i - 1, -1)); }
    if (e.key === 'Enter' && focusIndex >= 0) {
      e.preventDefault();
      const item = allItems[focusIndex];
      if (item.type === 'event') navigate(`/events/${(item.data as EventResult).slug}`);
      if (item.type === 'person' && (item.data as PersonResult).username) navigate(`/profile/${(item.data as PersonResult).username}`);
    }
    if (e.key === 'Escape') { setOpen(false); setMobileOpen(false); }
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

  // Desktop search bar
  const searchBar = (
    <div ref={wrapperRef} className="relative">
      <div className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all ${
        isDark
          ? 'border-white/10 bg-white/5 text-white/60 focus-within:border-white/20 focus-within:bg-white/10'
          : 'border-slate-200/80 bg-slate-50/80 text-slate-400 focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-sm'
      }`}>
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search site..."
          className={`w-32 border-0 bg-transparent text-xs outline-none placeholder:text-inherit lg:w-44 ${isDark ? 'text-white' : 'text-slate-800'}`}
        />
      </div>

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl sm:w-80">
          {loading && <p className="p-4 text-center text-xs text-slate-400">Searching...</p>}

          {!loading && totalResults === 0 && <p className="p-4 text-center text-xs text-slate-400">No results found</p>}

          {events.length > 0 && (
            <div className="border-b border-slate-100 p-2">
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Events</p>
              {events.map((ev, i) => (
                <button key={ev.id} type="button" onClick={() => navigate(`/events/${ev.slug}`)}
                  className={`flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition ${focusIndex === i ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                  <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{ev.title}</p>
                    <p className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{formatDate(ev.start_date)}</span>
                      <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {ev.city}, {ev.country}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {people.length > 0 && (
            <div className="p-2">
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">People</p>
              {people.map((p, pi) => (
                <button key={p.id} type="button" onClick={() => navigate(`/profile/${p.username}`)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition ${focusIndex === events.length + pi ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                  <UserAvatar src={p.avatar_url} name={p.full_name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{p.full_name ?? p.username}</p>
                    <p className="text-[11px] text-slate-400">
                      {p.country ? `${getCountryFlag(p.country)} ` : ''}
                      {p.specialisation ?? `@${p.username}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Mobile: search icon button that opens full overlay
  const mobileButton = (
    <button
      type="button"
      onClick={() => setMobileOpen(true)}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition sm:h-10 sm:w-10 lg:hidden ${
        isDark ? 'border-white/10 bg-white/5 text-white/70' : 'border-slate-200/90 bg-white text-slate-500'
      }`}
    >
      <Search className="h-4 w-4" />
    </button>
  );

  const mobileOverlay = mobileOpen && (
    <div className="fixed inset-0 z-[70] bg-white lg:hidden" ref={wrapperRef}>
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search site..."
          className="flex-1 border-0 bg-transparent text-base text-slate-900 outline-none"
          autoFocus
        />
        <button type="button" onClick={() => { setMobileOpen(false); setQuery(''); }}>
          <X className="h-5 w-5 text-slate-400" />
        </button>
      </div>

      <div className="overflow-y-auto p-4">
        {loading && <p className="py-8 text-center text-sm text-slate-400">Searching...</p>}
        {!loading && query.length >= 2 && totalResults === 0 && <p className="py-8 text-center text-sm text-slate-400">No results found</p>}

        {events.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Events</p>
            {events.map((ev) => (
              <button key={ev.id} type="button" onClick={() => navigate(`/events/${ev.slug}`)}
                className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50">
                <Calendar className="mt-0.5 h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{ev.title}</p>
                  <p className="text-xs text-slate-400">{formatDate(ev.start_date)} · {ev.city}, {ev.country}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {people.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">People</p>
            {people.map((p) => (
              <button key={p.id} type="button" onClick={() => navigate(`/profile/${p.username}`)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50">
                <UserAvatar src={p.avatar_url} name={p.full_name} size={36} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.full_name ?? p.username}</p>
                  <p className="text-xs text-slate-400">{p.country ? `${getCountryFlag(p.country)} ` : ''}{p.specialisation ?? `@${p.username}`}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: inline search */}
      <div className="hidden lg:block">{searchBar}</div>
      {/* Mobile: icon + overlay */}
      {mobileButton}
      {mobileOverlay}
    </>
  );
}
