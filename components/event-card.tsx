'use client';

import Link from 'next/link';
import { EventCoverMedia } from '@/components/event-cover-media';
import { FeaturedEventMiniMap } from '@/components/featured-event-mini-map';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

interface EventCardProps {
  event: EventItem;
  priority?: 'hero' | 'featured' | 'default';
  isSignalActive?: boolean;
  onHoverChange?: (active: boolean) => void;
}

export function EventCard({ event, priority = 'default', isSignalActive = false, onHoverChange }: EventCardProps) {
  const hostLabel = event.association ?? event.organiser;
  const featured = priority === 'featured' || priority === 'hero';
  const hero = priority === 'hero';
  const mobileDefault = priority === 'default';
  const description = event.description?.trim();

  return (
    <Link
      href={`/events/${getEventSlug(event)}`}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onFocus={() => onHoverChange?.(true)}
      onBlur={() => onHoverChange?.(false)}
      className={`group relative flex h-full w-full overflow-hidden border bg-white text-left transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:scale-[1.01] ${
        mobileDefault ? 'flex-row rounded-[1rem] sm:flex-col sm:rounded-[1.4rem]' : 'flex-col rounded-[1.2rem] sm:rounded-[1.4rem]'
      } ${
        isSignalActive
          ? 'border-sky-300 shadow-[0_28px_80px_-40px_rgba(14,165,233,0.34),0_0_26px_rgba(99,102,241,0.12)]'
          : featured
            ? 'border-slate-200 shadow-[0_24px_62px_-38px_rgba(15,23,42,0.22)] hover:border-sky-200 hover:shadow-[0_34px_86px_-40px_rgba(15,23,42,0.3),0_0_28px_rgba(56,189,248,0.12)]'
            : 'border-slate-200 shadow-[0_16px_42px_-34px_rgba(15,23,42,0.16)] hover:border-sky-100 hover:shadow-[0_26px_62px_-38px_rgba(15,23,42,0.22),0_0_22px_rgba(56,189,248,0.1)]'
      }`}
    >
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
        hideMeta
        className={
          hero
            ? 'h-[14.5rem] rounded-b-none rounded-t-[1.05rem] border-x-0 border-t-0 sm:h-[19rem] sm:rounded-t-[1.25rem] lg:h-[20rem]'
            : featured
              ? 'h-[12rem] rounded-b-none rounded-t-[1rem] border-x-0 border-t-0 sm:h-[16rem] sm:rounded-t-[1.2rem]'
              : 'h-auto w-[6.9rem] shrink-0 rounded-l-[1rem] rounded-r-none border-b-0 border-l-0 border-r border-t-0 sm:h-[14.5rem] sm:w-auto sm:rounded-b-none sm:rounded-t-[1.1rem] sm:border-r-0 sm:border-t-0'
        }
      />

      <div className={`${hero ? 'flex flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-6' : mobileDefault ? 'flex flex-1 flex-col gap-2.5 p-3 sm:gap-3.5 sm:p-5' : 'flex flex-1 flex-col gap-3 p-3.5 sm:gap-3.5 sm:p-5'}`}>
        <div className={`${hero ? 'flex min-w-0 flex-1 flex-col gap-3 sm:gap-4' : mobileDefault ? 'flex min-w-0 flex-1 flex-col gap-2 sm:gap-3.5' : 'flex min-w-0 flex-1 flex-col gap-3 sm:gap-3.5'}`}>
          {mobileDefault ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700 sm:hidden">{formatEventDate(event)}</p>
          ) : null}
          <h3
            className={`text-slate-950 transition-colors duration-200 group-hover:text-sky-700 ${
              hero ? 'text-[1.55rem] font-semibold leading-[1.06] tracking-[-0.045em] sm:text-[1.85rem]' : featured ? 'text-[1.24rem] font-semibold leading-[1.1] tracking-[-0.04em] sm:text-[1.42rem]' : 'text-[1rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[1.28rem] sm:leading-[1.12] sm:tracking-[-0.035em]'
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

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:gap-x-2.5 sm:text-[11px] sm:tracking-[0.16em]">
            <span className={`${mobileDefault ? 'hidden sm:inline text-sky-700' : 'text-sky-700'}`}>{formatEventDate(event)}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{event.city}, {event.country}</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
            <span className="hidden sm:inline">{event.region}</span>
          </div>

          {description ? (
            <p
              className={`${hero || featured ? 'text-sm leading-6 text-slate-600' : 'hidden text-sm leading-6 text-slate-600 sm:block'}`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: hero ? 3 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {description}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className={`rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 ${mobileDefault ? 'max-w-full truncate' : ''}`}>
              {hostLabel}
            </span>
            <span className="hidden rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700 sm:inline-flex">
              {event.category}
            </span>
          </div>

          <div className="mt-auto pt-0.5 sm:pt-1">
            <span className="inline-flex items-center text-[0.92rem] font-semibold text-sky-700 transition duration-300 group-hover:text-sky-600 sm:text-sm">
              {mobileDefault ? 'Open event' : 'Explore event'}
              <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1.5">→</span>
            </span>
          </div>
        </div>

        {hero ? <FeaturedEventMiniMap city={event.city} country={event.country} region={event.region} className="mt-1 hidden h-[20rem] w-full lg:block xl:h-[20.5rem]" /> : null}
      </div>
    </Link>
  );
}
