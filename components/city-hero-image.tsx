'use client';

import { useState } from 'react';
import { getCityHeroImageUrl } from '@/lib/utils/city-media';

interface CityHeroImageProps {
  city: string;
  country: string;
  region: string;
  title?: string;
  compact?: boolean;
  className?: string;
}

export function CityHeroImage({ city, country, region, title, compact = false, className = '' }: CityHeroImageProps) {
  const src = getCityHeroImageUrl(city);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[1.8rem] border border-white/12 ${compact ? 'h-[11rem]' : 'h-[16rem] sm:h-[18rem]'} ${className}`}
    >
      <img
        src={src}
        alt={`${city} event hero`}
        className="h-full w-full object-cover"
        onError={() => setHasError(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,16,24,0.04),rgba(3,16,24,0.18)_38%,rgba(3,16,24,0.74))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(77,163,255,0.18),transparent_24%)]" />

      <div className="relative flex h-full flex-col justify-end p-4 sm:p-5">
        {title ? <p className="text-[11px] uppercase tracking-[0.24em] text-slate-200">{title}</p> : null}
        <p className={`mt-2 font-[var(--font-serif)] leading-none text-white ${compact ? 'text-3xl' : 'text-4xl sm:text-5xl'}`}>{city}</p>
        <p className="mt-2 text-sm text-slate-200">{country}</p>
      </div>
    </div>
  );
}
