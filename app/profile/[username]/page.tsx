import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, ShieldCheck, Star, Globe, ExternalLink, Users } from 'lucide-react';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { getCountryFlag } from '@/lib/utils/location';
import { UserAvatar } from '@/components/UserAvatar';
import { ConnectionButton } from './follow-button';

export const dynamic = 'force-dynamic';

const BADGE_META: Record<string, { label: string; color: string }> = {
  'verified-pi': { label: 'Verified PI', color: '#3b82f6' },
  'speaker': { label: 'Speaker', color: '#8b5cf6' },
  'mentor': { label: 'Mentor', color: '#10b981' },
  'early-adopter': { label: 'Early Adopter', color: '#f59e0b' },
  'top-contributor': { label: 'Top Contributor', color: '#ec4899' },
  'international': { label: 'International', color: '#06b6d4' },
  'rising-star': { label: 'Rising Star', color: '#d946ef' },
  'innovator': { label: 'Innovator', color: '#6366f1' },
};

export async function generateMetadata({ params }: { params: { username: string } }) {
  const supabase = await createSupabaseSSRServerClient();
  const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('username', params.username).single();
  if (!profile) return { title: 'Profile Not Found' };
  return { title: `${profile.full_name ?? profile.username} | Investigator Events` };
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = await createSupabaseSSRServerClient();
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', params.username).single();
  if (!profile || !profile.is_public) notFound();

  const accentColor = profile.profile_color ?? '#3b82f6';
  const flag = profile.country ? getCountryFlag(profile.country) : '';
  const badges = (profile.badges as string[] | null) ?? [];

  const { data: assocs } = await supabase.from('user_associations').select('*').eq('user_id', profile.id);
  const { data: verifs } = await supabase.from('member_verifications').select('association_name, status').eq('user_id', profile.id).eq('status', 'verified');
  const verifiedSet = new Set((verifs ?? []).map((v) => v.association_name));

  // Connection count
  const { count: connectionCount } = await supabase
    .from('connections')
    .select('id', { count: 'exact', head: true })
    .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`)
    .eq('status', 'accepted');

  // Profile sections
  const { data: sections } = await supabase.from('profile_sections').select('*').eq('user_id', profile.id).eq('visible', true).order('sort_order');

  // Upcoming events attending
  const { data: attendingRows } = await supabase.from('event_attendees').select('event_id').eq('user_id', profile.id).eq('is_going', true);
  const attendingIds = (attendingRows ?? []).map((r) => r.event_id);
  const { data: upcomingEvents } = attendingIds.length > 0
    ? await supabase.from('events').select('id, title, slug, city, country, start_date').in('id', attendingIds).gte('start_date', new Date().toISOString().slice(0, 10)).order('start_date').limit(6)
    : { data: [] };

  // Reviews
  const { data: reviewRows } = await supabase.from('event_reviews').select('id, event_id, rating, review_text, created_at').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(6);
  const reviewEventIds = (reviewRows ?? []).map((r) => r.event_id);
  const { data: reviewedEvents } = reviewEventIds.length > 0
    ? await supabase.from('events').select('id, title, slug, city, country').in('id', reviewEventIds)
    : { data: [] };
  const eventMap = new Map((reviewedEvents ?? []).map((e) => [e.id, e]));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="container-shell py-24 sm:py-32">
        <div className="mx-auto max-w-3xl space-y-5">

          {/* Profile card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
            <div className="h-20 sm:h-28" style={{ background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}08 100%)` }} />

            <div className="px-6 pb-6 sm:px-8 sm:pb-8">
              <div className="-mt-12 flex items-end justify-between sm:-mt-14">
                <div className="overflow-hidden rounded-full border-4 border-white shadow-lg">
                  <UserAvatar src={profile.avatar_url} name={profile.full_name} size={96} color={accentColor} />
                </div>
                <ConnectionButton targetUserId={profile.id} />
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{profile.full_name}</h1>
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
                {profile.specialisation && <p className="mt-1 text-sm text-slate-500">{profile.specialisation}</p>}
              </div>

              {profile.bio && <p className="mt-3 text-sm leading-relaxed text-slate-600">{profile.bio}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                {profile.country && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.country}</span>}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                    <Globe className="h-3.5 w-3.5" /> Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> <strong className="font-semibold text-slate-900">{connectionCount ?? 0}</strong> connections
                </span>
              </div>

              {(assocs ?? []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(assocs ?? []).map((a) => (
                    <span key={a.id} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                      {a.association_name}
                      {verifiedSet.has(a.association_name) && <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom profile sections */}
          {(sections ?? []).map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-slate-900">{s.title}</h2>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{s.content}</div>
            </div>
          ))}

          {/* Upcoming events */}
          {(upcomingEvents ?? []).length > 0 && (
            <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-slate-900">Upcoming events</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(upcomingEvents ?? []).map((e) => (
                  <Link key={e.id} href={`/events/${e.slug}`} className="group rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">{e.title}</h3>
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" /> {new Date(e.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      <MapPin className="h-3 w-3" /> {e.city}, {e.country}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {(reviewRows ?? []).length > 0 && (
            <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-slate-900">Event reviews</h2>
              <div className="mt-4 space-y-3">
                {(reviewRows ?? []).map((r) => {
                  const ev = eventMap.get(r.event_id);
                  return (
                    <div key={r.id} className="rounded-xl border border-slate-100 p-4">
                      <div className="flex items-center justify-between">
                        <Link href={ev ? `/events/${ev.slug}` : '#'} className="text-sm font-semibold text-slate-900 hover:text-blue-600">
                          {ev?.title ?? 'Event'}
                        </Link>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      {r.review_text && <p className="mt-2 text-sm text-slate-600">{r.review_text}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
