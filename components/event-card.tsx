import Link from 'next/link';
import { CategoryIcon } from '@/components/category-icon';
import { EventCoverMedia } from '@/components/event-cover-media';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';
import { getCountryFlag } from '@/lib/utils/location';

interface EventCardProps {
  event: EventItem;
  onSelect?: (event: EventItem) => void;
}

export function EventCard({ event, onSelect }: EventCardProps) {
  const cardContent = (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_18%_16%,rgba(54,168,255,0.12),transparent_30%),radial-gradient(circle_at_50%_78%,rgba(29,214,202,0.08),transparent_30%)]" />

      <EventCoverMedia
        title={event.title}
        city={event.city}
        country={event.country}
        region={event.region}
        category={event.category}
        coverImage={event.coverImage}
        coverImageAlt={event.coverImageAlt}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-signal/24 bg-signal/10 px-3 py-1 text-xs font-medium text-signal2">
          <CategoryIcon category={event.category} className="h-3.5 w-3.5" />
          {event.category}
        </span>
        <span className="country-chip">
          <span>{getCountryFlag(event.country)}</span>
          <span>{event.country}</span>
        </span>
      </div>

      <div className="relative">
        <h3 className="text-xl font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-signal2">{event.title}</h3>
        <p className="mt-3 text-sm uppercase tracking-[0.16em] text-slate-300">{formatEventDate(event)}</p>
        <p className="mt-3 text-base font-medium text-white">
          {event.city}
          <span className="ml-2 text-sm font-normal text-slate-400">{event.country}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="global-chip">{event.region}</span>
          <span className="city-chip">{event.association ?? event.organiser}</span>
        </div>
      </div>

      {event.description ? (
        <p className="relative text-sm leading-relaxed text-slate-300">{event.description}</p>
      ) : (
        <p className="relative text-sm leading-relaxed text-slate-300">
          Open the event record for organiser details, dates, and the official source link.
        </p>
      )}
      <div className="relative flex items-center justify-between gap-3 text-sm">
        <p className="text-slate-400">Organiser: {event.organiser}</p>
        <span className="text-xs uppercase tracking-[0.18em] text-slate-500 group-hover:text-slate-300">Open event</span>
      </div>
    </>
  );

  const className =
    'group lux-panel relative flex w-full flex-col gap-4 overflow-hidden p-4 sm:p-5 text-left transition duration-500 hover:-translate-y-1 hover:scale-[1.01] hover:border-signal/35 hover:shadow-[0_28px_60px_-40px_rgba(54,168,255,0.28)]';

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(event)}
        className={className}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link
      href={`/events/${getEventSlug(event)}`}
      className={className}
    >
      {cardContent}
    </Link>
  );
}
