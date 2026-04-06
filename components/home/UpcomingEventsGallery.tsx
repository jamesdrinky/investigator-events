import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { ExpandingEventCards, type ExpandingEventItem } from './ExpandingEventCards';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

interface UpcomingEventsGalleryProps {
  events: EventItem[];
}

function serializeEvents(events: EventItem[]): ExpandingEventItem[] {
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    date: formatEventDate(e),
    city: e.city,
    country: e.country,
    region: e.region,
    category: e.category,
    slug: getEventSlug(e),
    association: e.association ?? e.organiser,
    coverImage: e.coverImage,
    description: e.description || undefined,
  }));
}

export function UpcomingEventsGallery({ events }: UpcomingEventsGalleryProps) {
  if (events.length === 0) return null;

  const items = serializeEvents(events.slice(0, 6));

  return (
    <section className="relative py-20 sm:py-24">
      <div className="container-shell relative">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Coming Up</p>
              <h2 className="mt-3 text-[2.4rem] font-semibold leading-[0.94] tracking-[-0.05em] text-slate-950 sm:mt-3 sm:text-5xl lg:text-[4rem]">
                Next on the calendar
              </h2>
            </div>
            <Link
              href="/calendar"
              className="btn-secondary w-full px-5 py-3 sm:w-auto sm:px-6 sm:py-3"
            >
              View full calendar
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 sm:mt-10">
          <ExpandingEventCards items={items} />
        </div>
      </div>
    </section>
  );
}
