import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import Link from 'next/link';
import { AssociationLoopSection } from '@/components/home/AssociationLoopSection';
import { FounderQuoteSection } from '@/components/home/FounderQuoteSection';
import { UpcomingEventsGallery } from '@/components/home/UpcomingEventsGallery';
import { WhyUseSection } from '@/components/home/WhyUseSection';
import { HomepageHero } from '@/components/home/homepage-hero';
import { MobileHero } from '@/components/home/MobileHero';
import { LoggedInHome } from '@/components/home/LoggedInHome';
import { AppPromo } from '@/components/home/AppPromo';
import { WhatYouGet } from '@/components/home/WhatYouGet';
import { VerifiedInvestigators, type VerifiedMember } from '@/components/home/VerifiedInvestigators';
import { FinalConversionCTA } from '@/components/home/FinalConversionCTA';
import { EventsShowcase, type ShowcaseEvent } from '@/components/home/EventsShowcase';
import { fetchAllEvents, fetchFeaturedEvents } from '@/lib/data/events';
import { getCoverageMetrics } from '@/lib/utils/coverage';
import { parseDate, sortEventsByDate, formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

const FeaturedEventsSection = nextDynamic(
  () => import('@/components/home/FeaturedEventsSection').then((m) => m.FeaturedEventsSection),
);

const GlobeNewsletterSection = nextDynamic(
  () => import('@/components/home/GlobeNewsletterSection').then((m) => m.GlobeNewsletterSection),
  { ssr: false }
);

// Cached at Vercel edge for 60s. The auth-aware UI swap (marketing vs.
// LoggedInHome) is handled client-side now via a synchronous head script
// that sets html.is-authed before paint — see app/layout.tsx.
export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: 'Investigator Events — Global PI Conference & Events Calendar'
  },
  description: 'Confirmed private investigator conferences, AGMs, training events, and association meetings in one global calendar.'
};

// Curated showcase: 4 fixed leaders + 3 newest LinkedIn-verified signups with a banner.
// The fixed 4 are Mike's pick — order is locked. The trailing 3 rotate as polished
// profiles join, so the bottom row stays fresh without ever showing duplicate stubs.
const SHOWCASE_FIXED_IDS = [
  'f1933441-a50e-4e30-81e7-4c9546216259', // Mike LaCorte — CEO Conflict International, ABI President
  'ad551a2d-c5cf-4a0c-8c9f-f97e4b77acd3', // Charlotte Notley — Director Taylor Investigations, ABI
  'a12422ae-8e92-4fc5-8b22-e4427f61d50e', // Alex Auslander — Alex Auslander Investigations
  'd8b1dd37-837a-4f23-9e34-9115f6e03ea7', // Hayk Gabrielyan — CEO Gabrielyan, Armenian PI Assoc President
];

async function fetchVerifiedMembers(): Promise<{ members: VerifiedMember[]; countries: number }> {
  try {
    const admin = createSupabaseAdminServerClient();

    const { data: fixedRows } = await (admin.from('profiles' as never)
      .select('id, full_name, username, avatar_url, country, headline')
      .in('id', SHOWCASE_FIXED_IDS) as any);
    const fixedById = new Map<string, any>(((fixedRows ?? []) as any[]).map((p) => [p.id, p]));
    const fixed = SHOWCASE_FIXED_IDS
      .map((id) => fixedById.get(id))
      .filter((p): p is NonNullable<typeof p> => !!p);

    const { data: freshRows } = await (admin.from('profiles' as never)
      .select('id, full_name, username, avatar_url, country, headline, created_at')
      .eq('is_public', true)
      .eq('auth_provider', 'linkedin_oidc')
      .not('avatar_url', 'is', null)
      .not('banner_url', 'is', null)
      .not('headline', 'is', null)
      .not('id', 'in', `(${SHOWCASE_FIXED_IDS.join(',')})`)
      .order('created_at', { ascending: false })
      .limit(3) as any);
    const fresh = (freshRows ?? []) as any[];

    const ordered = [...fixed, ...fresh];
    const members: VerifiedMember[] = ordered.map((p) => ({
      id: p.id,
      fullName: p.full_name,
      username: p.username,
      avatarUrl: p.avatar_url,
      country: p.country,
      headline: p.headline,
    }));

    const { data: countryRows } = await (admin
      .from('profiles' as never)
      .select('country')
      .eq('is_public', true)
      .not('country', 'is', null) as any);
    const distinctCountries = new Set(((countryRows ?? []) as { country: string }[]).map((r) => r.country)).size;
    return { members, countries: distinctCountries };
  } catch {
    return { members: [], countries: 0 };
  }
}

