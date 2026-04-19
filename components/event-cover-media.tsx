'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AssociationLogoBadge } from '@/components/association-logo-badge';
import { getAssociationBrandLogoSrc } from '@/lib/utils/association-branding';

interface EventCoverMediaProps {
  title: string;
  city: string;
  country: string;
  region: string;
  category?: string;
  imagePath?: string;
  coverImage?: string;
  coverImageAlt?: string;
  className?: string;
  compact?: boolean;
  priorityLabel?: string;
  associationName?: string;
  featured?: boolean;
  hideMeta?: boolean;
}

type BadgeTreatment = {
  tone: 'light' | 'dark';
  position: 'left' | 'right';
};

function getRegionBrightness(data: Uint8ClampedArray, width: number, height: number, startX: number, endX: number) {
  const sampleHeight = Math.max(6, Math.floor(height * 0.34));
  let total = 0;
  let count = 0;

  for (let y = 0; y < sampleHeight; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * width + x) * 4;
      const r = data[index] ?? 0;
      const g = data[index + 1] ?? 0;
      const b = data[index + 2] ?? 0;
      total += r * 0.299 + g * 0.587 + b * 0.114;
      count += 1;
    }
  }

  return count > 0 ? total / count : 255;
}

function resolveBadgeTreatment(image: HTMLImageElement): BadgeTreatment {
  try {
    const canvas = document.createElement('canvas');
    const width = 48;
    const height = 28;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return { tone: 'light', position: 'left' };
    }

    context.drawImage(image, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    const leftBrightness = getRegionBrightness(data, width, height, 0, Math.floor(width * 0.34));
    const rightBrightness = getRegionBrightness(data, width, height, Math.floor(width * 0.66), width);
    const useLeft = leftBrightness <= rightBrightness;
    const chosenBrightness = useLeft ? leftBrightness : rightBrightness;

    return {
      tone: chosenBrightness < 152 ? 'light' : 'dark',
      position: useLeft ? 'left' : 'right'
    };
  } catch {
    return { tone: 'light', position: 'left' };
  }
}

export function EventCoverMedia({
  title,
  city,
  country,
  region,
  category,
  imagePath,
  coverImage,
  coverImageAlt,
  className = '',
  compact = false,
  priorityLabel,
  associationName,
  featured = false,
  hideMeta = false
}: EventCoverMediaProps) {
  const [hasError, setHasError] = useState(false);
  const [badgeTreatment, setBadgeTreatment] = useState<BadgeTreatment>({ tone: 'light', position: 'left' });
  const isOnline = /^online/i.test(city.trim());
  const onlineLogoSrc = isOnline && associationName ? getAssociationBrandLogoSrc(associationName) : undefined;
  const safeCoverImage = coverImage && /^(\/(cities|events|images)\/|https?:\/\/)/.test(coverImage) ? coverImage : undefined;
  const resolvedImagePath = imagePath && /^(\/(cities|events|images)\/|https?:\/\/)/.test(imagePath) ? imagePath : undefined;
  const imageSrc = hasError ? '/cities/fallback.jpg' : resolvedImagePath ?? safeCoverImage ?? '/cities/fallback.jpg';

  return (
    <div
      className={`group/media relative overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-100 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.22)] transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:shadow-[0_30px_64px_-28px_rgba(15,23,42,0.3)] ${
        compact ? 'h-[13rem] sm:h-[13.5rem]' : 'h-[18rem] sm:h-[20rem]'
      } ${className}`}
    >
      {isOnline && onlineLogoSrc ? (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_40%,#0f172a_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(124,58,237,0.12),transparent_50%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:h-28 sm:w-28 sm:p-6">
              <Image src={onlineLogoSrc} alt={associationName ?? ''} width={96} height={96} className="h-auto max-h-16 w-auto object-contain brightness-0 invert sm:max-h-20" />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(255,255,255,0.5)_1px,rgba(255,255,255,0.5)_2px)]" />
        </>
      ) : (
        <Image
          src={imageSrc}
          alt={coverImageAlt ?? title}
          fill
          className="object-cover transition duration-700 ease-out group-hover/media:scale-[1.05]"
          onError={() => setHasError(true)}
          onLoad={(event) => setBadgeTreatment(resolveBadgeTreatment(event.currentTarget))}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.14),rgba(2,6,23,0)_28%,rgba(2,6,23,0.24)_54%,rgba(2,6,23,0.82))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[56%] bg-[linear-gradient(180deg,rgba(2,6,23,0),rgba(15,23,42,0.16)_18%,rgba(15,23,42,0.88))]" />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover/media:opacity-100 bg-[radial-gradient(circle_at_16%_14%,rgba(37,99,235,0.16),transparent_24%),radial-gradient(circle_at_84%_10%,rgba(124,58,237,0.12),transparent_20%)]" />

      <div
        className={`absolute top-3 z-10 sm:top-4 ${
          badgeTreatment.position === 'left' ? 'left-3 sm:left-4' : 'right-3 sm:right-4'
        }`}
      >
        <AssociationLogoBadge
          associationName={associationName}
          compact
          tone={badgeTreatment.tone}
          overlay
          className="max-w-[9.5rem] shadow-[0_12px_30px_-18px_rgba(15,23,42,0.32)] sm:max-w-[10.5rem]"
        />
      </div>
      <div
        className={`absolute top-3 z-10 sm:top-4 ${
          badgeTreatment.position === 'left' ? 'right-3 sm:right-4' : 'left-3 sm:left-4'
        }`}
      >
        <span className="rounded-full border border-white/70 bg-white/88 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.32)] backdrop-blur-md sm:px-3 sm:text-[10px]">
          {featured ? 'Featured' : priorityLabel ?? category ?? city}
        </span>
      </div>
      {!hideMeta ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">{region}</p>
            <p className="truncate text-sm font-semibold text-white sm:text-base">
              {city}, {country}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
