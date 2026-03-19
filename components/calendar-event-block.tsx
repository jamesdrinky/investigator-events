import { CategoryIcon } from '@/components/category-icon';
import type { EventItem } from '@/lib/data/events';
import { getEventDurationDays } from '@/lib/utils/date';

interface CalendarEventBlockProps {
  event: EventItem;
  compact?: boolean;
  onSelect?: (event: EventItem) => void;
}

function getCategoryTone(category: string): string {
  const normalized = category.toLowerCase();

  if (normalized.includes('training')) {
    return 'border-signal/18 bg-[linear-gradient(180deg,rgba(77,163,255,0.12),rgba(255,255,255,0.04))] text-slate-100';
  }

  if (normalized.includes('association')) {
    return 'border-globe/22 bg-[linear-gradient(180deg,rgba(52,211,153,0.14),rgba(255,255,255,0.04))] text-slate-100';
  }

  if (normalized.includes('vendor') || normalized.includes('expo')) {
    return 'border-accent/18 bg-[linear-gradient(180deg,rgba(229,201,143,0.12),rgba(77,163,255,0.06),rgba(255,255,255,0.03))] text-slate-100';
  }

  if (normalized.includes('webinar')) {
    return 'border-signal/16 bg-[linear-gradient(180deg,rgba(77,163,255,0.1),rgba(255,255,255,0.035))] text-slate-200';
  }

  return 'border-signal/22 bg-[linear-gradient(180deg,rgba(77,163,255,0.14),rgba(255,255,255,0.035),rgba(52,211,153,0.06))] text-white';
}

export function CalendarEventBlock({ event, compact = false, onSelect }: CalendarEventBlockProps) {
  const duration = getEventDurationDays(event);
  const isDominant = event.featured || duration > 1;
  const tone = getCategoryTone(event.category);
  const badgeText = event.featured ? 'Featured' : `${duration} days`;
  const showCompactBadge = compact ? event.featured : event.featured || duration > 1;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(event)}
      className={`group relative w-full overflow-hidden rounded-xl border text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-signal/45 ${
        compact
          ? `px-2.5 py-2 ${tone}`
          : `px-3 py-3 ${tone} ${isDominant ? 'min-h-[5.6rem]' : 'min-h-[4.25rem]'}`
      }`}
      title={event.title}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(77,163,255,0.14),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(52,211,153,0.12),transparent_22%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black/20 text-slate-300">
              <CategoryIcon category={event.category} className="h-3.5 w-3.5" />
            </span>
            {!compact ? <span className="truncate">{event.category}</span> : null}
          </div>
          <p
            className={`mt-2 ${
              compact ? 'line-clamp-4 text-[11px] font-medium leading-[1.22]' : 'line-clamp-2 text-sm font-semibold'
            } text-white`}
          >
            {event.title}
          </p>
        </div>
        {showCompactBadge && (
          <span
            className={`shrink-0 rounded-full border border-signal/30 bg-signal/10 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-signal2 ${
              compact ? 'max-w-[4.7rem] truncate' : ''
            }`}
            title={badgeText}
          >
            {badgeText}
          </span>
        )}
      </div>
      {!compact && (
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-white/10 bg-black/15 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-300">
            {event.city}
          </span>
        </div>
      )}
    </button>
  );
}
