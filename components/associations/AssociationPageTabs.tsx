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

// Logos for the "Part of the global network" mobile strip — same set as
// the homepage's AssociationLoopSection, combined into one row. Filtered to
// exclude the current association so users don't see themselves in the loop.
const NETWORK_LOGOS: Array<{ src: string; name: string }> = [
  { src: '/associations/cii.png', name: 'CII' },
  { src: '/associations/wad.png', name: 'WAD' },
  { src: '/associations/budeg.png', name: 'BuDEG' },
  { src: '/associations/cali.png', name: 'CALI' },
  { src: '/associations/fali.png', name: 'FALI' },
  { src: '/associations/federpol.png', name: 'Federpol' },
  { src: '/associations/intellenet.png', name: 'Intellenet' },
  { src: '/associations/ikd.png', name: 'IKD' },
  { src: '/associations/nciss.png', name: 'NCISS' },
  { src: '/associations/tali.png', name: 'TALI' },
  { src: '/associations/eurodet.png', name: 'Eurodet' },
  { src: '/associations/snarp.png', name: 'SNARP' },
  { src: '/associations/hda.png', name: 'HDA' },
  { src: '/associations/nfes.png', name: 'NFES' },
  { src: '/associations/psld.png', name: 'PSLD' },
  { src: '/associations/lideppe.png', name: 'LIDEPPE' },
  { src: '/associations/andr.png', name: 'ANDR' },
  { src: '/associations/ncapi.png', name: 'NCAPI' },
  { src: '/associations/fewa.png', name: 'FEWA' },
  { src: '/associations/oedv.png', name: 'ODV' },
  { src: '/associations/nali.webp', name: 'NALI' },
  { src: '/associations/aldonys.png', name: 'ALDONYS' },
  { src: '/associations/wapi.webp', name: 'WAPI' },
  { src: '/associations/spi.png', name: 'SPI' },
];

