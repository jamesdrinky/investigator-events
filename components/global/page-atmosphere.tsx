import { WorldMapMotif } from '@/components/global/world-map-motif';

interface PageAtmosphereProps {
  className?: string;
}

export function PageAtmosphere({ className = '' }: PageAtmosphereProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(77,163,255,0.14),transparent_24%)]" />
      <div className="absolute inset-0 geo-grid opacity-[0.08]" />
      <div className="absolute left-1/2 top-0 h-[25rem] w-[70rem] -translate-x-1/2 opacity-[0.08] sm:opacity-[0.12]">
        <WorldMapMotif />
      </div>
      <div className="absolute inset-x-[12%] top-[7rem] h-px bg-[linear-gradient(90deg,rgba(77,163,255,0),rgba(77,163,255,0.45),rgba(52,211,153,0.5),rgba(77,163,255,0))]" />
    </div>
  );
}
