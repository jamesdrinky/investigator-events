'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShieldCheck, UserPlus, UserCheck, Users, TrendingUp, Globe, BookUser } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { getCountryFlag } from '@/lib/utils/location';
import { CommunityFeed } from '@/components/CommunityFeed';
import { CaseReferralBoard } from '@/components/CaseReferralBoard';

type Person = {
  id: string; full_name: string | null; avatar_url: string | null;
  country: string | null; specialisation: string | null; profile_color: string | null;
};

export default function PeoplePage() {
  const [suggested, setSuggested] = useState<Person[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [togglingFollow, setTogglingFollow] = useState<string | null>(null);
  const [tab, setTab] = useState<'feed' | 'discover' | 'lfg'>('feed');

  // Discover state
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: follows } = await supabase.from('followers').select('following_id').eq('follower_id', uid);
        setFollowing(new Set((follows ?? []).map((f) => f.following_id)));

        // Get suggested (same country or specialisation)
        const { data: myProfile } = await supabase.from('profiles').select('country, specialisation').eq('id', uid).single();
        if (myProfile) {
          let q = supabase.from('profiles').select('id, full_name, avatar_url, country, specialisation, profile_color').eq('is_public', true).neq('id', uid).limit(8);
          if (myProfile.country) q = q.or(`country.eq.${myProfile.country},specialisation.eq.${myProfile.specialisation ?? ''}`);
          const { data: sugg } = await q;
          setSuggested(sugg ?? []);
        }
      }
    });

    // Follower counts
    supabase.from('followers').select('following_id').then(({ data }) => {
      const counts: Record<string, number> = {};
      (data ?? []).forEach((f) => { counts[f.following_id] = (counts[f.following_id] ?? 0) + 1; });
      setFollowerCounts(counts);
    });
  }, []);

  // Lazy load all people only when discover tab is active
  useEffect(() => {
    if (tab !== 'discover' || allPeople.length > 0) return;
    const supabase = createSupabaseBrowserClient();
    supabase.from('profiles').select('id, full_name, avatar_url, country, specialisation, profile_color').eq('is_public', true).order('created_at', { ascending: false }).limit(200).then(({ data }) => setAllPeople(data ?? []));
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
      await supabase.from('followers').insert({ follower_id: userId, following_id: targetId });
      setFollowing((prev) => new Set(prev).add(targetId));
      setFollowerCounts((prev) => ({ ...prev, [targetId]: (prev[targetId] ?? 0) + 1 }));
    }
    setTogglingFollow(null);
  };

  const filtered = allPeople.filter((p) => {
    if (p.id === userId) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.full_name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const MiniCard = ({ person }: { person: Person }) => {
    const color = person.profile_color ?? '#3b82f6';
    const isFollowing = following.has(person.id);
    return (
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
          <p className="truncate text-sm font-semibold text-slate-900">{person.full_name ?? 'Investigator'}</p>
          <p className="truncate text-xs text-slate-400">
            {person.country ? `${getCountryFlag(person.country)} ` : ''}
            {person.specialisation ?? ''}
          </p>
        </div>
        {userId && userId !== person.id && (
          <button
            type="button"
            onClick={() => toggleFollow(person.id)}
            disabled={togglingFollow === person.id}
            className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition ${
              isFollowing ? 'bg-blue-50 text-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-6 pt-24 sm:pb-10 sm:pt-32">
        <div className="container-shell relative text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-blue-600 sm:text-xs">Community</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Community</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500">Share insights, promote your services, and connect with investigators worldwide.</p>

          {/* Tabs */}
          <div className="mx-auto mt-6 inline-flex rounded-full border border-slate-200/80 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTab('feed')}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition ${tab === 'feed' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <TrendingUp className="h-4 w-4" /> Feed
            </button>
            <button
              type="button"
              onClick={() => setTab('lfg')}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition ${tab === 'lfg' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Referrals
            </button>
            <button
              type="button"
              onClick={() => setTab('discover')}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition ${tab === 'discover' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users className="h-4 w-4" /> Discover
            </button>
          </div>

          {/* Quick links */}
          <div className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/directory" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
              <BookUser className="h-3.5 w-3.5" /> Find a PI
            </Link>
            <Link href="/network" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
              <Globe className="h-3.5 w-3.5" /> Global Network Map
            </Link>
          </div>
        </div>
      </div>

      <div className="container-shell py-8 sm:py-12">
        {tab === 'lfg' ? (
          <CaseReferralBoard />
        ) : tab === 'feed' ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
            {/* Main feed */}
            <CommunityFeed />

            {/* Sidebar: suggestions */}
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
            <div className="mx-auto mb-6 flex max-w-xl items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5">
              <Search className="h-4 w-4 text-slate-400" />
              <input className="flex-1 border-0 bg-transparent text-sm outline-none" placeholder="Search investigators..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const color = p.profile_color ?? '#3b82f6';
                const isFollowing = following.has(p.id);
                return (
                  <div key={p.id} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: color }}>
                        {p.avatar_url ? (
                          <Image src={p.avatar_url} alt="" width={56} height={56} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold" style={{ backgroundColor: `${color}15`, color }}>
                            {(p.full_name ?? 'U').charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{p.full_name ?? 'Investigator'}</p>
                        <p className="text-xs text-slate-400">
                          {p.country ? `${getCountryFlag(p.country)} ${p.country}` : ''}
                        </p>
                        {p.specialisation && <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">{p.specialisation}</span>}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-400">{followerCounts[p.id] ?? 0} followers</span>
                      {userId && userId !== p.id && (
                        <button
                          type="button"
                          onClick={() => toggleFollow(p.id)}
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
              })}
              {filtered.length === 0 && <p className="col-span-full py-12 text-center text-sm text-slate-400">No investigators found.</p>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
