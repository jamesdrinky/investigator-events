import { getCountryFlag, getRegionPalette } from '@/lib/utils/location';

interface LocationSignatureProps {
  city: string;
  country: string;
  region: string;
  compact?: boolean;
  className?: string;
}

export function LocationSignature({ city, country, region, compact = false, className = '' }: LocationSignatureProps) {
  const palette = getRegionPalette(region);
  const flag = getCountryFlag(country);

  return (
    <div
      className={`relative overflow-hidden rounded-[1.35rem] border border-white/10 ${compact ? 'h-24 p-3' : 'h-40 p-5'} ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at 18% 20%, ${palette.glow}, transparent 28%), radial-gradient(circle at 82% 24%, ${palette.glow2}, transparent 30%), linear-gradient(135deg, rgba(4,17,32,0.98), rgba(6,24,36,0.95) 56%, rgba(7,21,29,0.94))`
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage: `linear-gradient(to right, ${palette.line} 1px, transparent 1px), linear-gradient(to bottom, ${palette.line} 1px, transparent 1px)`,
          backgroundSize: compact ? '26px 26px' : '34px 34px'
        }}
      />
      <p
        className={`pointer-events-none absolute right-3 top-2 font-[var(--font-serif)] uppercase tracking-[0.18em] text-white/10 ${
          compact ? 'text-xl' : 'text-4xl'
        }`}
      >
        {city}
      </p>

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center gap-2">
          <span className="country-chip">
            <span>{flag}</span>
            <span>{country}</span>
          </span>
          <span className="global-chip">{region}</span>
        </div>

        <div>
          <p className={`font-[var(--font-serif)] text-white ${compact ? 'text-xl' : 'text-3xl'}`}>{city}</p>
          <p className={`mt-1 text-slate-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>{country}</p>
        </div>
      </div>
    </div>
  );
}
