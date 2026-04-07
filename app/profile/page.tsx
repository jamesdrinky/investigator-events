import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, Settings, ShieldCheck, Globe, Users, Briefcase, Flame, Award, Zap, Crown, Star, Shield, Sparkles, Globe2, Pencil } from 'lucide-react';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import type { Database } from '@/lib/types/database';
import { getCountryFlag } from '@/lib/utils/location';
import { UserAvatar } from '@/components/UserAvatar';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'My Profile | Investigator Events' };

const BADGE_META: Record<string, { label: string; icon: string; color: string }> = {
  'verified-pi': { label: 'Verified PI', icon: 'shield', color: '#3b82f6' },
  'speaker': { label: 'Speaker', icon: 'zap', color: '#8b5cf6' },
  'mentor': { label: 'Mentor', icon: 'award', color: '#10b981' },
  'early-adopter': { label: 'Early Adopter', icon: 'flame', color: '#f59e0b' },
  'top-contributor': { label: 'Top Contributor', icon: 'crown', color: '#ec4899' },
  'international': { label: 'International', icon: 'globe', color: '#06b6d4' },
  'rising-star': { label: 'Rising Star', icon: 'star', color: '#d946ef' },
  'innovator': { label: 'Innovator', icon: 'sparkles', color: '#6366f1' },
};

export default async function ProfilePage() {
  const supabase = await createSupabaseSSRServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signin');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Investigator';
  const accentColor = profile?.profile_color ?? '#3b82f6';
  const flag = profile?.country ? getCountryFlag(profile.country) : '';
  const badges = (profile?.badges as string[] | null) ?? [];

  // Associations
  const { data: userAssocs } = await supabase.from('user_associations').select('*').eq('user_id', user.id);
  const { data: verifs } = await supabase.from('member_verifications').select('association_name, status').eq('user_id', user.id).eq('status', 'verified');
  const verifiedSet = new Set((verifs ?? []).map((v) => v.association_name));

  // Connections (accepted)
  const { count: connectionCount } = await supabase
    .from('connections')
    .select('id', { count: 'exact', head: true })
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');

  // Profile sections
  const { data: sections } = await supabase
    .from('profile_sections')
    .select('*')
    .eq('user_id', user.id)
    .eq('visible', true)
    .order('sort_order');

  // Saved events
  const { data: savedRows } = await supabase
    .from('saved_events')
    .select('id, event_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(4);

  const eventIds = savedRows?.map((r) => r.event_id) ?? [];
  const { data: events } = eventIds.length > 0
    ? await supabase.from('events').select('*').in('id', eventIds)
    : { data: [] as Database['public']['Tables']['events']['Row'][] };
  const eventsMap = new Map((events ?? []).map((e) => [e.id, e]));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="container-shell py-24 sm:py-32">
        <div className="mx-auto max-w-3xl space-y-5">

          {/* ── Profile card ── */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
            {/* Accent banner */}
            <div className="h-20 sm:h-28" style={{ background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}08 100%)` }} />

            <div className="px-6 pb-6 sm:px-8 sm:pb-8">
              {/* Avatar overlapping banner */}
              <div className="-mt-12 flex items-end justify-between sm:-mt-14">
                <div className="overflow-hidden rounded-full border-4 border-white shadow-lg" style={{ borderColor: 'white' }}>
                  <UserAvatar src={avatarUrl} name={fullName} size={96} color={accentColor} />
                </div>
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit profile
                </Link>
              </div>

              {/* Name + flag + badges */}
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{fullName}</h1>
                  {flag && <span className="text-xl">{flag}</span>}
                  {badges.map((b) => {
                    const meta = BADGE_META[b];
                    if (!meta) return null;
                    return (
                      <span key={b} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                        {meta.label}
                      </span>
                    );
                  })}
                </div>
                {profile?.specialisation && (
                  <p className="mt-1 text-sm text-slate-500">{profile.specialisation}</p>
                )}
              </div>

              {/* Bio */}
              {profile?.bio && <p className="mt-3 text-sm leading-relaxed text-slate-600">{profile.bio}</p>}

              {/* Meta row */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                {profile?.country && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.country}</span>}
                {profile?.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> <strong className="font-semibold text-slate-900">{connectionCount ?? 0}</strong> connections
                </span>
              </div>

              {/* Association badges */}
              {(userAssocs ?? []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(userAssocs ?? []).map((a) => (
                    <span key={a.id} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                      {a.association_name}
                      {verifiedSet.has(a.association_name) && <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Custom profile sections ── */}
          {(sections ?? []).map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-slate-900">{s.title}</h2>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{s.content}</div>
            </div>
          ))}

          {/* ── Profile setup prompt ── */}
          {!profile?.bio && !profile?.specialisation && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <p className="text-sm font-medium text-blue-700">Complete your profile</p>
              <p className="mt-0.5 text-xs text-blue-600/70">Add your specialisation, bio, and associations so other investigators can find and connect with you.</p>
              <Link href="/profile/edit" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                Set up profile <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* ── Saved events ── */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Saved events</h2>
              <Link href="/calendar" className="text-xs font-medium text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            {(savedRows ?? []).length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(savedRows ?? []).map((saved) => {
                  const event = eventsMap.get(saved.event_id);
                  if (!event) return null;
                  return (
                    <Link key={saved.id} href={`/events/${event.slug}`} className="group rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:shadow-sm">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">{event.title}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" /> {new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        <MapPin className="h-3 w-3" /> {event.city}
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                No saved events. <Link href="/calendar" className="font-medium text-blue-600">Browse events</Link>
              </p>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
