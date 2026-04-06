'use client';

import { HolographicCard } from '@/components/ui/holographic-card';

interface WeeklyStatCardsProps {
  newlyAddedCount: number;
  upcomingCount: number;
}

export function WeeklyStatCards({ newlyAddedCount, upcomingCount }: WeeklyStatCardsProps) {
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {newlyAddedCount > 0 && (
        <HolographicCard className="rounded-2xl border border-sky-100 bg-[linear-gradient(145deg,rgba(239,246,255,0.96),rgba(255,255,255,0.9))] px-4 py-4 shadow-[0_18px_42px_-34px_rgba(36,76,170,0.12)]">
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700">Newly added</p>
            <p className="mt-2 font-[var(--font-serif)] text-4xl text-slate-950">{newlyAddedCount}</p>
          </div>
        </HolographicCard>
      )}
      <HolographicCard className="rounded-2xl border border-violet-100 bg-[linear-gradient(145deg,rgba(245,243,255,0.96),rgba(255,255,255,0.9))] px-4 py-4 shadow-[0_18px_42px_-34px_rgba(111,86,255,0.12)]">
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.18em] text-violet-700">Upcoming in 30 days</p>
          <p className="mt-2 font-[var(--font-serif)] text-4xl text-slate-950">{upcomingCount}</p>
        </div>
      </HolographicCard>
    </div>
  );
}
