'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { EventItem } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';
import { getAssociationBrandLogoSrc } from '@/lib/utils/association-branding';
import { EventCardAttendees } from '@/components/EventCardAttendees';

interface EventCardProps {
  event: EventItem;
  priority?: 'hero' | 'featured' | 'default';
  isSignalActive?: boolean;
  onHoverChange?: (active: boolean) => void;
}

export function EventCard({ event, priority = 'default', isSignalActive = false, onHoverChange }: EventCardProps) {
  const hostLabel = event.association ?? event.organiser;
  const logoSrc = getAssociationBrandLogoSrc(hostLabel);
  const hero = priority === 'hero';
  const featured = priority === 'featured' || hero;
  const description = event.description?.trim();

  const safeCoverImage = event.coverImage && /^(\/(cities|events|images)\/|https?:\/\/)/.test(event.coverImage) ? event.coverImage : undefined;
  const imageSrc = event.image_path && /^(\/(cities|events|images)\/|https?:\/\/)/.test(event.image_path) ? event.image_path : safeCoverImage ?? '/cities/fallback.jpg';

  return (
    <Link
      href={`/events/${getEventSlug(event)}`}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 ${
        isSignalActive
          ? 'border-blue-300 shadow-[0_20px_50px_-16px_rgba(59,130,246,0.25)]'
          : 'border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_50px_-16px_rgba(59,130,246,0.15)]'
      }`}
    >
      {/* ── Cover image with logo + date badge ── */}
      <div className={`relative w-full overflow-hidden ${hero ? 'h-52 sm:h-64' : featured ? 'h-44 sm:h-52' : 'h-40 sm:h-48'}`}>
        <Image
          src={imageSrc}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Dark gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Association logo — top-left, BIG */}
        {logoSrc ? (
          <div className="absolute left-3 top-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/90 p-1.5 shadow-lg sm:left-4 sm:top-4 sm:h-14 sm:w-14 sm:p-2">
            <Image
              src={logoSrc}
              alt={hostLabel}
              width={48}
              height={48}
              className="h-auto max-h-8 w-auto max-w-8 object-contain sm:max-h-10 sm:max-w-10"
            />
          </div>
        ) : (
          <div className="absolute left-3 top-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/90 shadow-lg sm:left-4 sm:top-4 sm:h-14 sm:w-14">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{hostLabel.slice(0, 3)}</span>
          </div>
        )}

        {/* Date badge — top-right */}
        <div className="absolute right-3 top-3 rounded-lg bg-white/90 px-2.5 py-1.5 shadow-lg sm:right-4 sm:top-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 sm:text-[11px]">{formatEventDate(event)}</p>
        </div>

        {/* Title over image — bottom */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <h3
            title={event.title}
            className={`font-bold leading-tight text-white ${hero ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {event.title}
          </h3>
        </div>
      </div>

      {/* ── Details below image ── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Location + category tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
            {event.city}, {event.country}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-600">
            {event.category}
          </span>
        </div>

        {/* Description (featured/hero only) */}
        {description && featured ? (
          <p className="text-sm leading-relaxed text-slate-500 line-clamp-2">{description}</p>
        ) : null}

        {/* Attendees + CTA */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <EventCardAttendees eventId={event.id} />
          <span className="text-sm font-semibold text-blue-600 transition group-hover:text-blue-500">
            View event <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
