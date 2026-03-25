import Link from 'next/link';
import { CategoryIcon } from '@/components/category-icon';
import { EventCoverMedia } from '@/components/event-cover-media';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

interface EventCardProps {
  event: EventItem;
  priority?: 'featured' | 'default';
  isSignalActive?: boolean;
  onHoverChange?: (active: boolean) => void;
}

export function EventCard({ event, priority = 'default', isSignalActive = false, onHoverChange }: EventCardProps) {
  const hostLabel = event.association ?? event.organiser;
  const featured = priority === 'featured';

  return (
    <Link
      href={`/events/${getEventSlug(event)}`}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onFocus={() => onHoverChange?.(true)}
      onBlur={() => onHoverChange?.(false)}
      className={`group relative flex h-full w-full flex-col gap-4 overflow-hidden rounded-[1.15rem] border bg-white p-4 text-left shadow-[0_18px_44px_-28px_rgba(15,23,42,0.2)] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_30px_60px_-28px_rgba(15,23,42,0.24)] sm:p-5 ${
        isSignalActive
          ? 'border-sky-300 shadow-[0_28px_64px_-30px_rgba(14,165,233,0.28)]'
          : featured
            ? 'border-sky-100 hover:border-sky-300'
            : 'border-slate-200 hover:border-sky-200'
      }`}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(14,165,233,0),rgba(14,165,233,0.8),rgba(139,92,246,0.8),rgba(139,92,246,0))] ${featured ? 'opacity-100' : 'opacity-75'}`} />
      {featured ? (
        <div className="pointer-events-none absolute -left-8 top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.16),transparent_72%)]" />
      ) : null}
      <EventCoverMedia
        title={event.title}
        city={event.city}
        country={event.country}
        region={event.region}
        category={event.category}
        coverImage={event.coverImage}
        coverImageAlt={event.coverImageAlt}
        associationName={hostLabel}
        featured={event.featured}
        compact
        className={featured ? 'h-[13.75rem] rounded-[0.95rem] sm:h-[15rem]' : 'h-[12.25rem] rounded-[0.95rem] sm:h-[12.75rem]'}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          <span className="text-sky-700">{formatEventDate(event)}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{event.category}</span>
        </div>

        <div className="min-w-0">
          <h3
            className={`font-semibold leading-[1.08] tracking-[-0.04em] text-slate-950 transition-colors duration-200 group-hover:text-sky-700 ${
              featured ? 'text-[1.55rem] sm:text-[1.75rem]' : 'text-[1.35rem] sm:text-[1.5rem]'
            }`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {event.title}
          </h3>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-slate-900">
          {event.city}, {event.country}
        </p>
        <p className="text-sm text-slate-500">{hostLabel}</p>
      </div>

      <p
        className="text-sm leading-relaxed text-slate-600"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {event.description || 'Open the event record for dates, organiser details, official links, and save-the-date options.'}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
          <CategoryIcon category={event.category} className="h-3.5 w-3.5" />
          {event.category}
        </span>
        <span className="inline-flex items-center text-sm font-semibold text-sky-700">
          <span className="border-b border-transparent transition duration-200 group-hover:border-sky-300">View event</span>
          <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
