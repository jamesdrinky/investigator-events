import Link from 'next/link';
import { CTASection } from '@/components/cta-section';
import { EventCard } from '@/components/event-card';
import { HomeAssociationNetwork } from '@/components/home-association-network';
import { HomeNewsletterSection } from '@/components/home-newsletter-section';
import { HomePartnerVisibility } from '@/components/home-partner-visibility';
import { GlobalAssociationSection } from '@/components/global-association-section';
import { GlobalCoverageSection } from '@/components/global-coverage-section';
import { HomeGlobalCoordinationNetwork } from '@/components/home-global-coordination-network';
import { HomeWeeklyBrief } from '@/components/home-weekly-brief';
import { Hero } from '@/components/hero';
import { Reveal } from '@/components/motion/reveal';
import { SectionStage } from '@/components/motion/section-stage';
import { fetchAllEvents, fetchFeaturedEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { getAssociationSummaries } from '@/lib/utils/associations';
import { getCountryActivity, getCoverageMetrics } from '@/lib/utils/coverage';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featuredEvents, allEvents] = await Promise.all([fetchFeaturedEvents(6), fetchAllEvents()]);
  const mainEvents = allEvents.filter((event) => event.eventScope === 'main');
  const coverage = getCoverageMetrics(mainEvents);
  const countryActivity = getCountryActivity(mainEvents);
  const now = new Date();
  const weekly = getWeeklyCollections(mainEvents, now);
  const associations = getAssociationSummaries(mainEvents, 8);
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
          totalAssociations: associations.length
        }}
        regions={coverage.regions}
      />

      <section className="section-pad relative overflow-hidden pt-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(54,168,255,0.09),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%,rgba(255,255,255,0.015))]" />
        <SectionStage className="container-shell">
          <Reveal className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Featured Events</p>
              <h2 className="section-title">The major conferences and destination meetings shaping the live network</h2>
              <p className="section-copy max-w-2xl">
                Start with the strongest current signals, then move into the live calendar to compare dates by region,
                organiser, and category.
              </p>
            </div>
            <Link href="/calendar" className="btn-secondary px-5 py-2.5">
              Open Calendar
            </Link>
          </Reveal>

          <Reveal className="mb-6">
            <div className="relative grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="lux-panel relative overflow-hidden px-5 py-5 sm:px-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(54,168,255,0.14),transparent_28%),radial-gradient(circle_at_78%_70%,rgba(255,177,74,0.08),transparent_22%)]" />
                <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Regional coverage</p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
                  These counts show where current listings are concentrated, giving the homepage a real geographic picture
                  instead of a flat product summary.
                </p>
                <p className="mt-5 max-w-sm text-xs uppercase tracking-[0.22em] text-slate-500">
                  Region-level coverage snapshot
                </p>
              </div>
              <div className="lux-panel relative overflow-hidden px-4 py-4 sm:px-5">
                {regionalSignals.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {regionalSignals.map((signal) => (
                      <article
                        key={signal.name}
                        className="min-w-[11rem] flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{signal.name}</p>
                        <p className="mt-1 text-sm text-slate-200">{signal.summary}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-300">No approved main events are live yet for regional coverage.</p>
                )}
              </div>
            </div>
          </Reveal>

          {featuredEvents.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <Reveal>
                <EventCard event={featuredEvents[0]} />
              </Reveal>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {featuredEvents.slice(1, 5).map((event, index) => (
                  <Reveal key={event.id} delay={index * 0.04}>
                    <EventCard event={event} />
                  </Reveal>
                ))}
              </div>
            </div>
          ) : (
            <Reveal>
              <div className="lux-panel p-8 text-center">
                <h3 className="text-lg font-semibold text-white">No featured events are live yet</h3>
                <p className="mt-2 text-sm text-slate-300">
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
        <HomePartnerVisibility />
      </SectionStage>

      <SectionStage>
        <HomeNewsletterSection />
      </SectionStage>

      <section className="section-pad relative overflow-hidden pt-2">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%,rgba(255,255,255,0.015))]" />
        <SectionStage className="container-shell">
          <Reveal>
            <div className="global-panel relative overflow-hidden p-8 sm:p-10">
              <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.1]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent_36%,rgba(255,255,255,0.01))]" />
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
                  <article className="rounded-[1.4rem] border border-white/12 bg-white/[0.035] px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-accent">Submit details</p>
                    <p className="mt-2 text-sm text-slate-200">Organisers enter the event name, dates, location, category, website, and contact email.</p>
                  </article>
                  <article className="rounded-[1.4rem] border border-white/12 bg-white/[0.035] px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-accent">Review</p>
                    <p className="mt-2 text-sm text-slate-200">Submissions stay private until they are checked and approved.</p>
                  </article>
                  <article className="rounded-[1.4rem] border border-white/12 bg-white/[0.035] px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-accent">Publication</p>
                    <p className="mt-2 text-sm text-slate-200">Approved events move onto the public calendar and become visible across the platform.</p>
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
