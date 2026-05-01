'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';
import { getCountryFlag } from '@/lib/utils/location';
import Link from 'next/link';
import { geoNaturalEarth1, geoPath, geoGraticule, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';

/* ────────────────────────────────────────────── */
/*  Types                                         */
/* ────────────────────────────────────────────── */

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  username: string | null;
  specialisation: string | null;
  headline: string | null;
  is_public: boolean;
  available_for_referrals: boolean;
  is_verified: boolean;
}

interface ZoomTransform {
  x: number;
  y: number;
  k: number;
}

/* ────────────────────────────────────────────── */
/*  Country name -> ISO 3166-1 numeric ID         */
/*  (matches world-atlas topojson country IDs)    */
/* ────────────────────────────────────────────── */

const COUNTRY_ISO: Record<string, string> = {
  'United Kingdom': '826', 'United States': '840', 'Germany': '276',
  'Italy': '380', 'France': '250', 'Spain': '724', 'India': '356',
  'Australia': '036', 'Canada': '124', 'Netherlands': '528',
  'Ireland': '372', 'South Africa': '710', 'United Arab Emirates': '784',
  'Czech Republic': '203', 'Costa Rica': '188', 'Switzerland': '756',
  'Belgium': '056', 'Sweden': '752', 'Norway': '578', 'Denmark': '208',
  'Brazil': '076', 'Japan': '392', 'China': '156', 'Mexico': '484',
  'Poland': '616', 'Portugal': '620', 'Russia': '643', 'Turkey': '792',
  'Greece': '300', 'Austria': '040', 'Singapore': '702', 'Hong Kong': '344',
  'New Zealand': '554', 'Argentina': '032', 'Colombia': '170',
  'Thailand': '764', 'Indonesia': '360', 'Malaysia': '458',
  'Philippines': '608', 'Nigeria': '566', 'Kenya': '404', 'Egypt': '818',
  'Afghanistan': '004', 'Albania': '008', 'Algeria': '012', 'Angola': '024',
  'Armenia': '051', 'Azerbaijan': '031', 'Bahamas': '044', 'Bahrain': '048',
  'Bangladesh': '050', 'Belarus': '112', 'Belize': '084', 'Benin': '204',
  'Bhutan': '064', 'Bolivia': '068', 'Bosnia and Herzegovina': '070',
  'Botswana': '072', 'Brunei': '096', 'Bulgaria': '100',
  'Burkina Faso': '854', 'Burundi': '108', 'Cambodia': '116',
  'Cameroon': '120', 'Central African Republic': '140', 'Chad': '148',
  'Chile': '152', 'Congo': '178', 'Croatia': '191', 'Cuba': '192',
  'Cyprus': '196', 'Czechia': '203',
  'Democratic Republic of the Congo': '180', 'Dominican Republic': '214',
  'Ecuador': '218', 'El Salvador': '222', 'Estonia': '233',
  'Ethiopia': '231', 'Fiji': '242', 'Finland': '246', 'Gabon': '266',
  'Gambia': '270', 'Georgia': '268', 'Ghana': '288', 'Guatemala': '320',
  'Guinea': '324', 'Guyana': '328', 'Haiti': '332', 'Honduras': '340',
  'Hungary': '348', 'Iceland': '352', 'Iran': '364', 'Iraq': '368',
  'Israel': '376', 'Ivory Coast': '384', 'Jamaica': '388', 'Jordan': '400',
  'Kazakhstan': '398', 'Kosovo': '-99', 'Kuwait': '414',
  'Kyrgyzstan': '417', 'Laos': '418', 'Latvia': '428', 'Lebanon': '422',
  'Lesotho': '426', 'Liberia': '430', 'Libya': '434', 'Lithuania': '440',
  'Luxembourg': '442', 'Madagascar': '450', 'Malawi': '454', 'Mali': '466',
  'Mauritania': '478', 'Moldova': '498', 'Mongolia': '496',
  'Montenegro': '499', 'Morocco': '504', 'Mozambique': '508',
  'Myanmar': '104', 'Namibia': '516', 'Nepal': '524', 'Nicaragua': '558',
  'Niger': '562', 'North Korea': '408', 'North Macedonia': '807',
  'Oman': '512', 'Pakistan': '586', 'Palestine': '275', 'Panama': '591',
  'Papua New Guinea': '598', 'Paraguay': '600', 'Peru': '604',
  'Puerto Rico': '630', 'Qatar': '634', 'Romania': '642', 'Rwanda': '646',
  'Saudi Arabia': '682', 'Senegal': '686', 'Serbia': '688',
  'Sierra Leone': '694', 'Slovakia': '703', 'Slovenia': '705',
  'Somalia': '706', 'South Korea': '410', 'South Sudan': '728',
  'Sri Lanka': '144', 'Sudan': '729', 'Suriname': '740', 'Syria': '760',
  'Taiwan': '158', 'Tajikistan': '762', 'Tanzania': '834', 'Togo': '768',
  'Trinidad and Tobago': '780', 'Tunisia': '788', 'Turkmenistan': '795',
  'Uganda': '800', 'Ukraine': '804', 'Uruguay': '858', 'Uzbekistan': '860',
  'Venezuela': '862', 'Vietnam': '704', 'Yemen': '887', 'Zambia': '894',
  'Zimbabwe': '716',
};

