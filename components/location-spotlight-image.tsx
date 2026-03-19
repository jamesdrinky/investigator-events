import { WorldMapMotif } from '@/components/global/world-map-motif';
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
  const arcA = 80 + (seed % 80);
  const arcB = 320 + (seed % 120);
  const arcLift = 28 + (seed % 20);

  return (
    <div
      className={`relative overflow-hidden rounded-[1.8rem] border border-white/12 ${compact ? 'h-[11rem]' : 'h-[16rem] sm:h-[18rem]'} ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at 16% 18%, rgba(77,163,255,0.34), transparent 24%), radial-gradient(circle at 84% 16%, rgba(52,211,153,0.24), transparent 22%), radial-gradient(circle at 50% 80%, ${palette.glow2}, transparent 30%), linear-gradient(180deg, rgba(7,33,58,0.2), rgba(3,16,24,0.24)), linear-gradient(135deg, rgba(4,17,32,0.98), rgba(5,28,39,0.95) 48%, rgba(7,30,24,0.95))`
      }}
    >
      <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.32]" />
      <div className="pointer-events-none absolute inset-x-[-12%] top-[-16%] h-[64%] opacity-[0.15]">
        <WorldMapMotif />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(184,228,255,0.14),transparent_16%),radial-gradient(circle_at_50%_120%,rgba(52,211,153,0.16),transparent_30%)]" />
      <div className="pointer-events-none absolute left-[8%] top-[14%] h-2.5 w-2.5 rounded-full bg-white/80 shadow-[0_0_40px_10px_rgba(184,228,255,0.24)]" />

      <svg viewBox={`0 0 ${width} ${height}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`skyline-fill-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(184,228,255,0.24)" />
            <stop offset="100%" stopColor="rgba(3,16,24,0.92)" />
          </linearGradient>
          <linearGradient id={`route-stroke-${seed}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(77,163,255,0.1)" />
            <stop offset="45%" stopColor="rgba(184,228,255,0.72)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.16)" />
          </linearGradient>
        </defs>

        <g fill="none" stroke="rgba(184,228,255,0.16)" strokeWidth="1">
          <path d={`M 34 ${height - 74} Q ${arcA} ${height - 134 - arcLift} ${arcB} ${height - 68}`} />
          <path d={`M 180 ${height - 58} Q 310 ${height - 146 - arcLift} 506 ${height - 84}`} />
        </g>
        <g fill="none" stroke={`url(#route-stroke-${seed})`} strokeWidth="1.8">
          <path d={`M 34 ${height - 74} Q ${arcA} ${height - 134 - arcLift} ${arcB} ${height - 68}`} />
          <path d={`M 180 ${height - 58} Q 310 ${height - 146 - arcLift} 506 ${height - 84}`} />
        </g>
        <g fill="rgba(52,211,153,0.9)">
          <circle cx="34" cy={height - 74} r="4" />
          <circle cx={arcB} cy={height - 68} r="4" />
          <circle cx="180" cy={height - 58} r="4" />
          <circle cx="506" cy={height - 84} r="4" />
        </g>
        <g fill={`url(#skyline-fill-${seed})`}>
          {skyline.map((bar, index) => (
            <rect key={`${bar.x}-${index}`} x={bar.x} y={height - bar.height} width={bar.width} height={bar.height} rx="3" />
          ))}
        </g>
        <rect x="0" y={height - 24} width={width} height="24" fill="rgba(3,16,24,0.88)" />
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(to_top,rgba(3,16,24,0.92),rgba(3,16,24,0.28),transparent)]" />

      <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="country-chip">
            <span>{getCountryFlag(country)}</span>
            <span>{country}</span>
          </span>
          <span className="global-chip">{region}</span>
          <span className="city-chip">global node</span>
        </div>

        <div>
          {title ? <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">{title}</p> : null}
          <p className={`mt-2 font-[var(--font-serif)] leading-none text-white ${compact ? 'text-3xl' : 'text-4xl sm:text-5xl'}`}>{city}</p>
          <p className="mt-2 max-w-md text-sm uppercase tracking-[0.26em] text-slate-300">
            International event platform signal
          </p>
        </div>
      </div>
    </div>
  );
}
