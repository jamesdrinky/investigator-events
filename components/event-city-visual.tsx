'use client';

import Image from 'next/image';
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
    <div className={`relative h-[11rem] overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-100 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.22)] ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[2px] bg-[linear-gradient(90deg,rgba(14,165,233,0.1),rgba(14,165,233,0.85),rgba(139,92,246,0.85),rgba(139,92,246,0.1))]" />
      <Image src={src} alt={`${city} skyline`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" onError={() => setHasError(true)} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(4,18,30,0.16)_38%,rgba(4,18,30,0.78))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(42,155,255,0.18),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(139,92,246,0.16),transparent_22%)]" />
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
