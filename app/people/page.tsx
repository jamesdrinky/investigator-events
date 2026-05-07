'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, UserPlus, UserCheck, Users, TrendingUp, Globe, BookUser, XCircle, MapPin, Briefcase, Calendar, Mail, ArrowRight, Star } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { getCountryFlag } from '@/lib/utils/location';
import { CommunityFeed } from '@/components/CommunityFeed';
import { CaseReferralBoard } from '@/components/CaseReferralBoard';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ReviewsTab = dynamic(() => import('@/components/ReviewsContent'), { loading: () => <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" /></div> });

type Person = {
  id: string; full_name: string | null; avatar_url: string | null;
  country: string | null; specialisation: string | null; profile_color: string | null;
  username: string | null;
};

type Tab = 'feed' | 'discover' | 'lfg' | 'reviews';

function PeoplePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'feed';

  const [suggested, setSuggested] = useState<Person[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [togglingFollow, setTogglingFollow] = useState<string | null>(null);
  const [tab, setTabState] = useState<Tab>(initialTab);

  const [pageLoading, setPageLoading] = useState(true);
  // Discover state
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState<string | null>(null);
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({});

  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', t);
    window.history.replaceState({}, '', url.toString());
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: follows } = await supabase.from('followers').select('following_id').eq('follower_id', uid);
        setFollowing(new Set((follows ?? []).map((f) => f.following_id).filter((id): id is string => id !== null)));

        const { data: myProfile } = await supabase.from('profiles').select('country, specialisation').eq('id', uid).single();
        if (myProfile) {
          let q = supabase.from('profiles').select('id, full_name, avatar_url, country, specialisation, profile_color, username').eq('is_public', true).neq('id', uid).limit(8);
          if (myProfile.country) {
            const filters = [`country.eq.${myProfile.country}`];
            if (myProfile.specialisation) filters.push(`specialisation.eq.${myProfile.specialisation}`);
            q = q.or(filters.join(','));
          }
          const { data: sugg } = await q;
          setSuggested((sugg ?? []).filter((p) => p.full_name?.trim()));
        }
      }
    });

    supabase.from('followers').select('following_id').then(({ data }) => {
      const counts: Record<string, number> = {};
      (data ?? []).forEach((f) => { if (!f.following_id) return; counts[f.following_id] = (counts[f.following_id] ?? 0) + 1; });
      setFollowerCounts(counts);
      setPageLoading(false);
    });
  }, []);

  useEffect(() => {
    if (tab !== 'discover' || allPeople.length > 0) return;
    const supabase = createSupabaseBrowserClient();
    supabase.from('profiles').select('id, full_name, avatar_url, country, specialisation, profile_color, username').eq('is_public', true).not('full_name', 'is', null).order('created_at', { ascending: false }).limit(200).then(({ data }) => setAllPeople(data ?? []));
  }, [tab, allPeople.length]);

  const toggleFollow = async (targetId: string) => {
    if (!userId) return;
    setTogglingFollow(targetId);
    const supabase = createSupabaseBrowserClient();
    if (following.has(targetId)) {
      await supabase.from('followers').delete().eq('follower_id', userId).eq('following_id', targetId);
      setFollowing((prev) => { const next = new Set(prev); next.delete(targetId); return next; });
      setFollowerCounts((prev) => ({ ...prev, [targetId]: Math.max(0, (prev[targetId] ?? 1) - 1) }));
    } else {
      const { error: insertErr } = await supabase.from('followers').insert({ follower_id: userId, following_id: targetId });
      if (!insertErr) {
        setFollowing((prev) => new Set(prev).add(targetId));
        setFollowerCounts((prev) => ({ ...prev, [targetId]: (prev[targetId] ?? 0) + 1 }));

        const { data: myProfile } = await supabase.from('profiles').select('full_name, username').eq('id', userId).single();
        const myName = myProfile?.full_name ?? 'Someone';
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: targetId,
            actorId: userId,
            type: 'follow',
            title: `${myName} started following you`,
            link: myProfile?.username ? `/profile/${myProfile.username}` : '/people?tab=discover',
          }),
        }).catch(() => {});
      }
    }
    setTogglingFollow(null);
  };

  // Get unique specialisations for filter chips
  const specialisations = [...new Set(allPeople.map((p) => p.specialisation).filter(Boolean))] as string[];

  const filtered = allPeople.filter((p) => {
    if (p.id === userId) return false;
    if (!p.full_name?.trim()) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.full_name.toLowerCase().includes(q) && !p.country?.toLowerCase().includes(q) && !p.specialisation?.toLowerCase().includes(q)) return false;
    }
    if (specFilter && p.specialisation !== specFilter) return false;
    return true;
  });

  // Stats
  const totalPeople = allPeople.filter((p) => p.full_name?.trim()).length;
  const totalCountries = new Set(allPeople.map((p) => p.country).filter(Boolean)).size;

  const MiniCard = ({ person }: { person: Person }) => {
    const color = person.profile_color ?? '#3b82f6';
    const isFollowing = following.has(person.id);
    const inner = (
      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition hover:shadow-sm">
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: color }}>
          {person.avatar_url ? (
            <Image src={person.avatar_url} alt="" width={40} height={40} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold" style={{ backgroundColor: `${color}15`, color }}>
              {(person.full_name ?? 'U').charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{person.full_name}</p>
          <p className="truncate text-xs text-slate-400">
            {person.country ? `${getCountryFlag(person.country)} ` : ''}
            {person.specialisation ?? ''}
          </p>
        </div>
        {userId && userId !== person.id && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleFollow(person.id); }}
            disabled={togglingFollow === person.id}
            className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition ${
              isFollowing ? 'bg-blue-50 text-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isFollowing ? 'Connected' : 'Connect'}
          </button>
        )}
      </div>
    );
    return person.username ? <Link href={`/profile/${person.username}` as any}>{inner}</Link> : inner;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-5 pt-8 sm:pb-10 sm:pt-32">
        <div className="container-shell relative text-center">
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.34em] text-blue-600 sm:block sm:text-xs">Community</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:mt-3 sm:text-4xl">Forum</h1>
          <p className="mx-auto mt-2 hidden max-w-lg text-sm text-slate-500 sm:block">Share insights, promote your services, and connect with investigators worldwide.</p>

          {/* Tabs */}
          <div className="mx-auto mt-6 inline-flex max-w-full overflow-x-auto rounded-full border border-slate-200/80 bg-white p-1 shadow-sm [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setTab('feed')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm ${tab === 'feed' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <TrendingUp className="h-4 w-4" /> Feed
            </button>
            <button
              type="button"
              onClick={() => setTab('lfg')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm ${tab === 'lfg' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Referrals
            </button>
            <button
              type="button"
              onClick={() => setTab('discover')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm ${tab === 'discover' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users className="h-4 w-4" /> Discover
            </button>
            <Link
              href="/reviews"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(245,158,11,0.4),0_0_6px_rgba(249,115,22,0.3)] transition hover:brightness-110 sm:px-5 sm:text-sm"
            >
              <Star className="h-4 w-4" /> Reviews
            </Link>
          </div>

          {/* Quick links — desktop only */}
          <div className="mx-auto mt-4 hidden flex-wrap items-center justify-center gap-2.5 sm:flex">
            <Link href="/directory" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
              <BookUser className="h-3.5 w-3.5" /> Find a PI
            </Link>
            <Link href="/network" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
              <Globe className="h-3.5 w-3.5" /> Global Directory Map
            </Link>
            <Link href="/calendar" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
              <Calendar className="h-3.5 w-3.5" /> Events Calendar
            </Link>
            <Link href="/submit-event" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
              <Mail className="h-3.5 w-3.5" /> Submit an Event
            </Link>
            <Link href="/associations" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
              <Briefcase className="h-3.5 w-3.5" /> Associations
            </Link>
          </div>
        </div>
      </div>

      <div className="container-shell py-8 sm:py-12">
        {pageLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200/60 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-48 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-3/4 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : tab === 'lfg' ? (
          <CaseReferralBoard />
        ) : tab === 'feed' ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
            <CommunityFeed />

            <div className="hidden lg:block">
              {suggested.length > 0 && (
                <div className="sticky top-24 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold text-slate-900">People you may know</h3>
                  <div className="space-y-2">
                    {suggested.slice(0, 5).map((p) => <MiniCard key={p.id} person={p} />)}
                  </div>
                  <button type="button" onClick={() => setTab('discover')} className="mt-3 w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700">
                    View all
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Discover tab */
          <div>
            {/* Stats bar */}
            <div className="mx-auto mb-6 flex max-w-2xl items-center justify-center gap-6 sm:gap-10">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{totalPeople}</p>
                <p className="text-xs text-slate-500">Investigators</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{totalCountries}</p>
                <p className="text-xs text-slate-500">Countries</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{specialisations.length}</p>
                <p className="text-xs text-slate-500">Specialisations</p>
              </div>
            </div>

            {/* Search */}
            <div className="mx-auto mb-4 flex max-w-xl items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input className="flex-1 border-0 bg-transparent text-sm outline-none" placeholder="Search by name, country, or specialisation..." value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="flex-shrink-0 rounded-full p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500">
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Specialisation filter chips */}
            {specialisations.length > 0 && (
              <div className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSpecFilter(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${!specFilter ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  All
                </button>
                {specialisations.sort().map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpecFilter(specFilter === s ? null : s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${specFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Results count */}
            <p className="mb-4 text-center text-xs text-slate-400">
              {filtered.length} investigator{filtered.length !== 1 ? 's' : ''}{specFilter ? ` in ${specFilter}` : ''}{search ? ` matching "${search}"` : ''}
            </p>

            {/* Cards grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const color = p.profile_color ?? '#3b82f6';
                const isFollowing = following.has(p.id);
                const card = (
                  <div className="group rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:border-blue-200/60 hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 transition group-hover:scale-105" style={{ borderColor: color }}>
                        {p.avatar_url ? (
                          <Image src={p.avatar_url} alt="" width={56} height={56} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold" style={{ backgroundColor: `${color}15`, color }}>
                            {(p.full_name ?? 'U').charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-slate-900">{p.full_name}</p>
                          <ArrowRight className="hidden h-3 w-3 flex-shrink-0 text-blue-400 opacity-0 transition group-hover:opacity-100 sm:block" />
                        </div>
                        {p.country && (
                          <p className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="h-3 w-3" /> {getCountryFlag(p.country)} {p.country}
                          </p>
                        )}
                        {p.specialisation && <span className="mt-1.5 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600">{p.specialisation}</span>}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-400">{followerCounts[p.id] ?? 0} follower{(followerCounts[p.id] ?? 0) !== 1 ? 's' : ''}</span>
                      {userId && userId !== p.id && (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); toggleFollow(p.id); }}
                          disabled={togglingFollow === p.id}
                          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                            isFollowing ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isFollowing ? <><UserCheck className="h-3.5 w-3.5" /> Following</> : <><UserPlus className="h-3.5 w-3.5" /> Follow</>}
                        </button>
                      )}
                    </div>
                  </div>
                );
                return p.username ? <Link key={p.id} href={`/profile/${p.username}` as any} className="block">{card}</Link> : <div key={p.id}>{card}</div>;
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <Users className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-500">No investigators found</p>
                  <p className="mt-1 text-xs text-slate-400">Try a different search or filter</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PeoplePage() {
  return (
    <Suspense>
      <PeoplePageInner />
    </Suspense>
  );
}