// Reverse: topojson numeric ID -> country name
const ID_TO_COUNTRY: Record<string, string> = {};
for (const [name, id] of Object.entries(COUNTRY_ISO)) {
  if (!ID_TO_COUNTRY[id]) ID_TO_COUNTRY[id] = name;
}

/* ────────────────────────────────────────────── */
/*  CSS keyframes injected once                   */
/* ────────────────────────────────────────────── */

const STYLE_ID = 'network-map-styles';
function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes dash-flow {
      to { stroke-dashoffset: -20; }
    }
    @keyframes fade-in-country {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes hint-fade {
      0%, 70% { opacity: 1; }
      100% { opacity: 0; }
    }
    .arc-line {
      animation: dash-flow 1.5s linear infinite;
    }
    .country-fade-in {
      animation: fade-in-country 0.6s ease-out both;
    }
    .zoom-hint-anim {
      animation: hint-fade 3.5s ease-out forwards;
    }
    .bottom-sheet-enter {
      transform: translateY(100%);
      animation: slide-up 0.35s ease-out forwards;
    }
    @keyframes slide-up {
      to { transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

/* ────────────────────────────────────────────── */
/*  Page Component                                */
/* ────────────────────────────────────────────── */

export default function NetworkMapPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  /* ── State ── */
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [worldGeo, setWorldGeo] = useState<any>(null);
  const [usStatesGeo, setUsStatesGeo] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState<ZoomTransform>({ x: 0, y: 0, k: 1 });
  const [mapReady, setMapReady] = useState(false);
  const [showZoomHint, setShowZoomHint] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<any>(null);
  const hintDismissed = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* ── Projection constants ── */
  const width = 960;
  const height = 500;

  /* ── Inject keyframe styles ── */
  useEffect(() => {
    injectStyles();
  }, []);

  /* ── Mobile detection ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Auto-dismiss zoom hint ── */
  useEffect(() => {
    const timer = setTimeout(() => setShowZoomHint(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  /* ── Fetch profiles ── */
  useEffect(() => {
    async function load() {
      const { data: profileData } = await (supabase
        .from('profiles') as any)
        .select('id, full_name, avatar_url, country, username, specialisation, headline, is_public, available_for_referrals')
        .eq('is_public', true)
        .not('country', 'is', null);

      const { data: verifications } = await (supabase
        .from('member_verifications') as any)
        .select('user_id')
        .eq('status', 'verified');

      const verifiedIds = new Set((verifications ?? []).map((v: any) => v.user_id));

      const enriched: Profile[] = (profileData ?? []).map((p: any) => ({
        ...p,
        is_verified: verifiedIds.has(p.id),
      }));

      setProfiles(enriched);
      setLoading(false);
    }
    load();
  }, [supabase]);

  /* ── Fetch world topology ── */
  useEffect(() => {
    fetch('/data/countries-110m.json')
      .then((res) => res.json())
      .then((data: any) => {
        const countries = feature(data, data.objects.countries) as any;
        setWorldGeo(countries);
        // Stagger fade-in start
        setTimeout(() => setMapReady(true), 50);
      })
      .catch(() => {});
  }, []);

  /* ── Fetch US states topology ── */
  useEffect(() => {
    fetch('/data/us-states-10m.json')
      .then((res) => res.json())
      .then((data: any) => {
        const states = feature(data, data.objects.states) as any;
        setUsStatesGeo(states);
      })
      .catch(() => {
        // US states data not available, silently ignore
      });
  }, []);

  /* ── Grouped data ── */
  const countryMap = useMemo(() => {
    const map = new Map<string, Profile[]>();
    for (const p of profiles) {
      if (!p.country) continue;
      const existing = map.get(p.country) ?? [];
      existing.push(p);
      map.set(p.country, existing);
    }
    return map;
  }, [profiles]);

  const sortedCountries = useMemo(() => {
    return Array.from(countryMap.entries())
      .sort((a, b) => b[1].length - a[1].length);
  }, [countryMap]);

  const totalInvestigators = profiles.length;
  const totalCountries = countryMap.size;
  const totalVerified = profiles.filter((p) => p.is_verified).length;

  /* ── Projection ── */
  const projection = useMemo(
    () =>
      geoNaturalEarth1()
        .scale(155)
        .translate([width / 2, height / 2])
        .precision(0.1),
    [],
  );

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);
  const graticuleData = useMemo(() => geoGraticule()(), []);
  const graticulePath = useMemo(
    () => pathGenerator(graticuleData) ?? '',
    [pathGenerator, graticuleData],
  );
  const spherePath = useMemo(
    () => pathGenerator({ type: 'Sphere' } as any) ?? '',
    [pathGenerator],
  );

  /* ── Should show US states? ── */
  const showUsStates = useMemo(() => {
    return usStatesGeo && transform.k > 2.5;
  }, [usStatesGeo, transform.k]);

  /* ── Search results ── */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return sortedCountries
      .filter(([country]) => country.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery, sortedCountries]);

  /* All country names for search (including those without investigators) */
  const allCountrySearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return Object.keys(COUNTRY_ISO)
      .filter((c) => c.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery]);

  /* ── Connection arcs (great-circle-ish) ── */
  const connectionArcs = useMemo(() => {
    if (!selectedCountry || !worldGeo) return [];

    const selectedFeat = worldGeo.features.find(
      (f: any) => {
        const id = COUNTRY_ISO[selectedCountry];
        return id && (String(f.id) === id || String(f.id) === String(parseInt(id, 10)));
      },
    );
    if (!selectedFeat) return [];

    const sourceCentroid = pathGenerator.centroid(selectedFeat);
    if (!sourceCentroid || isNaN(sourceCentroid[0])) return [];

    const arcs: { key: string; path: string; country: string }[] = [];

    for (const [country] of sortedCountries) {
      if (country === selectedCountry) continue;
      const cId = COUNTRY_ISO[country];
      if (!cId) continue;
      const feat = worldGeo.features.find(
        (f: any) => String(f.id) === cId || String(f.id) === String(parseInt(cId, 10)),
      );
      if (!feat) continue;
      const targetCentroid = pathGenerator.centroid(feat);
      if (!targetCentroid || isNaN(targetCentroid[0])) continue;

      const sx = sourceCentroid[0];
      const sy = sourceCentroid[1];
      const tx = targetCentroid[0];
      const ty = targetCentroid[1];

      // Quadratic bezier: lift the control point above the midpoint
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;
      const dist = Math.sqrt((tx - sx) ** 2 + (ty - sy) ** 2);
      const lift = Math.min(dist * 0.35, 80);
      const cy2 = my - lift;

      const d = `M${sx},${sy} Q${mx},${cy2} ${tx},${ty}`;
      arcs.push({ key: `arc-${country}`, path: d, country });
    }

    return arcs;
  }, [selectedCountry, worldGeo, sortedCountries, pathGenerator]);

  /* ── d3-zoom setup ── */
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current as Element);

    const zoomBehavior = d3Zoom()
      .scaleExtent([1, 8])
      .translateExtent([[-100, -50], [width + 100, height + 50]])
      .filter((event: any) => {
        // Allow wheel events and touch events, block double-click zoom
        if (event.type === 'dblclick') return false;
        return true;
      })
      .on('zoom', (event: any) => {
        const t = event.transform;
        setTransform({ x: t.x, y: t.y, k: t.k });

        // Dismiss hint on first interaction
        if (!hintDismissed.current) {
          hintDismissed.current = true;
          setShowZoomHint(false);
        }
      });

    svg.call(zoomBehavior as any);

    // Allow touch zoom (pinch) while preventing page scroll on the map
    svg.style('touch-action', 'none');

    zoomBehaviorRef.current = zoomBehavior;

    return () => {
      svg.on('.zoom', null);
    };
  }, [worldGeo]);

  /* ── Country helpers ── */
  const getCountryNameFromFeature = useCallback(
    (feat: any): string | null => {
      const id = String(feat.id);
      if (ID_TO_COUNTRY[id]) return ID_TO_COUNTRY[id];
      const padded = id.padStart(3, '0');
      if (ID_TO_COUNTRY[padded]) return ID_TO_COUNTRY[padded];
      return feat.properties?.name ?? null;
    },
    [],
  );

  /* ── Find topojson feature for a country name ── */
  const findFeatureForCountry = useCallback(
    (countryName: string) => {
      if (!worldGeo) return null;
      const id = COUNTRY_ISO[countryName];
      if (!id) return null;
      return worldGeo.features.find(
        (f: any) =>
          String(f.id) === id ||
          String(f.id) === String(parseInt(id, 10)),
      ) ?? null;
    },
    [worldGeo],
  );

  /* ── Zoom to a country ── */
  const zoomToCountry = useCallback(
    (countryName: string) => {
      if (!svgRef.current || !zoomBehaviorRef.current) return;

      const feat = findFeatureForCountry(countryName);
      if (!feat) return;

      const [[x0, y0], [x1, y1]] = pathGenerator.bounds(feat);
      const dx = x1 - x0;
      const dy = y1 - y0;
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));
      const tx = width / 2 - scale * cx;
      const ty = height / 2 - scale * cy;

      const newTransform = zoomIdentity.translate(tx, ty).scale(scale);
      const svg = select(svgRef.current as Element);

      (svg as any)
        .transition()
        .duration(750)
        .call(zoomBehaviorRef.current.transform, newTransform);
    },
    [findFeatureForCountry, pathGenerator],
  );

  /* ── Select country handler ── */
  const selectCountry = useCallback(
    (countryName: string) => {
      setSelectedCountry(countryName);
      zoomToCountry(countryName);
      setSearchQuery('');
      setSearchFocused(false);

      if (isMobile) {
        setMobileSheetOpen(true);
      } else {
        setTimeout(() => {
          detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 800);
      }
    },
    [zoomToCountry, isMobile],
  );

  /* ── Map click handler ── */
  const handleCountryClick = useCallback(
    (feat: any) => {
      const name = getCountryNameFromFeature(feat);
      if (name && countryMap.has(name)) {
        selectCountry(name);
      }
    },
    [getCountryNameFromFeature, countryMap, selectCountry],
  );

  /* ── Hover handler ── */
  const handleCountryHover = useCallback(
    (feat: any, e: React.MouseEvent) => {
      const name = getCountryNameFromFeature(feat);
      if (name) {
        setHoveredCountry(name);
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (svgRect) {
          setTooltipPos({
            x: e.clientX - svgRect.left,
            y: e.clientY - svgRect.top,
          });
        }
      }
    },
    [getCountryNameFromFeature],
  );

  /* ── Fill/stroke helpers ── */
  const getCountryFill = useCallback(
    (feat: any): string => {
      const name = getCountryNameFromFeature(feat);
      if (!name) return '#0f172a';
      const isSelected = name === selectedCountry;
      const isHovered = name === hoveredCountry;
      const hasInvestigators = countryMap.has(name);
      const isSearchMatch = searchQuery.trim() && name.toLowerCase().includes(searchQuery.toLowerCase());

      if (isSelected) return 'url(#active-gradient)';
      if (isSearchMatch && hasInvestigators) return '#7c3aed';
      if (isSearchMatch) return '#4c1d95';
      if (isHovered && hasInvestigators) return '#2563eb';
      if (isHovered) return '#1e3a5f';
      if (hasInvestigators) return '#1d4ed8';
      return '#0f172a';
    },
    [getCountryNameFromFeature, selectedCountry, hoveredCountry, countryMap, searchQuery],
  );

  const getCountryStroke = useCallback(
    (feat: any): string => {
      const name = getCountryNameFromFeature(feat);
      if (!name) return '#1e293b';
      const isSelected = name === selectedCountry;
      const isHovered = name === hoveredCountry;
      const hasInvestigators = countryMap.has(name);
      const isSearchMatch = searchQuery.trim() && name.toLowerCase().includes(searchQuery.toLowerCase());

      if (isSelected) return '#38bdf8';
      if (isSearchMatch) return '#a78bfa';
      if (isHovered) return '#3b82f6';
      if (hasInvestigators) return '#2563eb';
      return '#1e293b';
    },
    [getCountryNameFromFeature, selectedCountry, hoveredCountry, countryMap, searchQuery],
  );

  /* ── Zoom controls ── */
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = select(svgRef.current as Element);
    (svg as any).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.5);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = select(svgRef.current as Element);
    (svg as any).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.67);
  }, []);

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = select(svgRef.current as Element);
    (svg as any)
      .transition()
      .duration(750)
      .call(zoomBehaviorRef.current.transform, zoomIdentity);
    setSelectedCountry(null);
    setMobileSheetOpen(false);
  }, []);

  /* ── Search handlers ── */
  const handleSearchSubmit = useCallback(() => {
    const results = searchQuery.trim()
      ? allCountrySearchResults
      : [];
    if (results.length > 0) {
      const first = results[0];
      if (countryMap.has(first)) {
        selectCountry(first);
      } else {
        zoomToCountry(first);
        setSearchQuery('');
        setSearchFocused(false);
      }
    }
  }, [searchQuery, allCountrySearchResults, countryMap, selectCountry, zoomToCountry]);

  const selectedProfiles = selectedCountry ? countryMap.get(selectedCountry) ?? [] : [];

  /* ── Grid pattern for radar effect ── */
  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const step = 40;
    for (let x = 0; x <= width; x += step) {
      lines.push({ x1: x, y1: 0, x2: x, y2: height });
    }
    for (let y = 0; y <= height; y += step) {
      lines.push({ x1: 0, y1: y, x2: width, y2: y });
    }
    return lines;
  }, []);

  /* ────────────────────────────────────────────── */
  /*  Render                                        */
  /* ────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* ── Back button ── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/people"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Forum
        </Link>
      </div>

      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[radial-gradient(ellipse,rgba(59,130,246,0.12),transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                Global Directory
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="mx-auto mt-5 max-w-3xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            The global directory,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              visualised
            </span>
          </h1>

          {/* Stats row */}
          <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              { label: 'Investigators', value: totalInvestigators, color: 'from-cyan-400 to-blue-400' },
              { label: 'Countries', value: totalCountries, color: 'from-violet-400 to-purple-400' },
              { label: 'Verified', value: totalVerified, color: 'from-pink-400 to-rose-400' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-center backdrop-blur-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {stat.label}
                </p>
                <p className={`mt-1 bg-gradient-to-r ${stat.color} bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl`}>
                  {loading ? '--' : stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interactive Map Section ── */}
      <div className="relative mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#030712]">
          <div className="relative">
            {loading || !worldGeo ? (
              <div className="flex h-[70vh] items-center justify-center md:h-[500px]">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                  <span className="text-sm text-slate-500">Loading network data...</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* ── Floating search bar on the map ── */}
                <div className="absolute left-3 top-3 z-30 w-64 sm:left-4 sm:top-4 sm:w-72">
                  <div className="relative">
                    <div className="flex items-center rounded-xl border border-white/10 bg-[#0f172a]/90 shadow-xl backdrop-blur-md">
                      <svg className="ml-3 h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSearchSubmit();
                          if (e.key === 'Escape') {
                            setSearchQuery('');
                            setSearchFocused(false);
                            searchInputRef.current?.blur();
                          }
                        }}
                        placeholder="Search countries..."
                        className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                      />
                      {searchQuery && (
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                          className="mr-2 rounded p-1 text-slate-500 transition hover:text-white"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Search dropdown */}
                    {searchFocused && searchQuery.trim() && allCountrySearchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-[#0f172a]/95 py-1 shadow-2xl backdrop-blur-md">
                        {allCountrySearchResults.map((country) => {
                          const hasPI = countryMap.has(country);
                          return (
                            <button
                              key={country}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                if (hasPI) {
                                  selectCountry(country);
                                } else {
                                  zoomToCountry(country);
                                  setSearchQuery('');
                                  setSearchFocused(false);
                                }
                              }}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-white/[0.06]"
                            >
                              <span className="text-base">{getCountryFlag(country)}</span>
                              <span className="flex-1 text-white">{country}</span>
                              {hasPI && (
                                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                                  {countryMap.get(country)!.length} PI{countryMap.get(country)!.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Zoom hint overlay ── */}
                {showZoomHint && (
                  <div className="zoom-hint-anim pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <div className="rounded-xl border border-white/10 bg-[#0f172a]/80 px-5 py-3 shadow-xl backdrop-blur-md">
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        {isMobile ? (
                          <>
                            <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                            </svg>
                            <span>Pinch to zoom &middot; Drag to pan</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                            </svg>
                            <span>Scroll to zoom &middot; Drag to pan</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${width} ${height}`}
                  className="h-[70vh] w-full select-none md:h-auto"
                  style={{ background: '#030712', cursor: 'grab', minHeight: isMobile ? '70vh' : undefined }}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  <defs>
                    <linearGradient id="active-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="50%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                    <linearGradient id="selected-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                    <linearGradient id="investigator-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e3a8a" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="country-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#3b82f6" floodOpacity="0.4" />
                    </filter>
                    <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    {/* Grid pattern for radar/tech effect */}
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59,130,246,0.03)" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  {/* Everything inside this <g> gets zoomed/panned */}
                  <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
                    {/* Ocean / sphere */}
                    <path
                      d={spherePath}
                      fill="#030712"
                      stroke="rgba(59,130,246,0.06)"
                      strokeWidth="0.5"
                    />

                    {/* Grid pattern overlay */}
                    <rect
                      x="0" y="0" width={width} height={height}
                      fill="url(#grid-pattern)"
                      opacity="1"
                    />

                    {/* Graticule */}
                    <path
                      d={graticulePath}
                      fill="none"
                      stroke="rgba(255,255,255,0.025)"
                      strokeWidth="0.3"
                    />

                    {/* Countries */}
                    {worldGeo.features.map((feat: any, idx: number) => {
                      const d = pathGenerator(feat);
                      if (!d) return null;

                      const name = getCountryNameFromFeature(feat);
                      const isActive = name ? countryMap.has(name) : false;
                      const isSelected = name === selectedCountry;

                      return (
                        <path
                          key={feat.id ?? idx}
                          d={d}
                          fill={getCountryFill(feat)}
                          stroke={getCountryStroke(feat)}
                          strokeWidth={isSelected ? 1.5 / transform.k : 0.4 / transform.k}
                          className={`${isActive ? 'cursor-pointer' : ''} ${mapReady ? 'country-fade-in' : ''}`}
                          style={{
                            transition: 'fill 0.2s ease, stroke 0.2s ease',
                            animationDelay: mapReady ? `${Math.min(idx * 8, 800)}ms` : '0ms',
                          }}
                          filter={isActive && !isSelected ? 'url(#country-glow)' : isSelected ? 'url(#glow)' : undefined}
                          onMouseMove={(e) => handleCountryHover(feat, e)}
                          onMouseLeave={() => setHoveredCountry(null)}
                          onClick={() => handleCountryClick(feat)}
                        />
                      );
                    })}

                    {/* US State boundaries when zoomed in */}
                    {showUsStates && usStatesGeo.features.map((stateFeat: any, i: number) => {
                      const d = pathGenerator(stateFeat);
                      if (!d) return null;
                      return (
                        <path
                          key={`us-state-${stateFeat.id ?? i}`}
                          d={d}
                          fill="none"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth={0.3 / transform.k}
                          style={{ pointerEvents: 'none' }}
                        />
                      );
                    })}

                    {/* Connection arcs */}
                    {connectionArcs.map((arc) => (
                      <path
                        key={arc.key}
                        d={arc.path}
                        fill="none"
                        stroke="rgba(34,211,238,0.35)"
                        strokeWidth={1 / transform.k}
                        strokeDasharray={`4 ${3}`}
                        className="arc-line"
                        style={{ pointerEvents: 'none' }}
                      />
                    ))}

                    {/* Pulse dots at country centroids */}
                    {sortedCountries.map(([country, members]) => {
                      const feat = findFeatureForCountry(country);
                      if (!feat) return null;
                      const centroid = pathGenerator.centroid(feat);
                      if (!centroid || isNaN(centroid[0])) return null;

                      const isSelected = country === selectedCountry;
                      const count = members.length;
                      const r = Math.max(2.5, Math.min(8, 2.5 + count * 0.7));

                      return (
                        <g
                          key={`dot-${country}`}
                          className="cursor-pointer"
                          onClick={() => selectCountry(country)}
                          onMouseMove={(e) => {
                            setHoveredCountry(country);
                            const svgRect = svgRef.current?.getBoundingClientRect();
                            if (svgRect) {
                              setTooltipPos({
                                x: e.clientX - svgRect.left,
                                y: e.clientY - svgRect.top,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredCountry(null)}
                        >
                          {/* Outer pulse ring */}
                          <circle
                            cx={centroid[0]}
                            cy={centroid[1]}
                            r={r + 4}
                            fill="none"
                            stroke={isSelected ? 'rgba(56,189,248,0.5)' : 'rgba(59,130,246,0.3)'}
                            strokeWidth={0.8 / transform.k}
                          >
                            <animate
                              attributeName="r"
                              from={r + 1}
                              to={r + 10}
                              dur="2.5s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              from="0.7"
                              to="0"
                              dur="2.5s"
                              repeatCount="indefinite"
                            />
                          </circle>

                          {/* Second pulse ring (staggered) */}
                          <circle
                            cx={centroid[0]}
                            cy={centroid[1]}
                            r={r + 2}
                            fill="none"
                            stroke={isSelected ? 'rgba(56,189,248,0.3)' : 'rgba(59,130,246,0.2)'}
                            strokeWidth={0.5 / transform.k}
                          >
                            <animate
                              attributeName="r"
                              from={r}
                              to={r + 8}
                              dur="2.5s"
                              begin="1.25s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              from="0.5"
                              to="0"
                              dur="2.5s"
                              begin="1.25s"
                              repeatCount="indefinite"
                            />
                          </circle>

                          {/* Glow halo */}
                          <circle
                            cx={centroid[0]}
                            cy={centroid[1]}
                            r={r + 2}
                            fill={isSelected ? 'rgba(56,189,248,0.15)' : 'rgba(59,130,246,0.1)'}
                            filter="url(#dot-glow)"
                          />

                          {/* Main dot */}
                          <circle
                            cx={centroid[0]}
                            cy={centroid[1]}
                            r={r}
                            fill={isSelected ? '#38bdf8' : '#3b82f6'}
                            stroke={isSelected ? '#7dd3fc' : '#60a5fa'}
                            strokeWidth={isSelected ? 1.5 / transform.k : 0.8 / transform.k}
                            style={{ filter: 'drop-shadow(0 0 3px rgba(59,130,246,0.5))' }}
                          />

                          {/* Count label */}
                          {count >= 2 && (
                            <text
                              x={centroid[0]}
                              y={centroid[1]}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="white"
                              fontSize={Math.max(5, r * 0.9) / Math.max(1, transform.k * 0.5)}
                              fontWeight="700"
                              style={{ pointerEvents: 'none' }}
                            >
                              {count}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                </svg>

                {/* Tooltip overlay (outside SVG for better styling) */}
                {hoveredCountry && !isMobile && (
                  <div
                    className="pointer-events-none absolute z-50 rounded-xl border border-white/10 bg-[#0f172a]/95 px-4 py-2.5 shadow-2xl backdrop-blur-md"
                    style={{
                      left: Math.min(tooltipPos.x + 14, (svgRef.current?.getBoundingClientRect().width ?? 960) - 180),
                      top: tooltipPos.y - 12,
                      transform: 'translateY(-100%)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCountryFlag(hoveredCountry)}</span>
                      <span className="text-sm font-semibold text-white">{hoveredCountry}</span>
                    </div>
                    {countryMap.has(hoveredCountry) ? (
                      <p className="mt-0.5 text-xs font-medium text-cyan-300">
                        {countryMap.get(hoveredCountry)!.length} investigator{countryMap.get(hoveredCountry)!.length !== 1 ? 's' : ''}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-slate-500">No investigators yet</p>
                    )}
                  </div>
                )}

                {/* Zoom controls — floating bottom-right, bigger on mobile */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
                  <button
                    onClick={handleZoomIn}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0f172a]/80 text-white/70 shadow-lg backdrop-blur-md transition hover:bg-[#1e293b]/90 hover:text-white md:h-9 md:w-9 md:rounded-lg"
                    aria-label="Zoom in"
                  >
                    <svg className="h-5 w-5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0f172a]/80 text-white/70 shadow-lg backdrop-blur-md transition hover:bg-[#1e293b]/90 hover:text-white md:h-9 md:w-9 md:rounded-lg"
                    aria-label="Zoom out"
                  >
                    <svg className="h-5 w-5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0f172a]/80 text-white/70 shadow-lg backdrop-blur-md transition hover:bg-[#1e293b]/90 hover:text-white md:h-9 md:w-9 md:rounded-lg"
                    aria-label="Reset zoom"
                    title="Reset zoom"
                  >
                    <svg className="h-5 w-5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Legend bar */}
          <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-2.5">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.5)]" />
                <span className="text-[11px] text-slate-500">Has investigators</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30" />
                <span className="text-[11px] text-slate-500">Selected</span>
              </div>
              {selectedCountry && connectionArcs.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-4 rounded bg-cyan-400/50" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(34,211,238,0.5) 0, rgba(34,211,238,0.5) 3px, transparent 3px, transparent 6px)' }} />
                  <span className="text-[11px] text-slate-500">Network connections</span>
                </div>
              )}
            </div>
            <span className="hidden text-[11px] text-slate-600 sm:inline">
              {totalCountries} countries &middot; {totalInvestigators} investigators
            </span>
          </div>
        </div>
      </div>

      {/* ── Country pills (horizontal scroll) ── */}
      {!loading && sortedCountries.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div
            ref={pillsRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
            style={{ scrollbarWidth: 'thin' }}
          >
            {sortedCountries.map(([country, members]) => {
              const isSelected = country === selectedCountry;
              return (
                <button
                  key={`pill-${country}`}
                  onClick={() => selectCountry(country)}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition md:px-4 md:py-2 ${
                    isSelected
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                      : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="text-lg md:text-base">{getCountryFlag(country)}</span>
                  <span>{country}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold md:px-1.5 md:text-[10px] ${
                      isSelected
                        ? 'bg-cyan-400/20 text-cyan-300'
                        : 'bg-white/[0.08] text-slate-500'
                    }`}
                  >
                    {members.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Country Detail Panel (desktop) ── */}
      <div className={`mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 ${isMobile && mobileSheetOpen ? 'hidden' : ''}`}>
        <div ref={detailRef}>
          {selectedCountry && !isMobile ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f24] p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCountryFlag(selectedCountry)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedCountry}</h2>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {selectedProfiles.length} investigator{selectedProfiles.length !== 1 ? 's' : ''} registered
                      {connectionArcs.length > 0 && (
                        <span className="ml-2 text-cyan-400/70">
                          &middot; Connected to {connectionArcs.length} other {connectionArcs.length === 1 ? 'country' : 'countries'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/people?country=${encodeURIComponent(selectedCountry)}`}
                    className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white sm:inline-flex"
                  >
                    View all in directory
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedCountry(null);
                      handleResetZoom();
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                    aria-label="Close"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Investigator cards grid */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        src={profile.avatar_url}
                        name={profile.full_name}
                        size={48}
                        className="shrink-0 ring-2 ring-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${profile.username ?? profile.id}`}
                            className="truncate text-sm font-semibold text-white transition hover:text-cyan-300"
                          >
                            {profile.full_name ?? 'Anonymous'}
                          </Link>
                          {profile.is_verified && (
                            <svg className="h-4 w-4 shrink-0 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                        </div>
                        {profile.specialisation && (
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {profile.specialisation}
                          </p>
                        )}
                        {profile.headline && (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {profile.headline}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        href={`/profile/${profile.username ?? profile.id}`}
                        className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        View profile
                      </Link>
                      <Link
                        href={`/messages?to=${profile.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/20"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Message
                      </Link>
                      {profile.available_for_referrals && (
                        <span className="ml-auto inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          Open to referrals
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: View all link at bottom */}
              <div className="mt-6 hidden sm:block">
                <Link
                  href={`/people?country=${encodeURIComponent(selectedCountry)}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
                >
                  View all {selectedCountry} investigators in directory
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            !loading && !isMobile && (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01]">
                <div className="text-center">
                  <svg className="mx-auto h-10 w-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="mt-3 text-sm text-slate-600">
                    Click a country on the map or select one above to explore investigators
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Mobile Bottom Sheet ── */}
      {isMobile && mobileSheetOpen && selectedCountry && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              setMobileSheetOpen(false);
              setSelectedCountry(null);
              handleResetZoom();
            }}
          />

          {/* Sheet */}
          <div className="bottom-sheet-enter absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-white/[0.1] bg-[#0a0f24]">
            {/* Drag handle */}
            <div className="sticky top-0 z-10 flex justify-center bg-[#0a0f24] pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div className="px-5 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCountryFlag(selectedCountry)}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedCountry}</h2>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {selectedProfiles.length} investigator{selectedProfiles.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileSheetOpen(false);
                    setSelectedCountry(null);
                    handleResetZoom();
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cards */}
              <div className="mt-6 grid gap-3">
                {selectedProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        src={profile.avatar_url}
                        name={profile.full_name}
                        size={44}
                        className="shrink-0 ring-2 ring-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${profile.username ?? profile.id}`}
                            className="truncate text-sm font-semibold text-white"
                          >
                            {profile.full_name ?? 'Anonymous'}
                          </Link>
                          {profile.is_verified && (
                            <svg className="h-4 w-4 shrink-0 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                        </div>
                        {profile.specialisation && (
                          <p className="mt-0.5 truncate text-xs text-slate-400">{profile.specialisation}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        href={`/profile/${profile.username ?? profile.id}`}
                        className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300"
                      >
                        View profile
                      </Link>
                      <Link
                        href={`/messages?to=${profile.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-400"
                      >
                        Message
                      </Link>
                      {profile.available_for_referrals && (
                        <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          Referrals
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* View all link */}
              <div className="mt-5">
                <Link
                  href={`/people?country=${encodeURIComponent(selectedCountry)}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08]"
                >
                  View all in directory
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
