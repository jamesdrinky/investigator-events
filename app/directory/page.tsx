'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ShieldCheck,
  MapPin,
  Filter,
  MessageSquare,
  ChevronDown,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';
import { getCountryFlag } from '@/lib/utils/location';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Investigator = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  country: string | null;
  specialisation: string | null;
  headline: string | null;
  profile_color: string | null;
  bio: string | null;
  badges: string[] | null;
  available_for_referrals: boolean;
  last_seen: string | null;
  is_verified: boolean;
  associations: { association_name: string; role: string | null }[];
  follower_count: number;
};

const SPECIALISATIONS = [
  'Corporate Investigation',
  'Due Diligence',
  'Fraud Investigation',
  'Insurance Investigation',
  'Background Checks',
  'Digital Forensics',
  'Surveillance',
  'Missing Persons',
  'Financial Crime',
  'Intellectual Property',
  'OSINT',
  'Counter Surveillance',
  'Cyber Investigation',
  'Asset Tracing',
  'Process Serving',
  'Litigation Support',
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function isOnline(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 15 * 60 * 1000;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DirectoryPage() {
  const [investigators, setInvestigators] = useState<Investigator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [assocFilter, setAssocFilter] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [associations, setAssociations] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  /* ---- Fetch data ---- */
  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();

      // Fetch public profiles
      const { data: profiles } = await (supabase
        .from('profiles')
        .select('id, full_name, avatar_url, username, country, specialisation, headline, profile_color, bio, badges, available_for_referrals, last_seen') as any)
        .eq('is_public', true)
        .order('last_seen', { ascending: false, nullsFirst: false })
        .limit(500);

      if (!profiles || profiles.length === 0) {
        setLoading(false);
        return;
      }

      const userIds = profiles.map((p: any) => p.id);

      // Fetch verifications
      const { data: verifications } = await supabase
        .from('member_verifications' as any)
        .select('user_id, status')
        .eq('status', 'verified')
        .in('user_id', userIds);

      const verifiedSet = new Set(
        (verifications ?? []).map((v: any) => v.user_id)
      );

      // Fetch associations
      const { data: userAssocs } = await supabase
        .from('user_associations' as any)
        .select('user_id, association_name, role')
        .in('user_id', userIds);

      const assocMap: Record<string, { association_name: string; role: string | null }[]> = {};
      const assocNames = new Set<string>();
      (userAssocs ?? []).forEach((a: any) => {
        if (!assocMap[a.user_id]) assocMap[a.user_id] = [];
        assocMap[a.user_id].push({ association_name: a.association_name, role: a.role });
        assocNames.add(a.association_name);
      });

      // Fetch follower counts
      const { data: followers } = await supabase
        .from('followers')
        .select('following_id')
        .in('following_id', userIds);

      const followerCounts: Record<string, number> = {};
      (followers ?? []).forEach((f) => {
        followerCounts[f.following_id] = (followerCounts[f.following_id] ?? 0) + 1;
      });

      // Build investigators list
      const countrySet = new Set<string>();
      const list: Investigator[] = profiles.map((p: any) => {
        if (p.country) countrySet.add(p.country);
        return {
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          username: p.username,
          country: p.country,
          specialisation: p.specialisation,
          headline: p.headline,
          profile_color: p.profile_color,
          bio: p.bio,
          badges: p.badges as string[] | null,
          available_for_referrals: !!(p as any).available_for_referrals,
          last_seen: p.last_seen as string | null,
          is_verified: verifiedSet.has(p.id),
          associations: assocMap[p.id] ?? [],
          follower_count: followerCounts[p.id] ?? 0,
        };
      });

      // Sort: verified first, then by last_seen desc
      list.sort((a, b) => {
        if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
        const aTime = a.last_seen ? new Date(a.last_seen).getTime() : 0;
        const bTime = b.last_seen ? new Date(b.last_seen).getTime() : 0;
        return bTime - aTime;
      });

      setInvestigators(list);
      setAssociations(Array.from(assocNames).sort());
      setCountries(Array.from(countrySet).sort());
      setLoading(false);
    }

    load();
  }, []);

  /* ---- Filter ---- */
  const filtered = useMemo(() => {
    return investigators.filter((inv) => {
      if (verifiedOnly && !inv.is_verified) return false;
      if (countryFilter && inv.country !== countryFilter) return false;
      if (specFilter && inv.specialisation !== specFilter) return false;
      if (assocFilter && !inv.associations.some((a) => a.association_name === assocFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = inv.full_name?.toLowerCase().includes(q);
        const matchHeadline = inv.headline?.toLowerCase().includes(q);
        const matchSpec = inv.specialisation?.toLowerCase().includes(q);
        if (!matchName && !matchHeadline && !matchSpec) return false;
      }
      return true;
    });
  }, [investigators, search, countryFilter, specFilter, assocFilter, verifiedOnly]);

  const hasFilters = search || countryFilter || specFilter || assocFilter || verifiedOnly;

  function clearFilters() {
    setSearch('');
    setCountryFilter('');
    setSpecFilter('');
    setAssocFilter('');
    setVerifiedOnly(false);
  }

  /* ---- Render ---- */
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden bg-[linear-gradient(165deg,#06091a_0%,#0a1228_35%,#0d1840_60%,#0a1228_100%)] pb-12 pt-28 sm:pb-16 sm:pt-36">
        {/* Glow effects */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-blue-500/[0.07] blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-indigo-500/[0.05] blur-[100px]" />

        <div className="container-shell relative z-10 text-center">
          <Link href="/people" className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/50 transition hover:bg-white/10 hover:text-white">
            ← Back to Community
          </Link>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Directory
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Find a trusted investigator, anywhere in the world
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Browse verified professionals endorsed by association presidents. Search by specialisation, country, or association membership.
          </p>

          {/* Hero search */}
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm transition focus-within:border-blue-400/30 focus-within:bg-white/[0.09]">
            <Search className="h-5 w-5 flex-shrink-0 text-slate-400" />
            <input
              className="flex-1 border-0 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              placeholder="Search by name, headline, or specialisation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ---- Sticky filter bar ---- */}
      <div className="sticky top-16 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="container-shell flex flex-wrap items-center gap-3 py-3">
          <Filter className="hidden h-4 w-4 text-slate-400 sm:block" />

          {/* Country */}
          <div className="relative">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {getCountryFlag(c)} {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Specialisation */}
          <div className="relative">
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
            >
              <option value="">All Specialisations</option>
              {SPECIALISATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Association */}
          <div className="relative">
            <select
              value={assocFilter}
              onChange={(e) => setAssocFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
            >
              <option value="">All Associations</option>
              {associations.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Verified toggle */}
          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              verifiedOnly
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified only
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Result count & clear */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {loading ? 'Loading...' : `${filtered.length} investigator${filtered.length !== 1 ? 's' : ''}`}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---- Grid ---- */}
      <div className="container-shell py-8 sm:py-12">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="mx-auto max-w-md py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-7 w-7 text-slate-300" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-900">No investigators match your search</h2>
            <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or broadening your search terms.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((inv) => {
              const color = inv.profile_color ?? '#3b82f6';
              const profileHref = (inv.username ? `/profile/${inv.username}` : `/profile/${inv.id}`) as any;

              return (
                <div
                  key={inv.id}
                  className="group relative rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  {/* Available for referrals dot */}
                  {inv.available_for_referrals && (
                    <div className="absolute right-4 top-4 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-medium text-emerald-600">Available</span>
                    </div>
                  )}

                  {/* Avatar + name row */}
                  <div className="flex items-start gap-4">
                    <Link href={profileHref} className="relative flex-shrink-0">
                      <UserAvatar src={inv.avatar_url} name={inv.full_name} size={56} color={color} />
                      {inv.is_verified && (
                        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={profileHref} className="group/name">
                        <h3 className="truncate text-sm font-bold text-slate-900 transition group-hover/name:text-blue-600">
                          {inv.full_name ?? 'Investigator'}
                        </h3>
                      </Link>
                      {inv.headline && (
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                          {inv.headline}
                        </p>
                      )}
                      {inv.country && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3" />
                          <span>{getCountryFlag(inv.country)}</span>
                          <span>{inv.country}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {inv.specialisation && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600">
                        {inv.specialisation}
                      </span>
                    )}
                    {inv.associations.slice(0, 2).map((a) => (
                      <span
                        key={a.association_name}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {a.association_name}
                      </span>
                    ))}
                    {inv.associations.length > 2 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        +{inv.associations.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {isOnline(inv.last_seen) ? (
                        <span className="font-medium text-emerald-500">Online</span>
                      ) : (
                        <span>{timeAgo(inv.last_seen)}</span>
                      )}
                    </div>
                    <Link
                      href={`/messages?to=${inv.id}`}
                      className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Message
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- CTA ---- */}
      <section className="border-t border-slate-200/60 bg-gradient-to-b from-slate-50 to-white">
        <div className="container-shell py-16 text-center sm:py-20">
          <div className="mx-auto max-w-lg rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Are you an investigator?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Join the directory, get verified by your association, and start receiving referrals from peers worldwide.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Get listed
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
