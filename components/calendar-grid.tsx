'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventItem } from '@/lib/data/events';
import { parseDate, formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

interface CalendarGridProps {
  events: EventItem[];
  monthKey: string;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayMs = 24 * 60 * 60 * 1000;

interface WeekCell { day: number | null; date: Date; iso: string; inMonth: boolean }

function buildWeekCells(year: number, month: number): WeekCell[][] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const startsOn = (firstOfMonth.getUTCDay() + 6) % 7;
  const gridStart = new Date(Date.UTC(year, month - 1, 1 - startsOn));
  const weeks: WeekCell[][] = [];
  for (let wi = 0; wi < 6; wi++) {
    const week: WeekCell[] = [];
    for (let di = 0; di < 7; di++) {
      const current = new Date(gridStart.getTime() + (wi * 7 + di) * dayMs);
      const inMonth = current.getUTCMonth() === month - 1;
      week.push({ day: inMonth ? current.getUTCDate() : null, date: current, iso: current.toISOString().slice(0, 10), inMonth });
    }
    weeks.push(week);
  }
  return weeks;
}

function getEventsForDate(events: EventItem[], isoDate: string) {
  const current = parseDate(isoDate).getTime();
  return events.filter((e) => {
    const start = parseDate(e.date).getTime();
    const end = (e.endDate ? parseDate(e.endDate) : parseDate(e.date)).getTime();
    return start <= current && end >= current;
  });
}

function isToday(isoDate: string) { return isoDate === new Date().toISOString().slice(0, 10); }

function getEventImage(event: EventItem) {
  if (event.image_path && /^(\/(cities|events|images)\/|https?:\/\/)/.test(event.image_path)) return event.image_path;
  if (event.coverImage) return event.coverImage;
  return null;
}

/* ── Clash overlay: shows both events side by side, floating above the grid ── */
function ClashOverlay({ events, anchorRef, onDismiss }: { events: EventItem[]; anchorRef: React.RefObject<HTMLDivElement | null>; onDismiss: () => void }) {
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const containerWidth = Math.min(events.length * 260 + 16, window.innerWidth - 32);
    let left = rect.left + rect.width / 2 - containerWidth / 2;
    if (left < 16) left = 16;
    if (left + containerWidth > window.innerWidth - 16) left = window.innerWidth - 16 - containerWidth;
    setPos({ top: rect.top + window.scrollY - 8, left, width: containerWidth });
  }, [anchorRef, events.length]);

  if (!pos) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      data-clash-overlay
      className="fixed z-[100] pointer-events-auto"
      style={{ top: pos.top, left: pos.left, width: pos.width }}
      onMouseLeave={onDismiss}
    >
      {/* Red ambient glow */}
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-red-500/15 blur-2xl" />

      <div className="relative flex gap-2 rounded-2xl border border-red-500/30 bg-slate-950/95 p-2 shadow-2xl shadow-red-500/20 backdrop-blur-xl">
        {events.map((e, i) => {
          const img = getEventImage(e);
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 15, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 25 }}
              className="flex-1"
            >
              <Link
                href={`/events/${getEventSlug(e)}`}
                className="group relative block h-full overflow-hidden rounded-xl border border-white/10 transition hover:border-red-400/50"
              >
                {img && (
                  <div className="absolute inset-0">
                    <Image src={img} alt="" fill className="object-cover opacity-40 transition-opacity duration-300 group-hover:opacity-70" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative flex flex-col justify-end px-3 py-3" style={{ minHeight: '8rem' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">{e.category}</p>
                  <p className="mt-1 text-sm font-bold leading-tight text-white line-clamp-2">{e.title}</p>
                  <p className="mt-1 text-[11px] text-white/60">{e.city}, {e.country}</p>
                  <p className="mt-0.5 text-[10px] text-white/40">{formatEventDate(e)}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Clash label */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-red-500/40">
        Date clash
      </div>
    </motion.div>
  );
}

export function CalendarGrid({ events, monthKey, selectedDate, onSelectDate }: CalendarGridProps) {
  const [year, month] = monthKey.split('-').map(Number);
  const weeks = buildWeekCells(year, month);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [pinnedCell, setPinnedCell] = useState<string | null>(null);
  const activeCell = pinnedCell || hoveredCell;
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const desktopCells = weeks.map((week) =>
    week.map((cell) => ({
      ...cell,
      dayEvents: cell.inMonth ? getEventsForDate(events, cell.iso) : []
    }))
  );
  const mobileDays = weeks
    .flat()
    .filter((cell) => cell.inMonth)
    .map((cell) => ({ ...cell, dayEvents: getEventsForDate(events, cell.iso) }))
    .filter((cell) => cell.dayEvents.length > 0);

  // Close overlay on scroll or click outside
  useEffect(() => {
    const scrollHandler = () => { setHoveredCell(null); setPinnedCell(null); };
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-clash-overlay]') && !target.closest('[data-clash-cell]')) {
        setPinnedCell(null);
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    document.addEventListener('mousedown', clickHandler);
    return () => { window.removeEventListener('scroll', scrollHandler); document.removeEventListener('mousedown', clickHandler); };
  }, []);

  return (
    <div>
      {/* ── Mobile: vibrant event cards ── */}
      <div className="space-y-4 md:hidden">
        {mobileDays.length > 0 ? (
          mobileDays.map((cell) => {
            const today = isToday(cell.iso);
            const isClash = cell.dayEvents.length >= 2;
            return (
              <div key={cell.iso}>
                {/* Day header */}
                <div className="mb-2 flex items-center gap-2 px-1">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${today ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-100 text-slate-900'}`}>
                    {cell.day}
                  </div>
                  <span className="text-sm font-medium text-slate-500">{cell.date.toLocaleString('en-GB', { weekday: 'long', timeZone: 'UTC' })}</span>
                  {isClash && (
                    <span className="ml-auto rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/30 animate-pulse">
                      CLASH
                    </span>
                  )}
                </div>

                {/* Event cards — full visual */}
                <div className={`space-y-2 ${isClash ? 'rounded-2xl border-2 border-red-400/40 bg-red-50/30 p-2 shadow-[0_0_20px_-4px_rgba(239,68,68,0.2)]' : ''}`}>
                  {cell.dayEvents.map((e) => {
                    const img = getEventImage(e);
                    return (
                      <Link key={e.id} href={`/events/${getEventSlug(e)}`} className="group relative block overflow-hidden rounded-xl shadow-md transition active:scale-[0.97]" style={{ minHeight: '6rem' }}>
                        {/* Full image background */}
                        {img ? (
                          <div className="absolute inset-0">
                            <Image src={img} alt="" fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

                        {/* Content */}
                        <div className="relative flex flex-col justify-end px-4 py-3" style={{ minHeight: '6rem' }}>
                          <span className="mb-1 w-fit rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm">{e.category}</span>
                          <p className="text-base font-bold leading-tight text-white">{e.title}</p>
                          <p className="mt-0.5 text-xs text-white/60">{e.city}, {e.country}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No events this month.
          </div>
        )}
      </div>

      {/* ── Desktop: visual grid ── */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day) => (
            <div key={day} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">{day}</div>
          ))}
        </div>

        <div className="space-y-1.5">
          {desktopCells.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1.5">
              {week.map((cell, di) => {
                const hasEvents = cell.dayEvents.length > 0;
                const today = cell.inMonth && isToday(cell.iso);
                const isClash = cell.dayEvents.length >= 2;
                const isHovered = activeCell === cell.iso;
                const leadEvent = cell.dayEvents[0] ?? null;
                const leadImage = leadEvent ? getEventImage(leadEvent) : null;
                const singleEvent = cell.dayEvents.length === 1;

                const inner = (
                  <div
                    ref={(el) => { cellRefs.current[cell.iso] = el; }}
                    className={`group/cell relative min-h-[7.5rem] overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer ${
                      !cell.inMonth
                        ? 'cursor-default border-transparent bg-slate-50/40'
                        : isClash
                          ? isHovered
                            ? 'z-30 -translate-y-1 scale-[1.04] border-red-500 shadow-[0_0_35px_-4px_rgba(239,68,68,0.5),0_20px_40px_-12px_rgba(0,0,0,0.3)]'
                            : 'border-red-300/60 shadow-sm hover:border-red-400'
                          : hasEvents
                            ? isHovered
                              ? 'z-20 -translate-y-1 scale-[1.04] border-blue-500 shadow-[0_0_35px_-4px_rgba(59,130,246,0.4),0_20px_40px_-12px_rgba(0,0,0,0.25)]'
                              : 'border-slate-200 shadow-sm hover:border-blue-300'
                            : today
                              ? 'border-slate-900 bg-slate-900'
                              : 'border-slate-100 bg-white'
                    }`}
                    onMouseEnter={() => cell.inMonth && hasEvents && setHoveredCell(cell.iso)}
                    onMouseLeave={() => { if (!isClash) setHoveredCell(null); }}
                  >
                    {/* BG image */}
                    {cell.inMonth && hasEvents && leadImage && (
                      <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: isHovered ? 1 : 0.12 }}>
                        <Image src={leadImage} alt="" fill className="object-cover" />
                        <div className={`absolute inset-0 transition-opacity duration-500 ${
                          isHovered
                            ? isClash ? 'bg-gradient-to-t from-red-950/90 via-red-950/50 to-red-950/20' : 'bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20'
                            : ''
                        }`} />
                      </div>
                    )}

                    {/* Neon inner glow */}
                    {cell.inMonth && hasEvents && isHovered && (
                      <div className={`pointer-events-none absolute -inset-px rounded-xl ${
                        isClash ? 'shadow-[inset_0_0_24px_rgba(239,68,68,0.3)]' : 'shadow-[inset_0_0_24px_rgba(59,130,246,0.2)]'
                      }`} />
                    )}

                    {/* Clash bar */}
                    {cell.inMonth && isClash && (
                      <div className={`absolute inset-x-0 top-0 transition-all duration-300 ${
                        isHovered ? 'h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 shadow-[0_2px_16px_rgba(239,68,68,0.6)]' : 'h-1 bg-gradient-to-r from-red-500 to-orange-500'
                      }`} />
                    )}

                    {cell.inMonth && (
                      <div className="relative flex h-full flex-col p-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold transition-colors duration-300 ${
                            isHovered && hasEvents ? 'text-white' : today && !hasEvents ? 'text-white' : 'text-slate-900'
                          }`}>{cell.day}{today && <span className="ml-1 text-[9px] font-semibold uppercase tracking-wider opacity-60">Today</span>}</span>
                          {isClash && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold transition-all duration-300 ${
                              isHovered ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-red-50 text-red-600 border border-red-200'
                            }`}>CLASH</span>
                          )}
                        </div>

                        {hasEvents && (
                          <div className="mt-1.5 flex-1 space-y-1">
                            {cell.dayEvents.slice(0, 2).map((e) => (
                              <div key={e.id} className={`rounded-md px-1.5 py-1 transition-all duration-300 ${isHovered ? 'bg-white/15' : 'bg-slate-50/80'}`}>
                                <p className={`truncate text-[10px] font-semibold leading-tight transition-colors duration-300 ${isHovered ? 'text-white' : 'text-slate-800'}`}>{e.title}</p>
                                <p className={`truncate text-[9px] transition-colors duration-300 ${isHovered ? 'text-white/60' : 'text-slate-400'}`}>{e.city}</p>
                              </div>
                            ))}
                            {cell.dayEvents.length > 2 && (
                              <p className={`px-1.5 text-[9px] font-medium ${isHovered ? 'text-white/50' : 'text-blue-500'}`}>+{cell.dayEvents.length - 2} more</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );

                // Single event = direct link
                if (singleEvent) {
                  return (
                    <Link key={`${wi}-${di}`} href={`/events/${getEventSlug(cell.dayEvents[0])}`} className="block" onMouseEnter={() => setHoveredCell(cell.iso)} onMouseLeave={() => setHoveredCell(null)}>
                      {inner}
                    </Link>
                  );
                }

                return (
                  <div
                    key={`${wi}-${di}`}
                    className="relative"
                    data-clash-cell
                    onClick={() => {
                      if (isClash) {
                        setPinnedCell((prev) => prev === cell.iso ? null : cell.iso);
                      }
                    }}
                    onMouseLeave={(e) => {
                      // Don't close if mouse moved to the clash overlay
                      const related = e.relatedTarget as HTMLElement | null;
                      if (related?.closest?.('[data-clash-overlay]')) return;
                      // Don't close hover if pinned
                      if (pinnedCell === cell.iso) return;
                      // Delay to allow mouse to reach overlay
                      setTimeout(() => {
                        setHoveredCell((current) => current === cell.iso ? null : current);
                      }, 150);
                    }}
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-5 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-900" /> Today</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-sm bg-gradient-to-r from-red-500 to-orange-500" /> Date clash</span>
          <span className="ml-auto">Hover to preview, click to view</span>
        </div>
      </div>

      {/* ── Clash overlay (fixed, no page movement) ── */}
      <AnimatePresence>
        {activeCell && (() => {
          const cellData = desktopCells.flat().find((c) => c.iso === activeCell);
          if (!cellData || cellData.dayEvents.length < 2) return null;
          return (
            <ClashOverlay
              key={activeCell}
              events={cellData.dayEvents}
              anchorRef={{ current: cellRefs.current[activeCell] ?? null }}
              onDismiss={() => { setHoveredCell(null); setPinnedCell(null); }}
            />
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
