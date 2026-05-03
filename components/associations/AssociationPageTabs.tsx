'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Globe, ShieldCheck, ExternalLink, ArrowRight, Award, Briefcase, Clock, Mail, MessageCircle, Heart } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

/* ── Types ── */
interface AssocEvent { id: string; title: string; slug?: string; date: string; city: string; country: string; category?: string; image_path?: string; coverImage?: string; formattedDate: string; }
interface AssocMember { user_id: string; role: string | null; member_since: number | null; profile: { full_name: string | null; avatar_url: string | null; username: string | null; specialisation: string | null; headline: string | null; country: string | null; profile_color: string | null; } | null; isVerified: boolean; }
interface AssocPost { id: string; title: string | null; content: string; image_url: string | null; link_url: string | null; is_pinned: boolean; likes_count: number; created_at: string; author_name: string | null; author_avatar: string | null; }
interface AssocJob { id: string; title: string; description: string; location: string | null; country: string | null; type: string | null; specialisation: string | null; created_at: string; }

interface Props {
  page: { name: string; slug: string; description: string | null; country: string | null; website: string | null; founded_year: number | null; member_count: number | null; contact_email: string | null; social_links: any; is_verified: boolean; logo_url: string | null; cover_image_url: string | null; };
  logoSrc: string | null;
  invertLogo?: boolean;
  upcoming: AssocEvent[];
  past: AssocEvent[];
  members: AssocMember[];
  posts: AssocPost[];
  jobs: AssocJob[];
  platformMembers: number;
  verifiedCount: number;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export function AssociationPageTabs({ page, logoSrc, invertLogo, upcoming, past, members, posts, jobs, platformMembers, verifiedCount }: Props) {
  const [isVerifiedMember, setIsVerifiedMember] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const uid = data.user.id;

      // Check if user is a member of this association (match on slug or name)
      const { data: assocList } = await supabase
        .from('user_associations')
        .select('id, association_name')
        .eq('user_id', uid);
      const isMemberMatch = (assocList ?? []).some((a: any) =>
        a.association_name === page.name ||
        a.association_name === page.slug.toUpperCase() ||
        a.association_name.toLowerCase() === page.slug
      );
      if (isMemberMatch) setIsMember(true);

      // Check if user is verified (match on slug, short name, or full name)
      const { data: verifList } = await supabase
        .from('member_verifications')
        .select('association_name, status')
        .eq('user_id', uid)
        .eq('status', 'verified');
      const isVerifMatch = (verifList ?? []).some((v: any) =>
        v.association_name === page.name ||
        v.association_name === page.slug.toUpperCase() ||
        v.association_name.toLowerCase() === page.slug
      );
      if (isVerifMatch) setIsVerifiedMember(true);
    });
  }, [page.name]);

  return (
    <>
      {/* ═══ HERO — full-width dark section ═══ */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#06091a_0%,#0a1228_35%,#0d1840_60%,#0a1228_100%)] pb-16 pt-24 sm:pb-24 sm:pt-32">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-5%] top-[-10%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(ellipse,rgba(22,104,255,0.18),transparent_55%)]" />
          <div className="absolute right-[-5%] top-[10%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.12),transparent_55%)]" />
          <div className="absolute bottom-[-10%] left-[30%] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(ellipse,rgba(14,165,233,0.1),transparent_55%)]" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="container-shell relative">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
            {/* Logo */}
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] sm:h-32 sm:w-32">
              {logoSrc ? (
                <Image src={logoSrc} alt={page.name} width={120} height={120} className={`h-auto max-h-16 w-auto object-contain sm:max-h-24 ${invertLogo ? 'brightness-0' : ''}`} />
              ) : (
                <span className="text-4xl font-bold text-slate-400">{page.name.charAt(0)}</span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-blue-400/50">Professional Association</p>
              </div>
              <h1 className="mt-2 text-[1.8rem] font-bold leading-[0.95] tracking-[-0.04em] text-white sm:text-[2.5rem] lg:text-[3.2rem]">
                {page.name}
              </h1>
              {page.is_verified && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-300 border border-blue-400/20">
                  <ShieldCheck className="h-3.5 w-3.5" /> Investigator Events Partner
                </span>
              )}
              {page.description && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base sm:leading-relaxed">{page.description}</p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/35">
                {page.country && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {page.country}</span>}
                {page.founded_year && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Est. {page.founded_year}</span>}
                {page.member_count && <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {page.member_count.toLocaleString()} members</span>}
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {upcoming.length + past.length} events</span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {page.website && (
                  <a href={page.website} target="_blank" rel="noreferrer" className="btn-glow !px-6 !py-3 !text-sm">
                    Join {page.name} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                )}
                {page.website && (
                  <a href={page.website} target="_blank" rel="noreferrer" className="btn-outline-light !px-5 !py-2.5 !text-sm">
                    <Globe className="mr-1.5 h-3.5 w-3.5" /> Website <ExternalLink className="ml-1 h-3 w-3 opacity-40" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { value: upcoming.length, label: 'Upcoming events', color: 'from-blue-500/20 to-blue-600/10 border-blue-400/15 text-blue-300' },
              { value: past.length, label: 'Past events', color: 'from-white/5 to-white/[0.02] border-white/10 text-white/60' },
              { value: platformMembers, label: 'On platform', color: 'from-violet-500/20 to-violet-600/10 border-violet-400/15 text-violet-300' },
              { value: verifiedCount, label: 'Verified members', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/15 text-emerald-300' },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border bg-gradient-to-br p-4 sm:p-5 ${s.color}`}>
                <p className="text-2xl font-bold sm:text-3xl">{s.value}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ VERIFY BANNER — only show if not already verified ═══ */}
      {isVerifiedMember ? (
        <div className="border-b border-emerald-200/30 bg-emerald-50/50">
          <div className="container-shell flex items-center gap-3 py-4">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-700">You're a verified {page.name} member</p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden border-b border-emerald-200/30 bg-[linear-gradient(135deg,#ecfdf5_0%,#eff6ff_50%,#f5f3ff_100%)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(16,185,129,0.08),transparent_50%)]" />
          <div className="container-shell relative flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:gap-6 sm:py-8">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.25)]">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-slate-950">Are you a {page.name} member?</p>
              <p className="mt-0.5 text-sm text-slate-500">Verify your membership to display a verified badge on your profile across the entire platform.</p>
            </div>
            <Link href="/profile/edit" className="btn-primary flex-shrink-0 !rounded-full !px-6 !py-3 !text-sm">
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Verify membership
            </Link>
          </div>
        </div>
      )}

      {/* ═══ EVENTS SECTION — light background ═══ */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#f8fbff_50%,#ffffff_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.06),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(20,184,255,0.04),transparent_20%)]" />
        <div className="container-shell relative py-12 sm:py-16">
          <p className="eyebrow">Events</p>
          <h2 className="section-title !mt-3">{page.name} events</h2>
          <p className="section-copy max-w-xl">Browse all conferences, meetings, and training events organised by or linked to {page.name}.</p>

          {upcoming.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600">Upcoming</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Past events</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.slice(0, 6).map((e) => <EventCard key={e.id} event={e} muted />)}
              </div>
              {past.length > 6 && <p className="mt-4 text-center text-sm text-slate-400">+ {past.length - 6} more past events</p>}
            </div>
          )}

          {upcoming.length === 0 && past.length === 0 && (
            <div className="mt-8 rounded-[1.5rem] border border-slate-200/60 bg-white py-12 text-center shadow-sm">
              <Calendar className="mx-auto h-12 w-12 text-blue-200" />
              <p className="mt-4 text-base font-semibold text-slate-400">No events listed yet</p>
              <Link href="/submit-event" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">Submit an event <ArrowRight className="h-3 w-3" /></Link>
            </div>
          )}
        </div>
      </div>

      {/* ═══ MEMBERS SECTION ═══ */}
      <div className="border-t border-slate-200/40 bg-white">
        <div className="container-shell py-12 sm:py-16">
          <p className="eyebrow">Directory</p>
          <h2 className="section-title !mt-3">Members on Investigator Events</h2>
          <p className="section-copy max-w-xl">Investigators who have added {page.name} to their profile. Verified members have confirmed their membership with a code.</p>

          {members.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m) => <MemberCard key={m.user_id} member={m} />)}
            </div>
          ) : (
            <div className="mt-8 flex items-center gap-5 rounded-[1.5rem] border border-slate-200/60 bg-[linear-gradient(135deg,#f8fbff,#f0e8ff)] p-6 sm:p-8">
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-bold text-white shadow-sm">?</div>
                ))}
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">Be the first to represent {page.name}</p>
                <p className="mt-1 text-sm text-slate-500">Add this association to your profile in settings to appear here.</p>
                <Link href="/profile/edit" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                  Edit profile <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ POSTS SECTION ═══ */}
      {posts.length > 0 && (
        <div className="border-t border-slate-200/40 bg-[linear-gradient(180deg,#f8fbff,#ffffff)]">
          <div className="container-shell py-12 sm:py-16">
            <p className="eyebrow">Updates</p>
            <h2 className="section-title !mt-3">Latest from {page.name}</h2>
            <div className="mt-8 space-y-5">
              {posts.map((post) => (
                <div key={post.id} className="overflow-hidden rounded-[1.5rem] border border-white/80 bg-white shadow-[0_24px_54px_-36px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center gap-3 px-5 pt-5 sm:px-6">
                    {logoSrc ? (
                      <Image src={logoSrc} alt={page.name} width={40} height={40} className={`h-10 w-10 rounded-xl border border-slate-100 object-contain p-1 ${invertLogo ? 'brightness-0' : ''}`} />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 text-sm font-bold text-blue-400">{page.name.charAt(0)}</div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900">{page.name}</p>
                      <p className="text-[11px] text-slate-400">{timeAgo(post.created_at)}</p>
                    </div>
                  </div>
                  <div className="px-5 py-4 sm:px-6">
                    {post.title && <h3 className="text-base font-bold text-slate-900">{post.title}</h3>}
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{post.content}</p>
                  </div>
                  {post.image_url && (
                    <div className="relative h-56 w-full overflow-hidden sm:h-72">
                      <Image src={post.image_url} alt="" fill className="object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ WHY JOIN — CTA section ═══ */}
      <div className="relative overflow-hidden border-t border-slate-200/40 bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.06),transparent_40%)]" />
        <div className="container-shell relative py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <Award className="mx-auto h-10 w-10 text-blue-600" />
            <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-slate-950 sm:text-3xl">Why join a professional association?</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">Association membership is how investigators prove they belong. It shortens sales cycles, justifies premium pricing, and opens doors to international referral networks no open platform can replicate.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/why-join-an-association" className="btn-primary !px-6 !py-3 !text-sm">
                Learn more <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
              {page.website && (
                <a href={page.website} target="_blank" rel="noreferrer" className="btn-secondary !px-6 !py-3 !text-sm">
                  Visit {page.name} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════ */

function EventCard({ event: e, muted }: { event: AssocEvent; muted?: boolean }) {
  const imgSrc = (e.image_path && /^(\/(cities|events|images)\/|https?:\/\/)/.test(e.image_path) ? e.image_path : e.coverImage) ?? '/cities/fallback.jpg';
  return (
    <Link href={`/events/${e.slug ?? e.id}`} className={`group overflow-hidden rounded-[1.2rem] border border-white/80 bg-white shadow-[0_12px_36px_-18px_rgba(15,23,42,0.1)] transition hover:shadow-[0_20px_50px_-16px_rgba(15,23,42,0.15)] hover:-translate-y-1 ${muted ? 'opacity-60 hover:opacity-100' : ''}`}>
      <div className="relative h-36 w-full overflow-hidden sm:h-40">
        <Image src={imgSrc} alt={e.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-sm font-bold leading-snug text-white drop-shadow-sm">{e.title}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" /> {e.formattedDate}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-slate-400" /> {e.city}, {e.country}
        </div>
        {e.category && (
          <span className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">{e.category}</span>
        )}
      </div>
    </Link>
  );
}

function MemberCard({ member: m }: { member: AssocMember }) {
  if (!m.profile) return null;
  const color = m.profile.profile_color ?? '#3b82f6';
  return (
    <Link
      href={m.profile.username ? `/profile/${m.profile.username}` : '#'}
      className={`group flex items-center gap-4 overflow-hidden rounded-[1.2rem] border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        m.isVerified ? 'border-emerald-200/60' : 'border-slate-200/60'
      }`}
    >
      <div className="relative flex-shrink-0">
        <UserAvatar src={m.profile.avatar_url} name={m.profile.full_name} size={48} color={color} />
        {m.isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
            <ShieldCheck className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600">{m.profile.full_name ?? 'Member'}</p>
          {m.isVerified && <span className="flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-bold text-emerald-700">VERIFIED</span>}
        </div>
        <p className="truncate text-xs text-slate-400">{m.role || m.profile.headline || m.profile.specialisation || ''}</p>
        {m.profile.country && <p className="mt-0.5 text-[11px] text-slate-300">{m.profile.country}</p>}
      </div>
    </Link>
  );
}
