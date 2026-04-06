'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

interface LogoItem {
  slug: string;
  shortName: string;
  logoSrc?: string;
  country: string;
  eventCount: number;
}

function getInitials(label: string) {
  const words = label.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}

function LogoCard({ item }: { item: LogoItem }) {
  return (
    <div className="flex w-40 flex-col items-center gap-2 rounded-xl border border-white/80 bg-white/95 p-4 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 p-2">
        {item.logoSrc ? (
          <Image
            src={item.logoSrc}
            alt={item.shortName}
            width={48}
            height={48}
            className="h-auto max-h-10 w-auto max-w-10 object-contain"
          />
        ) : (
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {getInitials(item.shortName)}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{item.shortName}</p>
      <p className="text-[10px] text-slate-400">{item.country}</p>
    </div>
  );
}

function VerticalMarquee({
  children,
  reverse = false,
  duration = '35s',
}: {
  children: ReactNode;
  reverse?: boolean;
  duration?: string;
}) {
  const animName = reverse ? 'marquee-v-reverse' : 'marquee-v';
  return (
    <div className="flex flex-col gap-3 overflow-hidden" style={{ height: '100%' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex shrink-0 flex-col gap-3"
          style={{
            animation: `${animName} ${duration} linear infinite`,
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

export function AssociationLogoMarquee({ items }: { items: LogoItem[] }) {
  // Split into 3 columns
  const col1 = items.filter((_, i) => i % 3 === 0);
  const col2 = items.filter((_, i) => i % 3 === 1);
  const col3 = items.filter((_, i) => i % 3 === 2);

  return (
    <div
      className="relative hidden h-[26rem] overflow-hidden lg:flex"
      style={{ perspective: '400px' }}
    >
      <div
        className="flex gap-3"
        style={{
          transform: 'translateX(40px) translateZ(-50px) rotateX(8deg) rotateY(-8deg) rotateZ(8deg)',
          transformOrigin: 'center center',
        }}
      >
        <VerticalMarquee duration="32s">
          {col1.map((item) => (
            <LogoCard key={item.slug} item={item} />
          ))}
        </VerticalMarquee>
        <VerticalMarquee reverse duration="36s">
          {col2.map((item) => (
            <LogoCard key={item.slug} item={item} />
          ))}
        </VerticalMarquee>
        <VerticalMarquee duration="30s">
          {col3.map((item) => (
            <LogoCard key={item.slug} item={item} />
          ))}
        </VerticalMarquee>
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f0f4ff] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f0f4ff] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#f0f4ff] to-transparent" />
    </div>
  );
}
