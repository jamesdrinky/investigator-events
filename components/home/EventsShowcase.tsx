'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, ArrowUpRight, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { getAssociationBrandLogoSrc, shouldInvertLogoOnLight } from '@/lib/utils/association-branding';

export interface ShowcaseEvent {
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
  featured?: boolean;
}

interface EventsShowcaseProps {
  /** First event (hero card) */
  hero: ShowcaseEvent;
  /** Rest of events for the carousel */
  rest: ShowcaseEvent[];
}

function safeSrc(src?: string) {
  return src && /^(\/(cities|events|images)\/|https?:\/\/)/.test(src) ? src : '/cities/fallback.jpg';
}

export function EventsShowcase({ hero, rest }: EventsShowcaseProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
  });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const heroLogo = getAssociationBrandLogoSrc(hero.association);
  const heroInvert = shouldInvertLogoOnLight(hero.association);

  return (
    <section className="relative overflow-hidden bg-slate-950 py-14 sm:py-24">
      {/* Premium backdrop — multi-layer gradient + animated dot grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.22),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.15),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="container-shell relative">
        {/* Section header */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">Live on the calendar</span>
            </div>
            <h2 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[0.96] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
              The events worth{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                planning around
              </span>
              .
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
              Confirmed PI conferences, AGMs, and training — handpicked from the global calendar.
            </p>
          </div>
          <Link
            href="/calendar"
            className="hidden whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 sm:inline-flex sm:items-center sm:gap-1.5"
          >
            View full calendar
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* HERO event card — large, premium */}
        <div className="mt-7 sm:mt-10">
          <Link
            href={`/events/${hero.slug}`}
            className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] transition active:scale-[0.995] sm:rounded-3xl"
          >
            <div className="relative aspect-[5/3] w-full overflow-hidden sm:aspect-[16/7]">
              <Image
                src={safeSrc(hero.coverImage)}
                alt={hero.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover transition-transform duration-700 sm:group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              {/* Top: association logo + Featured pill */}
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5">
                {heroLogo ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/95 p-2 shadow-lg backdrop-blur-sm sm:h-14 sm:w-14">
                    <Image src={heroLogo} alt={hero.association} width={48} height={48} className={`h-auto max-h-8 w-auto max-w-8 object-contain sm:max-h-10 sm:max-w-10 ${heroInvert ? 'brightness-0' : ''}`} />
                  </div>
                ) : <span />}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Next up
                </span>
              </div>

              {/* Bottom: meta + title + cta */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    <Calendar className="h-3 w-3" /> {hero.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    <MapPin className="h-3 w-3" /> {hero.city}, {hero.country}
                  </span>
                </div>
                <h3 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {hero.title}
                </h3>
                {hero.description && (
                  <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                    {hero.description}
                  </p>
                )}
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-white">
                  View event
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Carousel of more events */}
        {rest.length > 0 && (
          <div className="mt-6 sm:mt-10">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 sm:text-xs">
              More upcoming events
            </p>
            <div ref={emblaRef} className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0" style={{ transform: 'translateZ(0)' }}>
              <div className="flex gap-3 sm:gap-5">
                {rest.map((item) => {
                  const logo = getAssociationBrandLogoSrc(item.association);
                  const invert = shouldInvertLogoOnLight(item.association);
                  return (
                    <Link
                      key={item.id}
                      href={`/events/${item.slug}`}
                      className="group flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition sm:hover:border-white/20 sm:hover:bg-white/[0.06]"
                      style={{ width: 'min(74vw, 280px)' }}
                    >
                      <div className="relative aspect-[5/4] overflow-hidden">
                        <Image
                          src={safeSrc(item.coverImage)}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 74vw, 280px"
                          className="object-cover sm:transition-transform sm:duration-500 sm:group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                        {logo && (
                          <div className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/95 p-1.5 shadow-md">
                            <Image src={logo} alt={item.association} width={32} height={32} className={`h-auto max-h-7 w-auto max-w-7 object-contain ${invert ? 'brightness-0' : ''}`} />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-1.5 p-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                            <Calendar className="h-2.5 w-2.5" /> {item.date}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">{item.city}, {item.country}</p>
                        <h4 className="mt-1.5 line-clamp-2 text-sm font-bold leading-tight text-white sm:text-base">{item.title}</h4>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Dots */}
            {rest.length > 1 && (
              <div className="mt-4 flex justify-center gap-1.5">
                {rest.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className="flex h-6 items-center justify-center px-0.5"
                  >
                    <span className={`block h-1 rounded-full transition-all ${current === i ? 'w-5 bg-white' : 'w-1 bg-white/25'}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile-only View all link */}
        <div className="mt-8 sm:hidden">
          <Link
            href="/calendar"
            className="block w-full rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm transition active:scale-[0.98]"
          >
            View full calendar →
          </Link>
        </div>
      </div>
    </section>
  );
}
