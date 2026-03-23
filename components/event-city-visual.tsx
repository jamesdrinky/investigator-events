'use client';

import { useState } from 'react';
import { getCityHeroImageUrl } from '@/lib/utils/city-media';
import { LocationSpotlightImage } from '@/components/location-spotlight-image';

interface EventCityVisualProps {
  city: string;
  country: string;
  region: string;
  title?: string;
  className?: string;
}

export function EventCityVisual({ city, country, region, title, className = '' }: EventCityVisualProps) {
  const src = getCityHeroImageUrl(city);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <LocationSpotlightImage city={city} country={country} region={region} title={title} compact className={className} />;
  }

  return (
    <div className={`relative h-[11rem] overflow-hidden rounded-[1.45rem] border border-white/12 ${className}`}>
      <img src={src} alt={`${city} skyline`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" onError={() => setHasError(true)} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.05),rgba(4,8,16,0.18)_38%,rgba(4,8,16,0.86))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(54,168,255,0.12),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(41,211,163,0.1),transparent_22%)]" />
      <div className="relative flex h-full flex-col justify-between p-4">
        {title ? <p className="text-[10px] uppercase tracking-[0.24em] text-slate-200">{title}</p> : <span />}
        <div>
          <p className="font-[var(--font-serif)] text-3xl leading-none text-white">{city}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-200">{country}</p>
        </div>
      </div>
    </div>
  );
}
