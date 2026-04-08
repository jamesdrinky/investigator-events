import type { Metadata } from 'next';
import { AssociationLoopSection } from '@/components/home/AssociationLoopSection';
import { FeaturedEventsSection } from '@/components/home/FeaturedEventsSection';
import { FounderQuoteSection } from '@/components/home/FounderQuoteSection';
import { GlobeNewsletterSection } from '@/components/home/GlobeNewsletterSection';
import { UpcomingEventsGallery } from '@/components/home/UpcomingEventsGallery';
import { WhyUseSection } from '@/components/home/WhyUseSection';
import { HomepageHero } from '@/components/home/homepage-hero';
import { Reveal } from '@/components/motion/reveal';
import { SiteIntro } from '@/components/site-intro';
import { fetchAllEvents, fetchFeaturedEvents } from '@/lib/data/events';
import { getCoverageMetrics } from '@/lib/utils/coverage';
import { parseDate, sortEventsByDate } from '@/lib/utils/date';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    absolute: 'Investigator Events — Global PI Conference & Events Calendar'
  },
  description: 'Confirmed private investigator conferences, AGMs, training events, and association meetings in one global calendar.'
};


export default async function HomePage() {
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
      <SiteIntro />
      {/* ── Stripe-style animated gradient mesh blobs ── */}
      <div className="mesh-blob mesh-blob-1" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-2" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-3" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-4" aria-hidden="true" />

      <div className="order-1 sm:order-none">
        <HomepageHero events={heroEvents} stats={heroStats} />
      </div>

      <div className="order-2 mobile-section-divider sm:order-none ">
        <AssociationLoopSection />
      </div>

      <div className="order-3 mobile-section-divider sm:order-none ">
        <UpcomingEventsGallery events={upcomingEvents} />
      </div>

      <div className="order-4 sm:order-none">
        <WhyUseSection />
      </div>

      <div className="order-5 sm:order-none">
        <FounderQuoteSection />
      </div>

      <div className="order-6 sm:order-none">
        <FeaturedEventsSection events={featuredCarouselEvents} />
      </div>

      <div className="order-7 sm:order-none">
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
