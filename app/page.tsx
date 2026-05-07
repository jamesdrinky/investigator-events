import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { AssociationLoopSection } from '@/components/home/AssociationLoopSection';
import { FounderQuoteSection } from '@/components/home/FounderQuoteSection';
import { UpcomingEventsGallery } from '@/components/home/UpcomingEventsGallery';
import { WhyUseSection } from '@/components/home/WhyUseSection';
import { HomepageHero } from '@/components/home/homepage-hero';
import { LoggedInHome } from '@/components/home/LoggedInHome';
import { Reveal } from '@/components/motion/reveal';
import { fetchAllEvents, fetchFeaturedEvents } from '@/lib/data/events';
import { getCoverageMetrics } from '@/lib/utils/coverage';
import { parseDate, sortEventsByDate } from '@/lib/utils/date';

const FeaturedEventsSection = nextDynamic(
  () => import('@/components/home/FeaturedEventsSection').then((m) => m.FeaturedEventsSection),
);

const GlobeNewsletterSection = nextDynamic(
  () => import('@/components/home/GlobeNewsletterSection').then((m) => m.GlobeNewsletterSection),
  { ssr: false }
);

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    absolute: 'Investigator Events — Global PI Conference & Events Calendar'
  },
  description: 'Confirmed private investigator conferences, AGMs, training events, and association meetings in one global calendar.'
};


export default async function HomePage() {
  // Check for auth cookie server-side to prevent marketing page flash
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

  const [featuredEvents, allEvents] = await Promise.all([fetchFeaturedEvents(6), fetchAllEvents()]);
  const mainEvents = sortEventsByDate(allEvents.filter((event) => event.eventScope === 'main'));
  const coverage = getCoverageMetrics(mainEvents);
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const upcomingEvents = mainEvents.filter((event) => parseDate(event.date).getTime() >= today.getTime());

  const heroEvents = (featuredEvents.length > 0 ? featuredEvents : upcomingEvents).slice(0, 4);
  const featuredCarouselEvents = featuredEvents.length > 0 ? featuredEvents : upcomingEvents.slice(0, 8);

  const uniqueAssociations = new Set(mainEvents.map((e) => e.association ?? e.organiser)).size;
  const heroStats = [
    { label: 'Countries', value: coverage.totalCountries },
    { label: 'Live events', value: coverage.totalEvents },
    { label: 'Associations', value: `${uniqueAssociations - 1}+` }
  ];

  return (
    <div className="relative flex flex-col">
      {/* Hide marketing sections immediately if auth cookie present (prevents flash) */}
      {hasAuthCookie && (
        <style dangerouslySetInnerHTML={{ __html: `.mesh-blob { display: none !important; } [data-homepage-section] { display: none !important; }` }} />
      )}

      {/* ── Personalised home for logged-in mobile users ── */}
      <LoggedInHome />

      {/* ── Stripe-style animated gradient mesh blobs ── */}
      <div className="mesh-blob mesh-blob-1" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-2" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-3" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-4" aria-hidden="true" />

      <div data-homepage-section className="order-1 sm:order-none">
        <HomepageHero events={heroEvents} stats={heroStats} />
      </div>

      <div data-homepage-section className="order-2 mobile-section-divider sm:order-none ">
        <AssociationLoopSection />
      </div>

      <div data-homepage-section className="order-3 mobile-section-divider sm:order-none ">
        <UpcomingEventsGallery events={upcomingEvents} />
      </div>

      <div data-homepage-section className="order-4 sm:order-none">
        <WhyUseSection />
      </div>

      <div data-homepage-section className="order-5 sm:order-none">
        <div className="container-shell py-6 sm:py-10">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-purple-50/80 px-6 py-8 text-center sm:flex-row sm:justify-between sm:px-10 sm:text-left">
            <div>
              <p className="text-base font-bold text-slate-900 sm:text-lg">Run conferences or training events?</p>
              <p className="mt-1 text-sm text-slate-500">List your event for free — it takes 2 minutes and reaches investigators worldwide.</p>
            </div>
            <Link
              href="/submit-event"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Submit your event →
            </Link>
          </div>
        </div>
      </div>

      <div data-homepage-section className="order-6 sm:order-none">
        <FounderQuoteSection />
      </div>

      <div data-homepage-section className="order-7 sm:order-none">
        <FeaturedEventsSection events={featuredCarouselEvents} />
      </div>

      <div data-homepage-section className="order-8 sm:order-none">
        <div className="container-shell py-14 sm:py-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-14 text-center sm:px-12 sm:py-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-400">Join the community</p>
                <h2 className="mx-auto mt-4 max-w-lg text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Get discovered. Get connected. Get ahead.
                </h2>
                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-blue-200/60 sm:text-base">
                  Create your free profile, connect with investigators worldwide, and never miss an event in your region.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex min-h-[3rem] items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-blue-50 sm:text-base"
                  >
                    Create your free profile
                  </Link>
                  <Link
                    href="/directory"
                    className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 sm:text-base"
                  >
                    Browse the directory
                  </Link>
                </div>
                <p className="mt-4 text-xs text-blue-200/30">Takes 2 minutes · Free forever · No spam</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div data-homepage-section className="order-9 sm:order-none">
        <div className="container-shell py-14 sm:py-20">
          <div className="app-mobile-shell">
            <Reveal>
              <GlobeNewsletterSection />
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