function NetworkLogoStrip({ excludeName, excludeSlug }: { excludeName: string; excludeSlug: string }) {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');
  const filtered = NETWORK_LOGOS.filter(
    (a) => norm(a.name) !== norm(excludeName) && norm(a.name) !== norm(excludeSlug),
  );
  // Tripled so the animation loops seamlessly across any width.
  const tripled = [...filtered, ...filtered, ...filtered];
  return (
    <div className="mt-10 sm:mt-12">
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
        Part of the global network
      </p>
      <div
        className="relative mt-4 w-screen left-1/2 -translate-x-1/2"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
        }}
      >
        <div className="flex w-max gap-3 animate-loop-left" style={{ touchAction: 'pan-y' }}>
          {tripled.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white p-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.1)] sm:h-16 sm:w-16"
            >
              <img src={logo.src} alt={logo.name} className="h-full w-full object-contain" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
      {/* ═══ HERO — cinematic dark with floating logo, animated gradient name ═══ */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#020617_0%,#06091a_25%,#0a1228_50%,#0d1840_75%,#0a1228_100%)] pb-16 pt-24 sm:pb-24 sm:pt-32">
        {/* Ambient gradient orbs — bigger, more saturated */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[-15%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.30),transparent_65%)] blur-3xl" />
          <div className="absolute right-[-10%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.22),transparent_65%)] blur-3xl" />
          <div className="absolute bottom-[-15%] left-[20%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.18),transparent_65%)] blur-3xl" />
        </div>
        {/* Dot grid (replaces line grid — more modern) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="container-shell relative">
          <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-start sm:gap-10">
            {/* Logo — floating with gradient glow ring */}
            <div className="relative flex-shrink-0">
              <div aria-hidden className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-400/40 via-purple-400/30 to-cyan-400/40 opacity-60 blur-xl" />
              <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white p-3.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.5)] sm:h-36 sm:w-36">
                {logoSrc ? (
                  <Image src={logoSrc} alt={page.name} width={140} height={140} className={`h-auto max-h-20 w-auto object-contain sm:max-h-28 ${invertLogo ? 'brightness-0' : ''}`} />
                ) : (
                  <span className="text-5xl font-bold text-slate-400">{page.name.charAt(0)}</span>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {/* Eyebrow chip with pulsing dot */}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md sm:tracking-[0.28em]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.25)] animate-pulse" />
                Professional Association
              </span>

              {/* Name with animated gradient */}
              <h1
                className="mt-3 bg-[linear-gradient(92deg,#ffffff_0%,#cbd5e1_50%,#ffffff_100%)] bg-[length:200%_100%] bg-clip-text text-[2rem] font-bold leading-[0.95] tracking-[-0.04em] text-transparent drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:text-[2.75rem] lg:text-[3.5rem]"
                style={{ animation: 'gradient-text-cycle 6s ease-in-out infinite' }}
              >
                {page.name}
              </h1>

              {/* Verified Partner badge — only when actually a partner */}
              {page.is_verified && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-gradient-to-r from-blue-500/25 to-cyan-500/15 px-3.5 py-1.5 text-[11px] font-bold text-blue-200 shadow-[0_4px_14px_-4px_rgba(59,130,246,0.4)] backdrop-blur-sm">
                  <ShieldCheck className="h-3.5 w-3.5" /> Investigator Events Partner
                </span>
              )}

              {/* Gradient accent line */}
              <div aria-hidden className="mt-4 h-px w-24 bg-gradient-to-r from-blue-400/80 via-purple-400/60 to-transparent" />

              {/* Description */}
              {page.description && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">{page.description}</p>
              )}

              {/* Meta row */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/45">
                {page.country && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-blue-400/70" /> {page.country}</span>}
                {page.founded_year && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-purple-400/70" /> Est. {page.founded_year}</span>}
                {page.member_count && <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-cyan-400/70" /> {page.member_count.toLocaleString()} members</span>}
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-emerald-400/70" /> {upcoming.length + past.length} events</span>
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {page.website && (
                  <a
                    href={page.website}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_12px_30px_-8px_rgba(255,255,255,0.4)] transition active:scale-[0.98]"
                  >
                    <span className="absolute -top-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                    Join {page.name}
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </a>
                )}
                {page.website && (
                  <a
                    href={page.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition active:scale-[0.98] hover:bg-white/[0.10]"
                  >
                    <Globe className="h-3.5 w-3.5" /> Website <ExternalLink className="h-3 w-3 opacity-40" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats bar — glassmorphism (inset highlight + backdrop-blur) on
              top of the gradient tints for a premium dashboard feel. */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { value: upcoming.length, label: 'Upcoming events', color: 'from-blue-500/25 to-blue-600/10 border-blue-400/20 text-blue-200' },
              { value: past.length, label: 'Past events', color: 'from-white/10 to-white/[0.03] border-white/15 text-white/70' },
              { value: platformMembers, label: 'On platform', color: 'from-violet-500/25 to-violet-600/10 border-violet-400/20 text-violet-200' },
              { value: verifiedCount, label: 'Verified members', color: 'from-emerald-500/25 to-emerald-600/10 border-emerald-400/20 text-emerald-200' },
            ].map((s) => (
              <div
                key={s.label}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:p-5 ${s.color}`}
              >
                <p className="text-2xl font-bold tracking-[-0.02em] sm:text-3xl">{s.value}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-60">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Global network logo loop — slim, animated, edge-faded. Sits at
              the bottom of the dark hero so it transitions naturally into the
              next section. Filters out the current association so users
              don't see their own logo in the loop. */}
          <NetworkLogoStrip excludeName={page.name} excludeSlug={page.slug} />
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

      {/* ═══ EVENTS SECTION — light background with gradient orbs ═══ */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#f8fbff_50%,#ffffff_100%)]">
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.10),transparent_65%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-1/3 -right-20 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.08),transparent_65%)] blur-3xl" />
        <div className="container-shell relative py-12 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)] animate-pulse" />
            Events
          </span>
          <h2 className="mt-3 text-[2rem] font-bold leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-[2.75rem]">
            {page.name}{' '}
            <span
              className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
              style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
            >
              events
            </span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">Browse all conferences, meetings, and training events organised by or linked to {page.name}.</p>

          {upcoming.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]" />
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Upcoming</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-blue-200/80 to-transparent" />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3">
                <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-slate-300" />
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Past events</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.slice(0, 6).map((e) => <EventCard key={e.id} event={e} muted />)}
              </div>
              {past.length > 6 && <p className="mt-4 text-center text-sm text-slate-400">+ {past.length - 6} more past events</p>}
            </div>
          )}

          {upcoming.length === 0 && past.length === 0 && (
            <div className="mt-8 rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 py-12 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 text-blue-500">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-slate-900">No events listed yet</p>
              <p className="mt-1 text-sm text-slate-500">Be the first to add a {page.name} event.</p>
              <Link href="/submit-event" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95">
                Submit an event <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ═══ MEMBERS SECTION ═══ */}
      <div className="border-t border-slate-200/40 bg-white">
        <div className="container-shell py-12 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_0_3px_rgba(168,85,247,0.2)] animate-pulse" />
            Directory
          </span>
          <h2 className="mt-3 text-[2rem] font-bold leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-[2.75rem]">
            Members on{' '}
            <span
              className="inline-block bg-[linear-gradient(92deg,#a855f7_0%,#ec4899_50%,#3b82f6_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
              style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
            >
              the platform
            </span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">Investigators who have added {page.name} to their profile. The green verified badge means the user has confirmed their identity (via LinkedIn or platform admin).</p>

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
  // Used to early-return null when m.profile was missing, which silently
  // hid members whose embedded profile join didn't resolve. Now we
  // always render the member; if profile data is missing we just show
  // a placeholder card instead of disappearing them.
  const p = m.profile;
  const color = p?.profile_color ?? '#3b82f6';
  return (
    <Link
      href={p?.username ? `/profile/${p.username}` : '#'}
      className={`group flex items-center gap-4 overflow-hidden rounded-[1.2rem] border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        m.isVerified ? 'border-emerald-200/60' : 'border-slate-200/60'
      }`}
    >
      <div className="relative flex-shrink-0">
        <UserAvatar src={p?.avatar_url ?? null} name={p?.full_name ?? null} size={48} color={color} />
        {m.isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
            <ShieldCheck className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600">{p?.full_name ?? 'Member'}</p>
          {m.isVerified && <span className="flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-bold text-emerald-700">VERIFIED</span>}
        </div>
        <p className="truncate text-xs text-slate-400">{m.role || p?.headline || p?.specialisation || ''}</p>
        {p?.country && <p className="mt-0.5 text-[11px] text-slate-300">{p.country}</p>}
      </div>
    </Link>
  );
}