export default async function HomePage() {
  const [featuredEvents, allEvents, verifiedData] = await Promise.all([
    fetchFeaturedEvents(6),
    fetchAllEvents(),
    fetchVerifiedMembers(),
  ]);
  const mainEvents = sortEventsByDate(allEvents.filter((event) => event.eventScope === 'main'));
  const coverage = getCoverageMetrics(mainEvents);
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const upcomingEvents = mainEvents.filter((event) => parseDate(event.date).getTime() >= today.getTime());

  const heroEvents = (featuredEvents.length > 0 ? featuredEvents : upcomingEvents).slice(0, 4);
  const featuredCarouselEvents = featuredEvents.length > 0 ? featuredEvents : upcomingEvents.slice(0, 8);

  // EventsShowcase is mobile-only — desktop keeps the original sections.
  const showcaseFeed = (() => {
    const featuredIds = new Set(featuredEvents.map((e) => e.id));
    const remainingUpcoming = upcomingEvents.filter((e) => !featuredIds.has(e.id));
    return [...featuredEvents, ...remainingUpcoming].slice(0, 7);
  })();
  const toShowcase = (e: typeof showcaseFeed[number]): ShowcaseEvent => ({
    id: e.id,
    title: e.title,
    date: formatEventDate(e),
    city: e.city,
    country: e.country,
    region: e.region,
    category: e.category,
    slug: getEventSlug(e),
    association: e.association ?? e.organiser,
    coverImage: e.coverImage,
    description: e.description || undefined,
    featured: e.featured,
  });
  const showcaseHero = showcaseFeed[0] ? toShowcase(showcaseFeed[0]) : null;
  const showcaseRest = showcaseFeed.slice(1).map(toShowcase);

  const uniqueAssociations = new Set(mainEvents.map((e) => e.association ?? e.organiser)).size;
  const heroStats = [
    { label: 'Countries', value: coverage.totalCountries },
    { label: 'Live events', value: coverage.totalEvents },
    { label: 'Associations', value: `${uniqueAssociations - 1}+` }
  ];

  return (
    <div className="relative flex flex-col">
      {/* Auth-aware section hiding is now handled by layout.tsx's head script
          which sets html.is-authed before paint. That + a CSS rule hides
          .mesh-blob and [data-homepage-section] when logged in. */}

      <LoggedInHome />

      <div className="mesh-blob mesh-blob-1" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-2" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-3" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-4" aria-hidden="true" />

      {/* 1a. HERO — MOBILE (sm:hidden) — completely new design, no globe */}
      <div data-homepage-section className="order-1 sm:hidden">
        <MobileHero events={heroEvents} stats={heroStats} />
      </div>

      {/* 1b. HERO — DESKTOP (hidden sm:block) — keeps the D3 globe */}
      <div data-homepage-section className="order-1 hidden sm:order-none sm:block">
        <HomepageHero events={heroEvents} stats={heroStats} />
      </div>

      {/* 2. ASSOCIATION LOOP — desktop only (mobile gets the WhatYouGet grid + EventsShowcase) */}
      <div data-homepage-section className="order-2 hidden mobile-section-divider sm:order-none sm:block">
        <AssociationLoopSection />
      </div>

      {/* 3. WHAT YOU GET — both viewports */}
      <div data-homepage-section className="order-3 sm:order-none">
        <WhatYouGet />
      </div>

      {/* 4a. EVENTS — mobile-only merged showcase */}
      {showcaseHero && (
        <div data-homepage-section className="order-4 sm:hidden">
          <EventsShowcase hero={showcaseHero} rest={showcaseRest} />
        </div>
      )}

      {/* 4b. EVENTS — desktop keeps the original two sections (accordion + featured carousel) */}
      <div data-homepage-section className="order-5 hidden mobile-section-divider sm:order-none sm:block">
        <UpcomingEventsGallery events={upcomingEvents} />
      </div>

      {/* 5. VERIFIED INVESTIGATORS — both viewports */}
      {verifiedData.members.length > 0 && (
        <div data-homepage-section className="order-6 sm:order-none">
          <VerifiedInvestigators
            members={verifiedData.members}
            totalCount={100}
            countriesCount={verifiedData.countries}
          />
        </div>
      )}

      {/* 6. WHY USE — desktop only */}
      <div data-homepage-section className="order-7 hidden sm:order-none sm:block">
        <WhyUseSection />
      </div>

      {/* 7. FOR ORGANISERS — both viewports */}
      <div data-homepage-section className="order-8 sm:order-none">
        <div className="container-shell py-6 sm:py-10">
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-6 py-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)] sm:rounded-3xl sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300/80">For organisers</p>
                <p className="mt-2 text-lg font-bold leading-tight text-white sm:text-xl">Run conferences or training events?</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300/85">List your event for free — it takes 2 minutes and reaches investigators worldwide.</p>
              </div>
              <Link
                href="/submit-event"
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_8px_20px_-8px_rgba(255,255,255,0.4)] transition active:scale-95"
              >
                Submit your event →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 8. FOUNDER QUOTE — desktop only */}
      <div data-homepage-section className="order-9 hidden sm:order-none sm:block">
        <FounderQuoteSection />
      </div>

      {/* 9. FEATURED EVENTS — desktop only (mobile already saw them in EventsShowcase above) */}
      <div data-homepage-section className="order-10 hidden sm:order-none sm:block">
        <FeaturedEventsSection events={featuredCarouselEvents} />
      </div>

      {/* 9b. APP PROMO — replaces the heavy scroll-pinned cinematic with a
              normal-flow section that keeps scroll pace fast. Same iPhone
              mockup + count-up + App Store buttons + floating badges, but
              IntersectionObserver-triggered animations (one-shot, smooth).
              Renders on both desktop AND mobile since it no longer breaks
              scroll responsiveness. */}
      <div data-homepage-section className="order-11 sm:order-none">
        <AppPromo liveEventCount={coverage.totalEvents} countriesCount={verifiedData.countries || 19} />
      </div>

      {/* 10. FINAL CONVERSION CTA — both viewports */}
      <div data-homepage-section className="order-11 sm:order-none">
        <FinalConversionCTA countriesCount={verifiedData.countries || 19} />
      </div>

      {/* 11. NEWSLETTER */}
      <div data-homepage-section className="order-12 sm:order-none">
        <div className="container-shell py-6 sm:py-20">
          <div className="app-mobile-shell">
            <GlobeNewsletterSection />
          </div>
        </div>
      </div>
    </div>
  );
}
