import { getCountryFlag, getRegionPalette } from '@/lib/utils/location';

interface LocationSpotlightImageProps {
  city: string;
  country: string;
  region: string;
  title?: string;
  compact?: boolean;
  className?: string;
}

function createSeed(value: string): number {
  return value.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 3), 0);
}

function createSkyline(seed: number, width: number, height: number) {
  const bars = [];
  let x = 0;

  for (let index = 0; index < 18; index += 1) {
    const barWidth = 18 + ((seed + index * 11) % 28);
    const barHeight = 32 + ((seed + index * 17) % (height - 26));
    bars.push({
      x,
      y: height - barHeight,
      width: barWidth,
      height: barHeight
    });
    x += barWidth - 2;

    if (x > width - 16) {
      break;
    }
  }

  return bars;
}

export function LocationSpotlightImage({
  city,
  country,
  region,
  title,
  compact = false,
  className = ''
}: LocationSpotlightImageProps) {
  const palette = getRegionPalette(region);
  const seed = createSeed(`${city}-${country}-${region}`);
  const width = 560;
  const height = compact ? 168 : 248;
  const skyline = createSkyline(seed, width, compact ? 90 : 132);

  return (
    <div
      className={`relative overflow-hidden rounded-[1.8rem] border border-white/12 ${compact ? 'h-[11rem]' : 'h-[16rem] sm:h-[18rem]'} ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at 16% 18%, ${palette.glow}, transparent 22%), radial-gradient(circle at 84% 16%, ${palette.glow2}, transparent 18%), linear-gradient(180deg, rgba(11,18,31,0.88), rgba(6,10,18,0.98))`
      }}
    >
      <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.16]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_26%,transparent_72%,rgba(255,255,255,0.04))]" />
      <div className="pointer-events-none absolute left-[8%] top-[14%] h-2 w-2 rounded-full bg-white/75 shadow-[0_0_20px_4px_rgba(184,228,255,0.12)]" />

      <svg viewBox={`0 0 ${width} ${height}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`skyline-fill-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(184,228,255,0.18)" />
            <stop offset="100%" stopColor="rgba(4,10,18,0.9)" />
          </linearGradient>
        </defs>
        <g fill={`url(#skyline-fill-${seed})`}>
          {skyline.map((bar, index) => (
            <rect key={`${bar.x}-${index}`} x={bar.x} y={height - bar.height} width={bar.width} height={bar.height} rx="3" />
          ))}
        </g>
        <line x1="0" x2={width} y1={height - 26} y2={height - 26} stroke={palette.line} strokeOpacity="0.5" />
        <rect x="0" y={height - 24} width={width} height="24" fill="rgba(3,16,24,0.92)" />
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(to_top,rgba(3,16,24,0.92),rgba(3,16,24,0.28),transparent)]" />

      <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="country-chip">
            <span>{getCountryFlag(country)}</span>
            <span>{country}</span>
          </span>
          <span className="global-chip">{region}</span>
          <span className="city-chip">location fallback</span>
        </div>

        <div>
          {title ? <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">{title}</p> : null}
          <p className={`mt-2 font-[var(--font-serif)] leading-none text-white ${compact ? 'text-3xl' : 'text-4xl sm:text-5xl'}`}>{city}</p>
          <p className="mt-2 max-w-md text-sm uppercase tracking-[0.26em] text-slate-300">
            Editorial destination surface
          </p>
        </div>
      </div>
    </div>
  );
}
