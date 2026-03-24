import Link from 'next/link';
import { CTASection } from '@/components/cta-section';
import { EventCoverMedia } from '@/components/event-cover-media';
import { HomeAssociationNetwork } from '@/components/home-association-network';
import { HomeNewsletterSection } from '@/components/home-newsletter-section';
import { GlobalAssociationSection } from '@/components/global-association-section';
import { GlobalCoverageSection } from '@/components/global-coverage-section';
import { HomeGlobalCoordinationNetwork } from '@/components/home-global-coordination-network';
import { HomeWeeklyBrief } from '@/components/home-weekly-brief';
import { Hero } from '@/components/hero';
import { Reveal } from '@/components/motion/reveal';
import { SaveDateLinks } from '@/components/save-date-links';
import { SectionStage } from '@/components/motion/section-stage';
import { fetchAllEvents, fetchFeaturedEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { getHomepageAssociationNetwork } from '@/lib/utils/associations';
import { getCountryActivity, getCoverageMetrics } from '@/lib/utils/coverage';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featuredEvents, allEvents] = await Promise.all([fetchFeaturedEvents(6), fetchAllEvents()]);
  const mainEvents = allEvents.filter((event) => event.eventScope === 'main');
  const coverage = getCoverageMetrics(mainEvents);
  const countryActivity = getCountryActivity(mainEvents);
  const now = new Date();
  const weekly = getWeeklyCollections(mainEvents, now);
  const associationNetwork = getHomepageAssociationNetwork(mainEvents, Number.MAX_SAFE_INTEGER);
  const associations = associationNetwork.slice(0, 8);
  const regionalSignals = coverage.regions
    .filter((region) => region.eventCount > 0)
    .map((region) => ({
      name: region.name,
      summary: `${region.eventCount} event${region.eventCount === 1 ? '' : 's'} in ${region.countryCount} countr${
        region.countryCount === 1 ? 'y' : 'ies'
      }`
    }));

  return (
    <>
      <Hero
        stats={{
          totalEvents: coverage.totalEvents,
          totalCountries: coverage.totalCountries,
          activeRegions: coverage.regions.filter((region) => region.eventCount > 0).length,
          totalAssociations: associationNetwork.length
        }}
        regions={coverage.regions}
      />

      <section className="section-open relative overflow-hidden bg-[#f8fafc] pb-24 pt-24 sm:pb-28 sm:pt-28">
        <SectionStage className="container-shell">
          <Reveal className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Featured Events</p>
              <h2 className="section-title">The destination conferences and high-value meetings driving the live calendar</h2>
            </div>
            <Link href="/calendar" className="btn-secondary px-5 py-2.5">
              Open Calendar
            </Link>
          </Reveal>

          <Reveal className="mb-5">
            <div className="relative grid gap-3 lg:grid-cols-[0.82fr_1.18fr]">
              <div className="surface-flat px-6 py-6">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Regional coverage</p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
                  A fast read on where event activity is currently strongest, so the homepage feels like an international
                  product surface instead of a brochure.
                </p>
                <p className="mt-5 max-w-sm text-xs uppercase tracking-[0.22em] text-slate-400">
                  Region-level coverage snapshot
                </p>
              </div>
              <div className="surface-flat px-5 py-5">
                {regionalSignals.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {regionalSignals.map((signal) => (
                      <article
                        key={signal.name}
                        className="min-w-[11rem] flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{signal.name}</p>
                        <p className="mt-1 text-sm text-slate-700">{signal.summary}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No approved main events are live yet for regional coverage.</p>
                )}
              </div>
            </div>
          </Reveal>

          {featuredEvents.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-[1.24fr_0.76fr]">
              <Reveal>
                <article className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-6 [transform:scale(1.02)]">
                  <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                    <div className="order-2 lg:order-1">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-blue-600">Flagship featured event</p>
                      <h3 className="mt-4 max-w-[10ch] font-[var(--font-serif)] text-4xl leading-[0.92] text-slate-950 sm:text-[3.6rem]">{featuredEvents[0].title}</h3>
                      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                        {featuredEvents[0].description || 'Open the event record for the full location, organiser, and official conference source.'}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="country-chip">{featuredEvents[0].city}</span>
                        <span className="country-chip">{featuredEvents[0].country}</span>
                        <span className="global-chip">{featuredEvents[0].region}</span>
                        <span className="city-chip">{featuredEvents[0].association ?? featuredEvents[0].organiser}</span>
                      </div>
                      <p className="mt-5 text-sm uppercase tracking-[0.18em] text-slate-500">{formatEventDate(featuredEvents[0])}</p>
                      <div className="mt-7 flex flex-wrap gap-3">
                        <Link href={`/events/${getEventSlug(featuredEvents[0])}`} className="btn-primary px-5 py-2.5">
                          Open featured event
                        </Link>
                        <SaveDateLinks event={featuredEvents[0]} />
                      </div>
                    </div>

                    <div className="order-1 lg:order-2">
                      <EventCoverMedia
                        title={featuredEvents[0].title}
                        city={featuredEvents[0].city}
                        country={featuredEvents[0].country}
                        region={featuredEvents[0].region}
                        category={featuredEvents[0].category}
                        coverImage={featuredEvents[0].coverImage}
                        coverImageAlt={featuredEvents[0].coverImageAlt}
                        associationName={featuredEvents[0].association ?? featuredEvents[0].organiser}
                        featured={featuredEvents[0].featured}
                        priorityLabel="Featured destination"
                        className="h-[22rem] sm:h-[24rem]"
                      />
                    </div>
                  </div>
                </article>
              </Reveal>
              <div className="grid gap-4">
                {featuredEvents.slice(1, 5).map((event, index) => (
                  <Reveal key={event.id} delay={index * 0.04}>
                    <article className="surface-elevated p-6">
                      <div className="relative grid gap-3 sm:grid-cols-[7.25rem_minmax(0,1fr)]">
                        <EventCoverMedia
                          title={event.title}
                          city={event.city}
                          country={event.country}
                          region={event.region}
                          category={event.category}
                          coverImage={event.coverImage}
                          coverImageAlt={event.coverImageAlt}
                          associationName={event.association ?? event.organiser}
                          featured={event.featured}
                          compact
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{event.category}</p>
                          <h4 className="mt-1.5 text-lg font-semibold leading-tight text-slate-950">{event.title}</h4>
                          <p className="mt-1.5 text-sm text-slate-600">{event.city}, {event.country}</p>
                          <p className="mt-2 text-sm text-slate-500">{formatEventDate(event)}</p>
                          <div className="mt-3 flex flex-wrap gap-3">
                            <Link href={`/events/${getEventSlug(event)}`} className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">
                              Open event
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          ) : (
            <Reveal>
              <div className="surface-flat p-8 text-center">
                <h3 className="text-lg font-semibold text-slate-950">No featured events are live yet</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Featured live events will appear here once they have been added to the public calendar.
                </p>
              </div>
            </Reveal>
          )}
        </SectionStage>
      </section>

      <SectionStage>
        <HomeWeeklyBrief newlyAdded={weekly.newlyAdded} upcoming={weekly.upcoming} featured={weekly.featured} />
      </SectionStage>

      <SectionStage>
        <HomeAssociationNetwork associations={associations} />
      </SectionStage>

      <SectionStage>
        <HomeGlobalCoordinationNetwork
          stats={{
            totalCountries: coverage.totalCountries,
            totalSubregions: coverage.totalSubregions,
            totalEvents: coverage.totalEvents
          }}
          regions={coverage.regions}
        />
      </SectionStage>
      <SectionStage>
        <div className="container-shell grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <GlobalCoverageSection regions={coverage.regions} />
          <GlobalAssociationSection regions={coverage.regions} countries={countryActivity} />
        </div>
      </SectionStage>

      <SectionStage>
        <HomeNewsletterSection />
      </SectionStage>

      <section className="section-pad relative overflow-hidden pt-0">
        <SectionStage className="container-shell">
          <Reveal>
            <div className="global-panel relative p-6 sm:p-8">
              <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <p className="eyebrow">Submit Event</p>
                  <h2 className="section-title">Organisers can now send events into the global review queue</h2>
                  <p className="section-copy max-w-2xl">
                    New listings move through review before they appear in the live network, keeping the global calendar
                    structured while still expanding rapidly.
                  </p>
                </div>
                <div className="grid gap-3">
                  <article className="surface-flat px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-600">Submit details</p>
                    <p className="mt-2 text-sm text-slate-600">Organisers enter the event name, dates, location, category, website, and contact email.</p>
                  </article>
                  <article className="surface-flat px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-600">Review</p>
                    <p className="mt-2 text-sm text-slate-600">Submissions stay private until they are checked and approved.</p>
                  </article>
                  <article className="surface-flat px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-600">Publication</p>
                    <p className="mt-2 text-sm text-slate-600">Approved events move onto the public calendar and become visible across the platform.</p>
                  </article>
                </div>
              </div>
            </div>
          </Reveal>
        </SectionStage>
      </section>

      <SectionStage>
        <CTASection />
      </SectionStage>
    </>
  );
}
