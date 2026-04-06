import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';
import { EventsCircularGallery } from './EventsCircularGallery';

interface UpcomingEventsGalleryProps {
  events: EventItem[];
}

/* ── Mobile: horizontal scroll card ── */

function MobileEventCard({ event }: { event: EventItem }) {
  const slug = getEventSlug(event);

  return (
    <Link
      href={`/events/${slug}`}
      className="w-[16rem] flex-shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_16px_-6px_rgba(15,23,42,0.08)]"
    >
      <div className="h-28 w-full bg-gradient-to-br from-blue-50 to-indigo-100" />
      <div className="p-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-600">
          {formatEventDate(event)}
        </p>
        <h3 className="mt-1 text-sm font-semibold leading-tight text-slate-950 line-clamp-2">
          {event.title}
        </h3>
        <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
          {event.city}, {event.country}
        </p>
      </div>
    </Link>
  );
}

export function UpcomingEventsGallery({ events }: UpcomingEventsGalleryProps) {
  if (events.length === 0) return null;

  const galleryEvents = events.slice(0, 8);

  // Serialize minimal data for the client gallery
  const galleryItems = galleryEvents.map((event) => ({
    id: event.id,
    title: event.title,
    date: formatEventDate(event),
    city: event.city,
    country: event.country,
    slug: getEventSlug(event),
    association: event.association ?? event.organiser,
    coverImage: event.coverImage,
    region: event.region,
    category: event.category,
  }));

  return (
    <section className="relative py-10 sm:py-24">
      <div className="container-shell relative">
        <Reveal>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Coming Up</p>
              <h2 className="mt-2 text-[1.9rem] font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950 sm:mt-3 sm:text-5xl lg:text-[4rem]">
                Events on the horizon
              </h2>
            </div>
            <Link
              href="/calendar"
              className="btn-secondary w-full px-5 py-2.5 sm:w-auto sm:px-6 sm:py-3"
            >
              View full calendar
            </Link>
          </div>
        </Reveal>
      </div>

      {/* ── Mobile / Tablet: horizontal scroll ── */}
      <div className="mt-6 lg:hidden">
        <div
          className="flex gap-3 overflow-x-auto px-4 pb-4 sm:px-6"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {galleryEvents.map((event) => (
            <div key={event.id} style={{ scrollSnapAlign: 'start' }}>
              <MobileEventCard event={event} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop: 3D circular gallery ── */}
      <div className="relative mt-10 hidden lg:block">
        <EventsCircularGallery items={galleryItems} />
      </div>
    </section>
  );
}
