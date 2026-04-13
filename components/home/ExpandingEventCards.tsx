'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { getAssociationBrandLogoSrc } from '@/lib/utils/association-branding';

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

export function ExpandingEventCards({ items }: { items: ExpandingEventItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const gridStyle = useMemo(() => {
    if (isDesktop) {
      return {
        gridTemplateColumns: items.map((_, i) => (i === activeIndex ? '5fr' : '1fr')).join(' '),
        gridTemplateRows: '1fr',
      };
    }
    return {
      gridTemplateColumns: '1fr',
      gridTemplateRows: items.map((_, i) => (i === activeIndex ? '4fr' : 'minmax(70px, 1fr)')).join(' '),
    };
  }, [activeIndex, items.length, isDesktop]);

  const safeSrc = (src?: string) =>
    src && /^(\/(cities|events|images)\/|https?:\/\/)/.test(src) ? src : '/cities/fallback.jpg';

  return (
    <ul
      className="grid w-full gap-2"
      style={{
        ...gridStyle,
        height: isDesktop ? '480px' : 'min(520px, 70vh)',
        transition: 'grid-template-columns 0.45s cubic-bezier(0.4,0,0.2,1), grid-template-rows 0.45s cubic-bezier(0.4,0,0.2,1)',
        willChange: 'grid-template-columns, grid-template-rows',
        contain: 'layout style',
      }}
    >
      {items.map((item, index) => {
        const active = activeIndex === index;
        const logoSrc = getAssociationBrandLogoSrc(item.association);

        return (
          <li
            key={item.id}
            className="group relative min-h-0 min-w-0 cursor-pointer overflow-hidden rounded-2xl md:min-w-[60px]"
            data-active={active}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => setActiveIndex(index)}
            tabIndex={0}
            onFocus={() => setActiveIndex(index)}
            style={{
              border: active ? '2px solid rgba(99, 102, 241, 0.6)' : '1px solid rgba(226, 232, 240, 0.25)',
              boxShadow: active
                ? '0 0 24px rgba(99, 102, 241, 0.35), 0 0 60px rgba(139, 92, 246, 0.15)'
                : 'none',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            {/* Background image — always colourful, no grayscale */}
            <img
              src={safeSrc(item.coverImage)}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out group-data-[active=true]:scale-100 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            {/* Association logo — top-left, always visible */}
            {logoSrc && (
              <div className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/90 p-1.5 shadow-lg sm:h-12 sm:w-12 sm:p-2">
                <Image src={logoSrc} alt={item.association} width={40} height={40} className="h-auto max-h-7 w-auto max-w-7 object-contain sm:max-h-8 sm:max-w-8" />
              </div>
            )}

            {/* Collapsed: rotated title (desktop only) — use simple opacity, no layout shift */}
            <div
              className="pointer-events-none absolute bottom-4 left-4 hidden md:block"
              style={{
                opacity: active ? 0 : 0.7,
                transition: 'opacity 0.3s ease',
                transformOrigin: 'bottom left',
                transform: 'rotate(-90deg) translateX(-100%)',
              }}
            >
              <span className="whitespace-nowrap text-xs font-medium uppercase tracking-widest text-white">
                {item.title}
              </span>
            </div>

            {/* Expanded: full details — fade in/out cleanly */}
            <div
              className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5"
              style={{
                opacity: active ? 1 : 0,
                transition: 'opacity 0.35s ease',
                pointerEvents: active ? 'auto' : 'none',
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white/90">
                  <Calendar className="h-3 w-3" /> {item.date}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white/90">
                  <MapPin className="h-3 w-3" /> {item.city}, {item.country}
                </span>
              </div>

              <h3 className="mt-2 text-lg font-bold leading-tight text-white sm:text-xl">
                {item.title}
              </h3>

              {item.description && (
                <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/70 line-clamp-2">
                  {item.description}
                </p>
              )}

              <Link
                href={`/events/${item.slug}`}
                className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
                onClick={(e) => e.stopPropagation()}
              >
                View event →
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
