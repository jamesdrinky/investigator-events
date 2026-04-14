import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, ShieldCheck, Star, Globe, ExternalLink, Users, Pencil, ArrowRight, MessageCircle, Briefcase } from 'lucide-react';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { getCountryFlag } from '@/lib/utils/location';
import { UserAvatar } from '@/components/UserAvatar';
import { ExpandableText } from '@/components/ExpandableText';
import { ConnectionButton } from './follow-button';
import { EventsAttendanceStack } from '@/components/EventsAttendanceStack';
import { ReportButton } from '@/components/ReportButton';
import { ShareProfileButton } from '@/components/ShareProfileButton';
import { VerifiedBadges } from '@/components/VerifiedBadges';
import { ProfileCompletion } from '@/components/ProfileCompletion';

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

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const supabase = await createSupabaseSSRServerClient();
  const { data: profile } = await supabase.from('profiles').select('full_name, username, specialisation, headline, country').eq('username', params.username).single();
  if (!profile) return { title: 'Profile Not Found' };
  const name = profile.full_name ?? profile.username ?? 'Investigator';
  const tagline = profile.headline || profile.specialisation || '';
  const description = [tagline, profile.country ? `Based in ${profile.country}` : '', 'View their profile on Investigator Events.'].filter(Boolean).join('. ');
  return {
    title: `${name} | Investigator Events`,
    description,
    alternates: {
      canonical: `https://www.investigatorevents.com/profile/${params.username}`,
    },
    openGraph: {
      title: name,
      description,
      type: 'profile',
      siteName: 'Investigator Events',
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description,
    },
  };
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

  // Determine auth provider — check DB field, but also check live auth for the profile owner
  const dbAuthProvider = (profile as any).auth_provider as string | null;
  const liveProviders: string[] = (isOwner && user?.app_metadata?.providers) || [];
  const authProvider = (liveProviders.includes('linkedin_oidc') || dbAuthProvider === 'linkedin_oidc')
    ? 'linkedin_oidc'
    : dbAuthProvider;

  const { data: assocs } = await supabase.from('user_associations').select('*').eq('user_id', profile.id);
  const { data: verifs } = await supabase.from('member_verifications').select('association_name, status, expires_at').eq('user_id', profile.id);
  const activeVerifications = (verifs ?? []).filter((v: any) => v.status === 'verified' && (!v.expires_at || new Date(v.expires_at) > new Date()));
  const verifiedSet = new Set(activeVerifications.map((v: any) => v.association_name));
  const linkedinName = (profile as any).linkedin_name as string | null;
  const linkedinPicture = (profile as any).linkedin_picture as string | null;
  const linkedinUrl = (profile as any).linkedin_url as string | null;

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

  const { data: experienceRows } = await supabase.from('work_experience').select('*').eq('user_id', profile.id).order('sort_order');

  const { data: recentPosts } = await supabase.from('posts').select('id, content, image_url, likes_count, comments_count, created_at').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(3);

  const { data: reviewRows } = await supabase.from('event_reviews').select('id, event_id, rating, review_text, created_at').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(4);
  const reviewEventIds = (reviewRows ?? []).map((r) => r.event_id);
  const { data: reviewedEvents } = reviewEventIds.length > 0
    ? await supabase.from('events').select('id, title, slug, city, country').in('id', reviewEventIds) : { data: [] };
  const eventMap = new Map((reviewedEvents ?? []).map((e) => [e.id, e]));

  const isLinkedInVerified = authProvider === 'linkedin_oidc';
  const isFullyVerified = isLinkedInVerified || activeVerifications.length > 0;
  const hasHeadline = !!(profile.headline || profile.specialisation);
  const hasAbout = !!profile.bio;
  const hasAssociations = (assocs ?? []).length > 0;
  const hasSections = (sections ?? []).length > 0;
  const hasActivity = (recentPosts ?? []).length > 0;
  const hasReviews = (reviewRows ?? []).length > 0;
  const hasExperience = (experienceRows ?? []).length > 0;

  // Check newsletter subscription (for profile completion)
  const userEmail = user?.email;
  let isNewsletterSubscribed = false;
  if (isOwner && userEmail) {
    const { data: sub } = await supabase.from('newsletter_subscribers' as any).select('id').eq('email', userEmail).maybeSingle();
    isNewsletterSubscribed = !!sub;
  }

  const hasAvatar = !!profile.avatar_url;
  const hasCountry = !!profile.country;
  const hasWebsite = !!profile.website;

  const profileSteps = isOwner ? [
    { id: 'avatar', label: 'Add a profile photo', done: hasAvatar, icon: <Pencil className="h-3 w-3" />, href: '/profile/edit', priority: 'high' as const },
    { id: 'headline', label: 'Add a headline', done: hasHeadline, icon: <Pencil className="h-3 w-3" />, href: '/profile/edit', priority: 'high' as const },
    { id: 'bio', label: 'Write an about section', done: hasAbout, icon: <Pencil className="h-3 w-3" />, href: '/profile/edit', priority: 'high' as const },
    { id: 'country', label: 'Set your country', done: hasCountry, icon: <MapPin className="h-3 w-3" />, href: '/profile/edit', priority: 'high' as const },
    { id: 'linkedin', label: 'Verify with LinkedIn', done: isLinkedInVerified, icon: <ShieldCheck className="h-3 w-3" />, href: '/profile/edit', priority: 'high' as const },
    { id: 'associations', label: 'Add association memberships', done: hasAssociations, icon: <Users className="h-3 w-3" />, href: '/profile/edit', priority: 'medium' as const },
    { id: 'experience', label: 'Add work experience', done: hasExperience, icon: <Briefcase className="h-3 w-3" />, href: '/profile/edit', priority: 'medium' as const },
    { id: 'newsletter', label: 'Subscribe to newsletter', done: isNewsletterSubscribed, icon: <Calendar className="h-3 w-3" />, href: '/weekly', priority: 'medium' as const },
  ] : [];

  const missing: string[] = [];
  if (!hasHeadline) missing.push('headline');
  if (!hasAbout) missing.push('bio');
  if (!hasAssociations) missing.push('associations');
  if (!hasSections) missing.push('sections');

  return (
    <main className="min-h-screen bg-slate-50/80">
      {/* Ambient page glow — uses profile accent color */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[50vh]" style={{
        opacity: isFullyVerified ? 0.45 : 0.3,
        background: isFullyVerified
          ? `radial-gradient(ellipse at 50% 0%, ${accentColor}20 0%, transparent 60%), radial-gradient(ellipse at 30% 10%, ${accentColor}10 0%, transparent 50%)`
          : `radial-gradient(ellipse at 50% 0%, ${accentColor}15 0%, transparent 70%)`
      }} />

      <div className="relative mx-auto max-w-[52rem] px-4 pb-16 pt-20 sm:pt-24">

        {/* ═══ TOP CARD ═══ */}
        <div className={`rounded-2xl border bg-white shadow-lg ${
          isFullyVerified
            ? 'border-slate-200/60'
            : 'border-slate-200/60 shadow-slate-200/50'
        }`}
          style={isFullyVerified ? {
            borderColor: `${accentColor}30`,
            boxShadow: `0 0 0 1px ${accentColor}10, 0 4px 24px -4px ${accentColor}20, 0 12px 40px -8px ${accentColor}12`
          } : undefined}
        >
          {/* Banner */}
          {(profile as any).banner_url ? (
            <div className="relative h-36 overflow-hidden rounded-t-2xl sm:h-44 lg:h-52">
              <Image src={(profile as any).banner_url} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            <div className="relative h-36 overflow-hidden rounded-t-2xl sm:h-44 lg:h-52" style={{ background: `linear-gradient(135deg, ${accentColor}30 0%, ${accentColor}10 40%, #e0e7ff 70%, #f1f5f9 100%)` }}>
              {/* Decorative mesh */}
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `radial-gradient(circle at 70% 30%, ${accentColor}20 0%, transparent 50%), radial-gradient(circle at 30% 70%, ${accentColor}15 0%, transparent 50%)` }} />
            </div>
          )}

          <div className="relative px-6 pb-6 sm:px-8 sm:pb-8">
            {/* Avatar + actions */}
            <div className="-mt-14 flex items-end justify-between gap-3 sm:-mt-20">
              <div className="relative z-10">
                {/* Verified glow ring */}
                {isFullyVerified && (
                  <div className="absolute -inset-1 rounded-full opacity-50" style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80, ${accentColor})`,
                    filter: 'blur(5px)',
                  }} />
                )}
                <div className="relative rounded-full border-4 border-white shadow-xl" style={{
                  boxShadow: isFullyVerified
                    ? `0 8px 30px -8px ${accentColor}50, 0 4px 12px -4px rgba(0,0,0,0.15)`
                    : `0 8px 30px -8px ${accentColor}40, 0 4px 12px -4px rgba(0,0,0,0.1)`
                }}>
                  <div className="overflow-hidden rounded-full">
                    <div className="h-24 w-24 sm:h-32 sm:w-32">
                      <UserAvatar src={profile.avatar_url} name={profile.full_name} size={128} color={accentColor} />
                    </div>
                  </div>
                </div>
                {/* Verified checkmark on avatar */}
                {isFullyVerified && (
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-white">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: accentColor }}>
                      <ShieldCheck className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 pb-1">
                {isOwner ? (
                  <>
                    <Link href="/profile/edit" className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md">
                      <Pencil className="h-3.5 w-3.5" /> Edit profile
                    </Link>
                    <ShareProfileButton username={profile.username ?? ''} fullName={profile.full_name} avatarUrl={profile.avatar_url} specialisation={profile.specialisation} accentColor={accentColor} />
                  </>
                ) : (
                  <>
                    <Link href={`/messages?to=${profile.id}`} className="flex items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:shadow-md" style={{ borderColor: `${accentColor}30`, color: accentColor }}>
                      <MessageCircle className="h-3.5 w-3.5" /> Message
                    </Link>
                    <ConnectionButton targetUserId={profile.id} />
                    <ShareProfileButton username={profile.username ?? ''} fullName={profile.full_name} avatarUrl={profile.avatar_url} specialisation={profile.specialisation} accentColor={accentColor} />
                    <ReportButton reportedUserId={profile.id} contentType="profile" />
                  </>
                )}
              </div>
            </div>

            {/* Unverified nudge — owner only */}
            {isOwner && !isFullyVerified && (
              <Link href="/profile/edit" className="mt-4 flex items-center gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/30 px-4 py-2.5 transition hover:bg-amber-50/60">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-700">Verify your identity</p>
                  <p className="text-[11px] text-slate-500">Connect LinkedIn or enter an association code to show you are who you say you are.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-400" />
              </Link>
            )}

            {/* Verified identity banner — shows OAuth data that can't be faked */}
            {isFullyVerified && (
              <div className="mt-4 overflow-hidden rounded-2xl" style={{
                background: isLinkedInVerified
                  ? `linear-gradient(135deg, #0077B5 0%, #005f8f 100%)`
                  : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
              }}>
                <div className="relative px-4 py-3.5 sm:px-5 sm:py-4">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.1),transparent_50%)]" />
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.07]">
                    <ShieldCheck className="h-16 w-16 text-white sm:h-20 sm:w-20" />
                  </div>

                  <div className="relative space-y-3">
                    <div className="flex items-center gap-3">
                      {/* LinkedIn photo from OAuth — hosted on LinkedIn's CDN, can't be faked */}
                      {isLinkedInVerified && linkedinPicture ? (
                        <img src={linkedinPicture} alt="" className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-white/30 object-cover shadow-lg" />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                          <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">
                            {isLinkedInVerified ? 'LinkedIn Verified Identity' : 'Verified Association Member'}
                          </p>
                          <ShieldCheck className="h-4 w-4 text-white/60" />
                        </div>
                        <p className="text-[11px] text-white/60">
                          {isLinkedInVerified && linkedinName && (
                            <span>Authenticated as <strong className="text-white/80">{linkedinName}</strong> on LinkedIn. </span>
                          )}
                          {isLinkedInVerified && !linkedinName && 'Authenticated through LinkedIn. '}
                          {activeVerifications.length > 0 && `Member of ${activeVerifications.map((v: any) => v.association_name).join(', ')}.`}
                        </p>
                      </div>
                    </div>

                    {isLinkedInVerified && linkedinName && (
                      <a
                        href={linkedinUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(linkedinName)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0077B5] shadow-lg transition hover:shadow-xl sm:w-auto sm:inline-flex sm:rounded-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 48 48"><path fill="#0077B5" d="M42 37a5 5 0 01-5 5H11a5 5 0 01-5-5V11a5 5 0 015-5h26a5 5 0 015 5v26z" /><path fill="#FFF" d="M12 19h5v17h-5V19zm2.485-2h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99-.144.35-.101.858-.101 1.365V36h-5s.07-16 0-17h5v2.616C25.721 21.865 27.085 20 30.1 20c3.386 0 5.9 2.215 5.9 6.978V36z" /></svg>
                        Find on LinkedIn
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Name + info */}
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{profile.full_name}</h1>
                {flag && <span className="text-xl">{flag}</span>}
                {/* LinkedIn verified badge — shows OAuth-verified name */}
                {isLinkedInVerified && (
                  <span className="flex items-center gap-1.5 rounded-full bg-[#0077B5] px-3 py-1 text-[11px] font-bold text-white shadow-sm" title="Identity verified through LinkedIn OAuth">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 48 48"><path fill="#ffffff" d="M42 37a5 5 0 01-5 5H11a5 5 0 01-5-5V11a5 5 0 015-5h26a5 5 0 015 5v26z" /><path fill="#0077B5" d="M12 19h5v17h-5V19zm2.485-2h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99-.144.35-.101.858-.101 1.365V36h-5s.07-16 0-17h5v2.616C25.721 21.865 27.085 20 30.1 20c3.386 0 5.9 2.215 5.9 6.978V36z" /></svg>
                    Verified
                    <ShieldCheck className="h-3 w-3" />
                  </span>
                )}
                {badges.map((b) => {
                  const meta = BADGE_META[b];
                  if (!meta) return null;
                  return (
                    <span key={b} className="rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm" style={{ backgroundColor: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}25` }}>
                      {meta.label}
                    </span>
                  );
                })}
              </div>

              {/* Verified badges */}
              {(activeVerifications.length > 0 || authProvider === 'linkedin_oidc') && (
                <div className="mt-2">
                  <VerifiedBadges
                    verifications={activeVerifications.map((v: any) => ({ association_name: v.association_name, status: v.status, expires_at: v.expires_at }))}
                    authProvider={authProvider}
                    linkedinUrl={null}
                  />
                </div>
              )}

              {hasHeadline && (
                <p className="mt-1.5 text-[15px] leading-snug text-slate-600">{profile.headline || profile.specialisation}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400 sm:text-sm">
                {profile.country && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.country}</span>}
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> <strong className="text-slate-700">{connectionCount ?? 0}</strong> connections</span>
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 transition hover:underline" style={{ color: accentColor }}>
                    <Globe className="h-3.5 w-3.5" /> Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Association chips */}
              {hasAssociations && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(assocs ?? []).map((a) => (
                    <span key={a.id} className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition hover:shadow-sm" style={{ borderColor: `${accentColor}20`, backgroundColor: `${accentColor}06`, color: accentColor }}>
                      {a.association_name}
                      {a.role && <span className="font-normal text-slate-400">· {a.role}</span>}
                      {verifiedSet.has(a.association_name) && <ShieldCheck className="h-3 w-3" style={{ color: accentColor }} />}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ PROFILE COMPLETION ═══ */}
        {isOwner && profileSteps.length > 0 && (
          <div className="mt-4">
            <ProfileCompletion steps={profileSteps} userEmail={userEmail} />
          </div>
        )}

        {/* ═══ ABOUT — collapsible ═══ */}
        {hasAbout && (
          <div className="group/card relative mt-4">
            <div className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover/card:opacity-100" style={{ background: `radial-gradient(ellipse, ${accentColor}12, transparent 70%)` }} />
            <div className="relative rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6" style={{ borderColor: undefined }}>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">About</h2>
              <div className="mt-3">
                <ExpandableText text={profile.bio!} maxLines={4} accentColor={accentColor} />
              </div>
            </div>
          </div>
        )}

        {/* ═══ EXPERIENCE — timeline style ═══ */}
        {hasExperience && (
          <div className="group/card relative mt-4">
            <div className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover/card:opacity-100" style={{ background: `radial-gradient(ellipse, ${accentColor}12, transparent 70%)` }} />
          <div className="relative mt-0 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Briefcase className="h-4 w-4 text-slate-400" /> Experience
            </h2>
            <div className="mt-4 space-y-0">
              {(experienceRows ?? []).map((exp: any, i: number) => (
                <div key={exp.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Timeline line */}
                  {i < (experienceRows ?? []).length - 1 && (
                    <div className="absolute left-[21px] top-12 bottom-0 w-px" style={{ backgroundColor: `${accentColor}20` }} />
                  )}
                  {/* Logo/icon */}
                  <div className="relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border shadow-sm" style={{ borderColor: `${accentColor}25`, backgroundColor: `${accentColor}08` }}>
                    <span className="text-[10px] font-bold uppercase" style={{ color: accentColor }}>{exp.company_name.slice(0, 3)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{exp.job_title}</p>
                    <p className="text-sm text-slate-600">{exp.company_name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {exp.start_year}{exp.is_current ? ' - Present' : exp.end_year ? ` - ${exp.end_year}` : ''}
                      {exp.is_current && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: `${accentColor}10`, color: accentColor }}>
                          Current
                        </span>
                      )}
                    </p>
                    {exp.description && (
                      <div className="mt-2">
                        <ExpandableText text={exp.description} maxLines={3} accentColor={accentColor} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}

        {/* ═══ CUSTOM SECTIONS — collapsible ═══ */}
        {(sections ?? []).map((s) => (
          <div key={s.id} className="group/card relative mt-4">
            <div className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover/card:opacity-100" style={{ background: `radial-gradient(ellipse, ${accentColor}12, transparent 70%)` }} />
          <div className="relative rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
            <h2 className="text-base font-bold text-slate-900">{s.title}</h2>
            <div className="mt-3">
              <ExpandableText text={s.content ?? ''} maxLines={4} />
            </div>
          </div>
          </div>
        ))}

        {/* ═══ ACTIVITY ═══ */}
        {hasActivity && (
          <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Activity</h2>
              <Link href="/people" className="text-xs font-semibold transition hover:underline" style={{ color: accentColor }}>See all</Link>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(recentPosts ?? []).map((post) => (
                <div key={post.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:shadow-sm">
                  <p className="line-clamp-2 text-sm text-slate-700">{post.content}</p>
                  {post.image_url && (
                    <div className="mt-2 overflow-hidden rounded-lg">
                      <Image src={post.image_url} alt="" width={300} height={150} className="h-24 w-full object-cover" />
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
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
          <div className="mt-4">
            <EventsAttendanceStack events={attendanceEvents} />
          </div>
        )}

        {/* ═══ REVIEWS ═══ */}
        {hasReviews && (
          <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-900">Event reviews</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(reviewRows ?? []).map((r) => {
                const ev = eventMap.get(r.event_id);
                return (
                  <div key={r.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={ev?.slug ? `/events/${ev.slug}` : '/calendar'} className="truncate text-sm font-bold text-slate-900 transition hover:text-blue-600">
                        {ev?.title ?? 'Event'}
                      </Link>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    {ev && <p className="mt-0.5 text-[11px] text-slate-400">{ev.city}, {ev.country}</p>}
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
