'use client';

import { useState } from 'react';
import { AssociationLogoBadge } from '@/components/association-logo-badge';
import { EventCityVisual } from '@/components/event-city-visual';

interface EventCoverMediaProps {
  title: string;
  city: string;
  country: string;
  region: string;
  category?: string;
  coverImage?: string;
  coverImageAlt?: string;
  className?: string;
  compact?: boolean;
  priorityLabel?: string;
  associationName?: string;
  featured?: boolean;
}

export function EventCoverMedia({
  title,
  city,
  country,
  region,
  category,
  coverImage,
  coverImageAlt,
  className = '',
  compact = false,
  priorityLabel,
  associationName,
  featured = false
}: EventCoverMediaProps) {
  const [hasError, setHasError] = useState(false);
  const safeCoverImage =
    coverImage && /^(\/(cities|events|images)\/|https?:\/\/)/.test(coverImage) ? coverImage : undefined;

  if (!safeCoverImage || hasError) {
    return (
      <EventCityVisual
        city={city}
        country={country}
        region={region}
        title={priorityLabel ?? category ?? title}
        associationName={associationName}
        className={className}
      />
    );
  }

  return (
    <div
      className={`group/media relative overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-100 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.22)] transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:shadow-[0_28px_56px_-28px_rgba(15,23,42,0.26)] ${
        compact ? 'h-[13rem] sm:h-[13.5rem]' : 'h-[18rem] sm:h-[20rem]'
      } ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[1rem] ring-1 ring-white/40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[2px] bg-[linear-gradient(90deg,rgba(14,165,233,0.1),rgba(14,165,233,0.9),rgba(139,92,246,0.9),rgba(139,92,246,0.1))]" />
      <img
        src={safeCoverImage}
        alt={coverImageAlt ?? `${title} cover image`}
        className="h-full w-full object-cover transition duration-500 ease-out group-hover/media:scale-[1.02]"
        onError={() => setHasError(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02),rgba(2,6,23,0)_48%,rgba(2,6,23,0.08))]" />

      <div className="absolute left-3 top-3 z-10 sm:left-4 sm:top-4">
        <AssociationLogoBadge associationName={associationName} compact className="max-w-[9rem] sm:max-w-[10.5rem]" />
      </div>
      <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
        <span className="rounded-full border border-white/80 bg-white/92 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.32)] backdrop-blur-sm sm:px-3 sm:text-[10px]">
          {featured ? 'Featured' : priorityLabel ?? category ?? city}
        </span>
      </div>
    </div>
  );
}
