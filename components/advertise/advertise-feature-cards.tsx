'use client';

import { HolographicCard } from '@/components/ui/holographic-card';

const REASONS = [
  'Specialist audience of investigators, organisers, and associations',
  'Reviewed placements rather than open ad inventory',
  'Global relevance across core private investigation markets',
];

export function AdvertiseReasonCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
      {REASONS.map((reason) => (
        <HolographicCard key={reason} className="rounded-[1.4rem] border border-white/80 bg-white/90 px-4 py-4 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.12)]">
          <p className="relative text-sm text-slate-700">{reason}</p>
        </HolographicCard>
      ))}
    </div>
  );
}
