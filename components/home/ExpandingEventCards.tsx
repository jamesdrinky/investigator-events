'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import { getAssociationBrandLogoSrc, shouldInvertLogoOnLight } from '@/lib/utils/association-branding';

export interface ExpandingEventItem {
  id: string;
  title: string;
  date: string;
  city: string;
  country: string;
  region: string;
  category: string;
  slug: string;
  association: string;
  coverImage?: string;
  description?: string;
}

/**
 * Horizontal scrolling event preview. Replaces the previous accordion
 * (which had the spazz-out bug where focus events triggered active-state
 * changes as the user scrolled, opening and closing cards rapidly).
 * Each card here is a fixed-size proper preview — no layout shifts on
 * interaction, no overlapping text states.
 */
export function ExpandingEventCards({ items }: { items: ExpandingEventItem[] }) {
  if (items.length === 0) return null;

  const safeSrc = (src?: string) =>
    src && /^(\/(cities|events|images)\/|https?:\/\/)/.test(src) ? src : '/cities/fallback.jpg';

  return (
    <div
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:gap-5 sm:px-0"
      style={{ scrollbarWidth: 'none' }}
    >
      {items.map((item) => {
        const logoSrc = getAssociationBrandLogoSrc(item.association);
        const invertLogo = shouldInvertLogoOnLight(item.association);

        return (
          <Link
            key={item.id}
            href={`/events/${item.slug}`}
            className="group relative block flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] transition active:scale-[0.98] sm:rounded-3xl"
            style={{ width: 'min(78vw, 320px)' }}
          >
            <div className="relative aspect-[5/4] w-full overflow-hidden bg-slate-100">
              <Image
                src={safeSrc(item.coverImage)}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 78vw, 320px"
                className="object-cover transition-transform duration-500 group-active:scale-[1.02] sm:group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {logoSrc && (
                <div className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white/95 p-1.5 shadow-md sm:h-12 sm:w-12 sm:p-2">
                  <Image
                    src={logoSrc}
                    alt={item.association}
                    width={40}
                    height={40}
                    className={`h-auto max-h-7 w-auto max-w-7 object-contain sm:max-h-8 sm:max-w-8 ${invertLogo ? 'brightness-0' : ''}`}
                  />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-1.5 p-3 sm:p-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  <Calendar className="h-2.5 w-2.5" /> {item.date}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  <MapPin className="h-2.5 w-2.5" /> {item.city}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <h3 className="line-clamp-2 text-base font-bold leading-tight text-slate-900 sm:text-lg">
                {item.title}
              </h3>
              {item.description && (
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
                  {item.description}
                </p>
              )}
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition group-hover:gap-2">
                View event <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
