'use client';

import { HolographicCard } from '@/components/ui/holographic-card';

const INFO = [
  { label: 'Audience quality', color: 'text-sky-700', text: 'Investigators, organisers, associations, and training decision-makers.' },
  { label: 'Market spread', color: 'text-emerald-700', text: 'Positioned across multiple regions rather than a single domestic audience.' },
  { label: 'Format options', color: 'text-violet-700', text: 'Get in touch to discuss how we can work together.' },
];

export function AdvertiseInfoCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
      {INFO.map((item) => (
        <HolographicCard key={item.label} className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-4">
          <div className="relative">
            <p className={`text-xs uppercase tracking-[0.16em] ${item.color}`}>{item.label}</p>
            <p className="mt-2 text-sm text-slate-700">{item.text}</p>
          </div>
        </HolographicCard>
      ))}
    </div>
  );
}
