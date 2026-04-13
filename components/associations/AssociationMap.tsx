'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { geoNaturalEarth1, geoPath, geoGraticule, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';

interface MapAssociation {
  country: string;
  count: number;
}

interface Props {
  associations: MapAssociation[];
  onCountryClick?: (country: string) => void;
  selectedCountry?: string;
}

// Map country names to ISO 3166-1 numeric IDs (matches world-atlas topojson)
const COUNTRY_ISO: Record<string, string> = {
  'Austria': '040', 'Belgium': '056', 'Czech Republic': '203', 'Denmark': '208',
  'Finland': '246', 'France': '250', 'Germany': '276', 'Hungary': '348',
  'Israel': '376', 'Italy': '380', 'Latvia': '428', 'Norway': '578',
  'Poland': '616', 'Portugal': '620', 'Romania': '642', 'Russian Federation': '643',
  'Serbia': '688', 'Slovenia': '705', 'Spain': '724', 'Switzerland': '756',
  'United Kingdom': '826', 'United States': '840',
};

export function AssociationMap({ associations, onCountryClick, selectedCountry }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 420 });

  // Load world data
  useEffect(() => {
    fetch('/data/countries-110m.json')
      .then((r) => r.json())
      .then((topo) => {
        const geo = feature(topo, topo.objects.countries) as any;
        setWorldData(geo);
      });
  }, []);

  // Responsive
  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: Math.min(width * 0.52, 480) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Country ID -> association count
  const countryAssocMap = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    associations.forEach((a) => {
      const id = COUNTRY_ISO[a.country];
      if (id) map.set(id, { name: a.country, count: a.count });
    });
    return map;
  }, [associations]);

  const selectedId = selectedCountry ? COUNTRY_ISO[selectedCountry] : null;

  if (!worldData) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-900/50 sm:h-80">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  const projection = geoNaturalEarth1()
    .fitSize([dimensions.width, dimensions.height], worldData);
  const pathGenerator = geoPath(projection);
  const graticule = geoGraticule().step([20, 20])();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(165deg,#06091a_0%,#0a1228_50%,#0d1840_100%)]" style={{ touchAction: 'pan-x pan-y' }}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[20%] top-[20%] h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(ellipse,rgba(22,104,255,0.12),transparent_60%)]" />
        <div className="absolute right-[15%] bottom-[20%] h-[12rem] w-[12rem] rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.08),transparent_60%)]" />
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} className="relative w-full">
        {/* Graticule */}
        <path d={pathGenerator(graticule) ?? ''} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />

        {/* Countries */}
        {worldData.features.map((f: any) => {
          const id = f.id;
          const assocData = countryAssocMap.get(id);
          const isHovered = hoveredCountry === id;
          const isSelected = selectedId === id;
          const hasAssociation = !!assocData;

          return (
            <path
              key={id}
              d={pathGenerator(f) ?? ''}
              fill={
                isSelected ? 'rgba(59,130,246,0.5)'
                : isHovered && hasAssociation ? 'rgba(59,130,246,0.35)'
                : hasAssociation ? 'rgba(59,130,246,0.18)'
                : 'rgba(255,255,255,0.04)'
              }
              stroke={
                isSelected ? 'rgba(59,130,246,0.8)'
                : hasAssociation ? 'rgba(59,130,246,0.2)'
                : 'rgba(255,255,255,0.06)'
              }
              strokeWidth={isSelected ? 1.5 : 0.5}
              className={hasAssociation ? 'cursor-pointer transition-colors duration-200' : ''}
              onMouseEnter={() => hasAssociation && setHoveredCountry(id)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => {
                if (hasAssociation && assocData && onCountryClick) {
                  onCountryClick(assocData.name);
                }
              }}
            />
          );
        })}

        {/* Dots on countries with associations */}
        {worldData.features.map((f: any) => {
          const assocData = countryAssocMap.get(f.id);
          if (!assocData) return null;
          const centroid = projection(geoCentroid(f));
          if (!centroid) return null;
          const isSelected = selectedId === f.id;

          return (
            <g key={`dot-${f.id}`}>
              {/* Pulse ring */}
              <circle
                cx={centroid[0]}
                cy={centroid[1]}
                r={isSelected ? 8 : 5}
                fill="none"
                stroke="rgba(59,130,246,0.4)"
                strokeWidth={1}
                opacity={0.6}
              >
                <animate attributeName="r" values={isSelected ? '8;14;8' : '5;10;5'} dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Main dot */}
              <circle
                cx={centroid[0]}
                cy={centroid[1]}
                r={isSelected ? 5 : 3}
                fill={isSelected ? '#3b82f6' : '#60a5fa'}
                className="cursor-pointer"
                filter="url(#glow)"
                onClick={() => onCountryClick?.(assocData.name)}
              />
              {/* Count badge */}
              {assocData.count > 1 && (
                <text
                  x={centroid[0] + 6}
                  y={centroid[1] - 6}
                  fill="rgba(147,197,253,0.8)"
                  fontSize={9}
                  fontWeight="bold"
                >
                  {assocData.count}
                </text>
              )}
            </g>
          );
        })}

        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Hover tooltip */}
      {hoveredCountry && countryAssocMap.get(hoveredCountry) && (
        <div className="absolute bottom-3 left-3 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
          {countryAssocMap.get(hoveredCountry)!.name} — {countryAssocMap.get(hoveredCountry)!.count} association{countryAssocMap.get(hoveredCountry)!.count > 1 ? 's' : ''}
        </div>
      )}

      {/* Legend */}
      <div className="absolute right-3 top-3 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] text-white/40 backdrop-blur-sm">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" /> Has associations</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/20" /> No associations listed</span>
      </div>
    </div>
  );
}
