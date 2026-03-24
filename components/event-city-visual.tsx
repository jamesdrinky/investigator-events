'use client';

import { useState } from 'react';
import { AssociationLogoBadge } from '@/components/association-logo-badge';
import { getCityHeroImageUrl } from '@/lib/utils/city-media';
import { LocationSpotlightImage } from '@/components/location-spotlight-image';

interface EventCityVisualProps {
  city: string;
  country: string;
  region: string;
  title?: string;
  associationName?: string;
  className?: string;
}

export function EventCityVisual({ city, country, region, title, associationName, className = '' }: EventCityVisualProps) {
  const src = getCityHeroImageUrl(city);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <LocationSpotlightImage
        city={city}
        country={country}
        region={region}
        title={title}
        associationName={associationName}
        compact
        className={className}
      />
    );
  }

  return (
    <div className={`relative h-[11rem] overflow-hidden rounded-[1.45rem] border border-sky-100/80 bg-slate-100 ${className}`}>
      <img src={src} alt={`${city} skyline`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" onError={() => setHasError(true)} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(4,18,30,0.16)_38%,rgba(4,18,30,0.78))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(42,155,255,0.12),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(34,197,94,0.1),transparent_22%)]" />
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          {title ? <p className="text-[10px] uppercase tracking-[0.24em] text-slate-100">{title}</p> : <span />}
          <AssociationLogoBadge associationName={associationName} compact className="max-w-[10rem]" />
        </div>
        <div>
          <p className="font-[var(--font-serif)] text-3xl leading-none text-white">{city}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-100">{country}</p>
        </div>
      </div>
    </div>
  );
}
