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
      className={`relative overflow-hidden rounded-[1.45rem] border border-sky-100/70 bg-slate-100 ${compact ? 'h-[11rem]' : 'h-[16rem] sm:h-[18rem]'} ${className}`}
    >
      <img
        src={safeCoverImage}
        alt={coverImageAlt ?? `${title} cover image`}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        onError={() => setHasError(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(4,18,30,0.08)_34%,rgba(4,18,30,0.7))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(42,155,255,0.16),transparent_28%),radial-gradient(circle_at_82%_24%,rgba(26,215,241,0.12),transparent_24%)]" />

      <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap items-start gap-2">
        <span className="rounded-full border border-white/60 bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
          {featured ? 'Featured' : priorityLabel ?? category ?? city}
        </span>
      </div>
      <div className="pointer-events-none absolute right-4 top-4">
        <AssociationLogoBadge associationName={associationName} compact={compact} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(to_top,rgba(3,16,24,0.92),rgba(3,16,24,0.3),transparent)]" />
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className={`font-[var(--font-serif)] leading-none text-white ${compact ? 'text-3xl' : 'text-4xl sm:text-5xl'}`}>{city}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-100">{country}</p>
        </div>
      </div>
    </div>
  );
}
