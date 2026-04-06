'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export interface GalleryEventItem {
  id: string;
  title: string;
  date: string;
  city: string;
  country: string;
  slug: string;
  association: string;
  coverImage?: string;
  region: string;
  category: string;
}

const CARD_W = 320;
const CARD_H = 420;
const RADIUS = 580;
const AUTO_SPEED = 0.012; // degrees per frame (~0.7°/sec at 60fps)
const THROTTLE_MS = 1000 / 30; // cap at 30fps

export function EventsCircularGallery({ items }: { items: GalleryEventItem[] }) {
  const [rotation, setRotation] = useState(0);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef(0);
  const angleStep = 360 / items.length;

  useEffect(() => {
    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      const dt = now - lastTickRef.current;
      if (dt >= THROTTLE_MS) {
        lastTickRef.current = now - (dt % THROTTLE_MS);
        setRotation((r) => (r + AUTO_SPEED * (dt / 16.67)) % 360);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="mx-auto flex items-center justify-center"
      style={{ height: CARD_H + 80, perspective: '1800px' }}
    >
      <div
        className="relative"
        style={{
          width: 1,
          height: 1,
          transformStyle: 'preserve-3d',
          transform: `rotateY(${-rotation}deg)`,
        }}
      >
        {items.map((item, i) => {
          const itemAngle = i * angleStep;
          // Calculate how "front-facing" this card is
          const effective = ((itemAngle - rotation) % 360 + 360) % 360;
          const delta = effective > 180 ? 360 - effective : effective;
          const opacity = Math.max(0.25, 1 - delta / 140);
          const scale = 0.75 + 0.25 * (1 - delta / 180);

          return (
            <div
              key={item.id}
              className="absolute"
              style={{
                width: CARD_W,
                height: CARD_H,
                left: '50%',
                top: '50%',
                marginLeft: -CARD_W / 2,
                marginTop: -CARD_H / 2,
                transform: `rotateY(${itemAngle}deg) translateZ(${RADIUS}px)`,
                opacity,
                transition: 'opacity 0.3s linear',
                backfaceVisibility: 'hidden',
              }}
            >
              <Link
                href={`/events/${item.slug}`}
                className="relative block h-full w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_12px_40px_-12px_rgba(15,23,42,0.15)]"
                style={{ transform: `scale(${scale})`, transition: 'transform 0.3s ease' }}
              >
                {/* Cover image area */}
                <div className="relative h-[60%] w-full overflow-hidden">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-100">
                      <div className="text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {item.region}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-600">
                          {item.city}, {item.country}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
                </div>

                {/* Details */}
                <div className="relative px-5 pb-5 pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                    {item.date}
                  </p>
                  <h3 className="mt-1.5 text-[1.05rem] font-semibold leading-tight tracking-[-0.02em] text-slate-950 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 line-clamp-1">
                    {item.city}, {item.country}
                    {item.association ? ` · ${item.association}` : ''}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
