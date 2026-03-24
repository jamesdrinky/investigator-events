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
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_18%_16%,rgba(42,155,255,0.12),transparent_30%),radial-gradient(circle_at_50%_78%,rgba(34,197,94,0.08),transparent_30%)]" />

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
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          <CategoryIcon category={event.category} className="h-3.5 w-3.5" />
          {event.category}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-700">
          <span>{getCountryFlag(event.country)}</span>
          <span>{event.country}</span>
        </span>
      </div>

      <div className="relative">
        <h3 className="text-xl font-semibold leading-tight text-slate-950 transition-colors duration-300 group-hover:text-sky-700">{event.title}</h3>
        <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-sky-700">{formatEventDate(event)}</p>
        <p className="mt-3 text-base font-medium text-slate-900">
          {event.city}
          <span className="ml-2 text-sm font-normal text-slate-500">{event.country}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="global-chip bg-sky-100 text-sky-700">{event.region}</span>
          <span className="city-chip">{event.association ?? event.organiser}</span>
          {event.featured ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-700">Featured</span> : null}
        </div>
      </div>

      {event.description ? (
        <p className="relative text-sm leading-relaxed text-slate-600">{event.description}</p>
      ) : (
        <p className="relative text-sm leading-relaxed text-slate-600">
          Open the event record for organiser details, dates, and the official source link.
        </p>
      )}
      <div className="relative flex items-center justify-between gap-3 text-sm">
        <p className="text-slate-500">Hosted by {event.association ?? event.organiser}</p>
        <span className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">Open event</span>
      </div>
    </>
  );

  const className =
    'group relative flex w-full flex-col gap-4 overflow-hidden rounded-[1.8rem] border border-sky-100 bg-white p-4 text-left shadow-[0_20px_40px_-32px_rgba(15,23,42,0.22)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_26px_50px_-30px_rgba(42,155,255,0.2)] sm:p-5';

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
