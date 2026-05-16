'use client';

import { useEffect, useState } from 'react';
import { Users, ChevronRight, UserPlus, Globe, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';
import { looksLikeBotProfile } from '@/lib/utils/bot-filter';

interface Person {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  specialisation: string | null;
  country: string | null;
}

export default function MyConnectionsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [connections, setConnections] = useState<Person[]>([]);
  const [followers, setFollowers] = useState<Person[]>([]);
  const [suggested, setSuggested] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return; }
      const uid = data.user.id;
      setUserId(uid);

      // Get connections (accepted)
      const { data: connData } = await supabase
        .from('connections')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`)
        .eq('status', 'accepted');

      const connUserIds = (connData ?? []).map(c =>
        c.requester_id === uid ? c.addressee_id : c.requester_id
      ).filter((id): id is string => id !== null);

      // Get followers
      const { data: followerData } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', uid);
      const followerIds = (followerData ?? []).map(f => f.follower_id).filter((id): id is string => id !== null);

      // Get who I follow
      const { data: followingData } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', uid);
      setFollowing(new Set((followingData ?? []).map(f => f.following_id).filter(Boolean) as string[]));

      // Fetch profiles for connections
      if (connUserIds.length > 0) {
        const { data: connProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username, specialisation, country')
          .in('id', connUserIds);
        setConnections((connProfiles ?? []).filter(p => p.full_name) as Person[]);
      }

      // Fetch profiles for followers (exclude already connections)
      const connSet = new Set(connUserIds);
      const followerOnlyIds = followerIds.filter(id => !connSet.has(id) && id !== uid);
      if (followerOnlyIds.length > 0) {
        const { data: followerProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username, specialisation, country')
          .in('id', followerOnlyIds);
        setFollowers((followerProfiles ?? []).filter(p => p.full_name) as Person[]);
      }

      // Suggested: same associations or country, not already connected/following
      const allKnownIds = new Set([...connUserIds, ...followerIds, uid]);
      const [assocsRes, profileRes] = await Promise.all([
        supabase.from('user_associations').select('association_name').eq('user_id', uid),
        supabase.from('profiles').select('country').eq('id', uid).single(),
      ]);

      const assocNames = (assocsRes.data ?? []).map((a: any) => a.association_name);
      const myCountry = profileRes.data?.country;

      let suggestedPeople: Person[] = [];

      // People in same associations
      if (assocNames.length > 0) {
        const { data: assocMembers } = await supabase
          .from('user_associations')
          .select('user_id, profiles:user_id(id, full_name, avatar_url, username, specialisation, country)')
          .in('association_name', assocNames)
          .limit(30) as any;
        const fromAssocs = (assocMembers ?? [])
          .map((r: any) => r.profiles)
          .filter((p: any) => p && p.full_name && !allKnownIds.has(p.id));
        suggestedPeople.push(...fromAssocs);
      }

      // People in same country
      if (myCountry && suggestedPeople.length < 8) {
        const { data: countryPeople } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username, specialisation, country')
          .eq('country', myCountry)
          .eq('is_public', true)
          .limit(20);
        const fromCountry = (countryPeople ?? []).filter((p: any) => p.full_name && !allKnownIds.has(p.id));
        suggestedPeople.push(...fromCountry);
      }

      // Fallback: if we still have fewer than 4, pull recent public profiles
      // so the Suggested section is never empty. Users without associations
      // or country were getting no recommendations at all before this.
      if (suggestedPeople.length < 4) {
        const { data: anyPeople } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username, specialisation, country')
          .eq('is_public', true)
          .not('full_name', 'is', null)
          .order('created_at', { ascending: false })
          .limit(30);
        const fromAny = (anyPeople ?? []).filter((p: any) => p.full_name && !allKnownIds.has(p.id));
        suggestedPeople.push(...fromAny);
      }

      // Deduplicate, filter bots, slice
      const seen = new Set<string>();
      suggestedPeople = suggestedPeople.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return !looksLikeBotProfile(p as any);
      }).slice(0, 8);

      setSuggested(suggestedPeople);
      setLoading(false);
    });
  }, []);

  const toggleFollow = async (targetId: string) => {
    if (!userId) return;
    setToggling(targetId);
    const supabase = createSupabaseBrowserClient();
    if (following.has(targetId)) {
      await supabase.from('followers').delete().eq('follower_id', userId).eq('following_id', targetId);
      setFollowing(prev => { const next = new Set(prev); next.delete(targetId); return next; });
    } else {
      await supabase.from('followers').insert({ follower_id: userId, following_id: targetId });
      setFollowing(prev => new Set(prev).add(targetId));
    }
    setToggling(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
        <div className="container-shell max-w-3xl py-8">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />)}
          </div>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
        <div className="container-shell py-20 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Sign in to see your connections</h2>
          <Link href="/signin" className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white">Sign in</Link>
        </div>
      </main>
    );
  }

  const PersonCard = ({ person, action }: { person: Person; action?: React.ReactNode }) => (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white p-3 shadow-sm">
      <Link href={`/profile/${person.username}` as Route} className="flex flex-1 items-center gap-3">
        <UserAvatar src={person.avatar_url} name={person.full_name} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{person.full_name}</p>
          <p className="text-[11px] text-slate-500">
            {person.specialisation ?? 'Investigator'}
            {person.country ? ` · ${person.country}` : ''}
          </p>
        </div>
      </Link>
      {action || <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />}
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pt-16 lg:pt-20">
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_65%)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-10 -right-20 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.14),transparent_65%)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

      <div className="container-shell relative max-w-3xl py-6 lg:py-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600 backdrop-blur-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_0_3px_rgba(168,85,247,0.2)] animate-pulse" />
          Your network
        </span>
        <h1 className="mt-3 text-[2rem] font-bold leading-[0.95] tracking-[-0.04em] text-slate-950 lg:text-[2.75rem]">
          My{' '}
          <span
            className="inline-block bg-[linear-gradient(92deg,#a855f7_0%,#ec4899_50%,#3b82f6_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
            style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
          >
            Connections
          </span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 lg:text-base">Your professional network on Investigator Events</p>

        {/* ── Connections ── */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Users className="h-4 w-4" /> Connections ({connections.length})
          </h2>

          {connections.length === 0 ? (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-base font-semibold text-slate-900">No connections yet</p>
              <p className="mt-1 text-sm text-slate-500">Connect with investigators to build your professional network.</p>
              <Link href="/directory" className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                <UserPlus className="h-4 w-4" /> Find investigators
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {connections.map(person => <PersonCard key={person.id} person={person} />)}
            </div>
          )}
        </section>

        {/* ── Connecters ── */}
        {followers.length > 0 && (
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              <UserPlus className="h-4 w-4" /> Connecters ({followers.length})
            </h2>
            <div className="mt-3 space-y-2">
              {followers.map(person => (
                <PersonCard
                  key={person.id}
                  person={person}
                  action={
                    <button
                      onClick={() => toggleFollow(person.id)}
                      disabled={toggling === person.id}
                      className={`flex h-8 flex-shrink-0 items-center gap-1 rounded-full px-3 text-xs font-semibold transition ${
                        following.has(person.id)
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {following.has(person.id) ? 'Connected' : 'Connect back'}
                    </button>
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Suggested ── */}
        {suggested.length > 0 && (
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              <Globe className="h-4 w-4" /> Suggested for you
            </h2>
            <p className="mt-1 text-xs text-slate-400">People in your associations and region</p>
            <div className="mt-3 space-y-2">
              {suggested.map(person => (
                <PersonCard
                  key={person.id}
                  person={person}
                  action={
                    <button
                      onClick={() => toggleFollow(person.id)}
                      disabled={toggling === person.id}
                      className={`flex h-8 flex-shrink-0 items-center gap-1 rounded-full px-3 text-xs font-semibold transition ${
                        following.has(person.id)
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {following.has(person.id) ? 'Connected' : (
                        <><UserPlus className="h-3 w-3" /> Connect</>
                      )}
                    </button>
                  }
                />
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 text-center">
          <Link href="/directory" className="text-sm font-medium text-blue-600 hover:text-blue-700">Browse full directory →</Link>
        </div>
      </div>
    </main>
  );
}
