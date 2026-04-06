import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { LampSection } from '@/components/ui/lamp-effect';
import { FeaturedEventsCarousel, type FeaturedEventCard } from './FeaturedEventsCarousel';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

interface FeaturedEventsSectionProps {
  events: EventItem[];
}

export function FeaturedEventsSection({ events }: FeaturedEventsSectionProps) {
  if (events.length === 0) return null;

  const cards: FeaturedEventCard[] = events.slice(0, 8).map((event) => ({
    id: event.id,
    title: event.title,
    date: formatEventDate(event),
    city: event.city,
    country: event.country,
    region: event.region,
    slug: getEventSlug(event),
    association: event.association ?? event.organiser,
    coverImage: event.coverImage,
    description: event.description || undefined,
  }));

  return (
    <LampSection className="pb-20 pt-0 sm:pb-24">
      {/* Heading */}
      <Reveal>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-400 sm:text-xs">
            Featured Events
          </p>
          <h2 className="mt-5 text-[2.4rem] font-semibold leading-[0.94] tracking-[-0.05em] text-white sm:text-5xl lg:text-[4.2rem]">
            Featured events worth planning around.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-200/50">
            Key conferences, AGMs, and training events handpicked from the calendar.
          </p>
          <Link
            href="/calendar"
            className="btn-outline-light mt-6 inline-flex px-6 py-3 text-sm sm:mt-8"
          >
            Browse all events
          </Link>
        </div>
      </Reveal>

      {/* Carousel */}
      <div className="mt-12 w-full max-w-7xl sm:mt-14">
        <FeaturedEventsCarousel items={cards} />
      </div>
    </LampSection>
  );
}
