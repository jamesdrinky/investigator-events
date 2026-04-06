'use client';

import { HolographicCard } from '@/components/ui/holographic-card';

const FEATURES = [
  { label: 'Clear provenance', color: 'text-blue-700', text: 'Real associations, visible logos when available, direct links, and linked event counts.' },
  { label: 'Browse faster', color: 'text-cyan-700', text: 'Filter by region or country before opening the connected calendar results.' },
  { label: 'Useful context', color: 'text-violet-700', text: 'This page helps you see which bodies are active before you open individual events.' },
];

export function AssociationFeatureCards() {
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
