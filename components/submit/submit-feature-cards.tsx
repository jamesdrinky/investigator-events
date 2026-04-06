'use client';

import { HolographicCard } from '@/components/ui/holographic-card';

const FEATURES = [
  { label: 'Free listing', color: 'text-blue-700', text: 'Free to submit and free to browse.' },
  { label: 'Reviewed', color: 'text-cyan-700', text: 'Every listing is checked before it goes live.' },
  { label: 'Fast turnaround', color: 'text-violet-700', text: 'Most listings are reviewed within 48 hours.' },
];

export function SubmitFeatureCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
      {FEATURES.map((f) => (
        <HolographicCard key={f.label} className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)]">
          <div className="relative">
            <p className={`text-[10px] uppercase tracking-[0.18em] ${f.color}`}>{f.label}</p>
            <p className="mt-2 text-sm text-slate-700">{f.text}</p>
          </div>
        </HolographicCard>
      ))}
    </div>
  );
}
