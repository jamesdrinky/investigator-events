import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, ShieldCheck, Star, Globe, ExternalLink, Users, Pencil, ArrowRight, MessageCircle } from 'lucide-react';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { getCountryFlag } from '@/lib/utils/location';
import { UserAvatar } from '@/components/UserAvatar';
import { ConnectionButton } from './follow-button';
import { EventsAttendanceStack } from '@/components/EventsAttendanceStack';

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

const SECTION_PROMPTS: Record<string, { title: string; desc: string }> = {
  headline: { title: 'Add a headline', desc: 'Tell people what you do in one line' },
  bio: { title: 'Write an About section', desc: 'Share your background and expertise' },
  associations: { title: 'Add professional memberships', desc: 'Show your association affiliations' },
  sections: { title: 'Add a section', desc: 'Services, experience, case studies...' },
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

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;
  const accentColor = profile.profile_color ?? '#3b82f6';
  const flag = profile.country ? getCountryFlag(profile.country) : '';
  const badges = (profile.badges as string[] | null) ?? [];

  const { data: assocs } = await supabase.from('user_associations').select('*').eq('user_id', profile.id);
  const { data: verifs } = await supabase.from('member_verifications').select('association_name, status').eq('user_id', profile.id).eq('status', 'verified');
  const verifiedSet = new Set((verifs ?? []).map((v) => v.association_name));

  const { count: connectionCount } = await supabase
    .from('connections').select('id', { count: 'exact', head: true })
    .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`).eq('status', 'accepted');

  const { data: sections } = await supabase.from('profile_sections').select('*').eq('user_id', profile.id).eq('visible', true).order('sort_order');

  const { data: attendingRows } = await supabase.from('event_attendees').select('event_id').eq('user_id', profile.id).eq('is_going', true);
  const attendingIds = (attendingRows ?? []).map((r) => r.event_id);
  const today = new Date().toISOString().slice(0, 10);
  const { data: allAttendedEvents } = attendingIds.length > 0
    ? await supabase.from('events').select('id, title, slug, city, country, start_date, image_path').in('id', attendingIds).order('start_date', { ascending: false }).limit(20)
    : { data: [] };
  const attendanceEvents = (allAttendedEvents ?? []).map((e) => ({ ...e, is_past: e.start_date < today }));

  // Work experience
  const { data: experienceRows } = await supabase.from('work_experience').select('*').eq('user_id', profile.id).order('sort_order');

  const { data: recentPosts } = await supabase.from('posts').select('id, content, image_url, likes_count, comments_count, created_at').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(3);

  const { data: reviewRows } = await supabase.from('event_reviews').select('id, event_id, rating, review_text, created_at').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(4);
  const reviewEventIds = (reviewRows ?? []).map((r) => r.event_id);
  const { data: reviewedEvents } = reviewEventIds.length > 0
    ? await supabase.from('events').select('id, title, slug, city, country').in('id', reviewEventIds) : { data: [] };
  const eventMap = new Map((reviewedEvents ?? []).map((e) => [e.id, e]));

  const hasHeadline = !!(profile.headline || profile.specialisation);
  const hasAbout = !!profile.bio;
  const hasAssociations = (assocs ?? []).length > 0;
  const hasSections = (sections ?? []).length > 0;
  const hasActivity = (recentPosts ?? []).length > 0;
  const hasReviews = (reviewRows ?? []).length > 0;

  // What's missing (for owner prompts)
  const missing: string[] = [];
  if (!hasHeadline) missing.push('headline');
  if (!hasAbout) missing.push('bio');
  if (!hasAssociations) missing.push('associations');
  if (!hasSections) missing.push('sections');

  return (
    <main className="min-h-screen bg-slate-50/80">
      <div className="mx-auto max-w-[52rem] px-4 pb-16 pt-20 sm:pt-24">

        {/* ═══ TOP CARD ═══ */}
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
          {/* Banner */}
          <div className="h-32 sm:h-40 lg:h-48" style={{ background: `linear-gradient(135deg, ${accentColor}25 0%, ${accentColor}08 60%, #f1f5f9 100%)` }} />

          <div className="px-6 pb-6 sm:px-8 sm:pb-7">
            {/* Avatar + actions */}
            <div className="-mt-16 flex items-end justify-between sm:-mt-20">
              <div className="overflow-hidden rounded-full border-4 border-white shadow-lg">
                <UserAvatar src={profile.avatar_url} name={profile.full_name} size={120} color={accentColor} />
              </div>
              <div className="flex items-center gap-2 pb-1">
                {isOwner ? (
                  <Link href="/profile/edit" className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    <Pencil className="h-3.5 w-3.5" /> Edit profile
                  </Link>
                ) : (
                  <>
                    <Link href={`/messages?to=${profile.id}`} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      <MessageCircle className="h-3.5 w-3.5" /> Message
                    </Link>
                    <ConnectionButton targetUserId={profile.id} />
                  </>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{profile.full_name}</h1>
                {flag && <span className="text-lg">{flag}</span>}
                {badges.map((b) => {
                  const meta = BADGE_META[b];
                  if (!meta) return null;
                  return <span key={b} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${meta.color}12`, color: meta.color }}>{meta.label}</span>;
                })}
              </div>

              {/* Headline */}
              {hasHeadline && (
                <p className="mt-1 text-[15px] leading-snug text-slate-600">{profile.headline || profile.specialisation}</p>
              )}

              {/* Meta */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                {profile.country && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.country}</span>}
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> <strong className="text-slate-700">{connectionCount ?? 0}</strong> connections</span>
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Globe className="h-3.5 w-3.5" /> Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Associations inline */}
              {hasAssociations && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(assocs ?? []).map((a) => (
                    <span key={a.id} className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                      {a.association_name}
                      {a.role && <span className="text-slate-400">· {a.role}</span>}
                      {verifiedSet.has(a.association_name) && <ShieldCheck className="h-3 w-3 text-blue-500" />}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ OWNER PROMPTS — inline suggestions to fill gaps ═══ */}
        {isOwner && missing.length > 0 && (
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 px-5 py-4">
            <p className="text-sm font-semibold text-blue-800">Strengthen your profile</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {missing.map((key) => {
                const prompt = SECTION_PROMPTS[key];
                return (
                  <Link key={key} href="/profile/edit" className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50">
                    {prompt.title} <ArrowRight className="h-3 w-3" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ ABOUT ═══ */}
        {hasAbout && (
          <div className="mt-3 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-900">About</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{profile.bio}</p>
          </div>
        )}

        {/* ═══ EXPERIENCE ═══ */}
        {(experienceRows ?? []).length > 0 && (
          <div className="mt-3 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-900">Experience</h2>
            <div className="mt-4 space-y-4">
              {(experienceRows ?? []).map((exp: any) => (
                <div key={exp.id} className="flex gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                    {exp.company_name.slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{exp.job_title}</p>
                    <p className="text-sm text-slate-600">{exp.company_name}</p>
                    <p className="text-xs text-slate-400">
                      {exp.start_year}{exp.is_current ? ' - Present' : exp.end_year ? ` - ${exp.end_year}` : ''}
                    </p>
                    {exp.description && <p className="mt-1 text-sm text-slate-500">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ CUSTOM SECTIONS ═══ */}
        {(sections ?? []).map((s) => (
          <div key={s.id} className="mt-3 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-900">{s.title}</h2>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{s.content}</div>
          </div>
        ))}

        {/* ═══ ACTIVITY ═══ */}
        {hasActivity && (
          <div className="mt-3 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Activity</h2>
              <Link href="/people" className="text-xs font-medium text-blue-600 hover:underline">See all</Link>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(recentPosts ?? []).map((post) => (
                <div key={post.id} className="rounded-lg border border-slate-100 p-3">
                  <p className="line-clamp-2 text-sm text-slate-700">{post.content}</p>
                  {post.image_url && (
                    <div className="mt-2 overflow-hidden rounded-md">
                      <Image src={post.image_url} alt="" width={300} height={150} className="h-24 w-full object-cover" />
                    </div>
                  )}
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                    {post.likes_count > 0 && <span>{post.likes_count} likes</span>}
                    {post.comments_count > 0 && <span>{post.comments_count} comments</span>}
                    <span>{new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ EVENTS ═══ */}
        {attendanceEvents.length > 0 && (
          <div className="mt-3">
            <EventsAttendanceStack events={attendanceEvents} />
          </div>
        )}

        {/* ═══ REVIEWS ═══ */}
        {hasReviews && (
          <div className="mt-3 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-900">Event reviews</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(reviewRows ?? []).map((r) => {
                const ev = eventMap.get(r.event_id);
                return (
                  <div key={r.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <Link href={ev?.slug ? `/events/${ev.slug}` : '/calendar'} className="truncate text-sm font-semibold text-slate-900 hover:text-blue-600">
                        {ev?.title ?? 'Event'}
                      </Link>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    {r.review_text && <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{r.review_text}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
