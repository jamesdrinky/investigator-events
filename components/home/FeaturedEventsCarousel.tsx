'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

export interface FeaturedEventCard {
  id: string;
  title: string;
  date: string;
  city: string;
  country: string;
  region: string;
  slug: string;
  association: string;
  coverImage?: string;
  description?: string;
}

export function FeaturedEventsCarousel({ items }: { items: FeaturedEventCard[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    breakpoints: {
      '(max-width: 768px)': { dragFree: true },
    },
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
      setCurrent(emblaApi.selectedScrollSnap());
    };
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="w-full">
      {/* Nav arrows — desktop */}
      <div className="mb-6 hidden justify-end gap-2 sm:flex">
        <button
          onClick={scrollPrev}
          disabled={!canPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white/70 transition hover:bg-white/14 disabled:opacity-30"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={scrollNext}
          disabled={!canNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white/70 transition hover:bg-white/14 disabled:opacity-30"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Carousel */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-0 shrink-0 grow-0 basis-[85%] pl-4 sm:basis-[45%] lg:basis-[32%]"
            >
              <Link
                href={`/events/${item.slug}`}
                className="group block h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/20 hover:bg-white/8"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden sm:h-56">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
                      <div className="text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">
                          {item.region}
                        </p>
                        <p className="mt-1 text-base font-semibold text-white/60">
                          {item.city}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06091a] via-transparent to-transparent" />
                </div>

                {/* Details */}
                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    {item.date}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.02em] text-white line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-blue-200/50 line-clamp-1">
                    {item.city}, {item.country}
                    {item.association ? ` · ${item.association}` : ''}
                  </p>
                  {item.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  ) : null}
                  <div className="mt-4 flex items-center text-sm font-semibold text-cyan-400 transition group-hover:text-cyan-300">
                    View event
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              current === i
                ? 'w-6 bg-cyan-400'
                : 'w-1.5 bg-white/20'
            }`}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
