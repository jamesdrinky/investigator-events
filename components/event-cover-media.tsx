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
      className={`group/media relative overflow-hidden rounded-[1.7rem] border border-white/70 bg-slate-100 shadow-[0_30px_70px_-44px_rgba(22,104,255,0.34)] ${
        compact ? 'h-[12rem]' : 'h-[18rem] sm:h-[20rem]'
      } ${className}`}
    >
      <img
        src={safeCoverImage}
        alt={coverImageAlt ?? `${title} cover image`}
        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.05] group-hover/media:scale-[1.04]"
        onError={() => setHasError(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(9,17,31,0.02),rgba(9,17,31,0.12)_34%,rgba(5,12,22,0.78))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(22,104,255,0.22),transparent_26%),radial-gradient(circle_at_82%_24%,rgba(20,184,255,0.16),transparent_22%),radial-gradient(circle_at_68%_88%,rgba(100,91,255,0.14),transparent_26%)]" />

      <div className="absolute left-4 top-4 z-10">
        <AssociationLogoBadge associationName={associationName} compact={compact} />
      </div>
      <div className="absolute right-4 top-4 z-10">
        <span className="rounded-full border border-white/40 bg-[linear-gradient(135deg,rgba(22,104,255,0.92),rgba(20,184,255,0.9),rgba(100,91,255,0.88))] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_28px_-18px_rgba(22,104,255,0.52)]">
          {featured ? 'Featured' : priorityLabel ?? category ?? city}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(to_top,rgba(4,12,22,0.95),rgba(4,12,22,0.26),transparent)]" />
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className={`truncate font-[var(--font-serif)] leading-none text-white ${compact ? 'text-3xl' : 'text-4xl sm:text-5xl'}`}>
            {city}
          </p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-100">{country}</p>
        </div>
      </div>
    </div>
  );
}
