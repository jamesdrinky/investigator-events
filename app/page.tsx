import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { EventCoverMedia } from '@/components/event-cover-media';
import { FounderQuoteSection } from '@/components/home/FounderQuoteSection';
import { WhyUseSection } from '@/components/home/WhyUseSection';
import { HomepageHero } from '@/components/home/homepage-hero';
import { NewsletterSignupForm } from '@/components/newsletter-signup-form';
import { Reveal } from '@/components/motion/reveal';
import { fetchAllEvents, fetchFeaturedEvents } from '@/lib/data/events';
import { getAssociationBrandLogoSrc, getAssociationBrandingCount } from '@/lib/utils/association-branding';
import { getCoverageMetrics } from '@/lib/utils/coverage';
import { getAssociationSummaries, type AssociationSummary } from '@/lib/utils/associations';
import { formatEventDate, parseDate, sortEventsByDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    absolute: 'Investigator Events — Global PI Conference & Events Calendar'
  },
  description: 'Confirmed private investigator conferences, AGMs, training events, and association meetings in one global calendar.'
};

function formatCount(label: 'event' | 'country', count: number) {
  const plural = label === 'country' ? 'countries' : 'events';
  return `${count} ${count === 1 ? label : plural}`;
}

function selectFeaturedAssociation(summaries: AssociationSummary[]) {
  const abi =
    summaries.find((association) => {
      const name = association.canonicalName.toLowerCase();
      return name.includes('association of british investigators') || association.shortName.toLowerCase() === 'abi' || name.includes('(abi)');
    }) ?? null;

  if (abi) {
    return abi;
  }

  const wad =
    summaries.find((association) => {
      const name = association.canonicalName.toLowerCase();
      return name.includes('world association of detectives') || association.shortName.toLowerCase() === 'wad';
    }) ?? null;

  return wad ?? summaries[0] ?? null;
}

export default async function HomePage() {
  const [featuredEvents, allEvents] = await Promise.all([fetchFeaturedEvents(6), fetchAllEvents()]);
  const mainEvents = sortEventsByDate(allEvents.filter((event) => event.eventScope === 'main'));
  const coverage = getCoverageMetrics(mainEvents);
  const liveAssociationSummaries = getAssociationSummaries(mainEvents, Number.MAX_SAFE_INTEGER);
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const upcomingEvents = mainEvents.filter((event) => parseDate(event.date).getTime() >= today.getTime());

  const heroEvents = (featuredEvents.length > 0 ? featuredEvents : upcomingEvents).slice(0, 4);
  const featuredRail = (featuredEvents.length > 0 ? featuredEvents : upcomingEvents).slice(0, 3);
  const leadEvent = featuredRail[0] ?? upcomingEvents[0] ?? mainEvents[0] ?? null;
  const supportEvents = featuredRail.slice(1);
  const featuredAssociation = selectFeaturedAssociation(liveAssociationSummaries);
  const secondaryAssociations = liveAssociationSummaries
    .filter((association) => association.calendarAssociation !== featuredAssociation?.calendarAssociation)
    .slice(0, 6);
  const activeCountries = Array.from(new Set(mainEvents.map((event) => event.country))).sort();
  const visibleBodiesCount = getAssociationBrandingCount();

  const heroStats = [
    { label: 'Countries', value: coverage.totalCountries },
    { label: 'Live events', value: coverage.totalEvents },
    { label: 'Associations', value: liveAssociationSummaries.length }
  ];

  return (
    <>
      <HomepageHero events={heroEvents} stats={heroStats} />
      <WhyUseSection />
      <FounderQuoteSection />

      <section className="relative overflow-hidden py-14 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(234,244,255,0.84)_32%,rgba(255,255,255,0))]" />
        <div className="pointer-events-none absolute left-[8%] top-12 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(22,104,255,0.18),transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-[18%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16),transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute right-[6%] bottom-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(111,86,255,0.16),transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute left-[30%] bottom-[12%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.08),transparent_72%)] blur-3xl" />
        <div className="container-shell relative">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
            <div className="max-w-3xl">
              <p className="eyebrow">Featured Events</p>
              <h2 className="mt-3 max-w-[12ch] text-[2.25rem] font-semibold leading-[0.94] tracking-[-0.05em] text-slate-950 sm:mt-4 sm:text-5xl lg:text-[4.2rem]">
                Featured events worth planning around.
              </h2>
            </div>
            <Link href="/calendar" className="btn-secondary px-6 py-3">
              Browse all events
            </Link>
          </Reveal>

          {leadEvent ? (
            <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
              <Reveal x={-18}>
                <article className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(242,247,255,0.86))] p-4 shadow-[0_44px_120px_-64px_rgba(22,104,255,0.28)] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_62px_160px_-72px_rgba(76,90,255,0.36)] sm:rounded-[2.8rem] sm:p-7">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(25,112,255,0.18),transparent_26%),radial-gradient(circle_at_84%_14%,rgba(14,182,255,0.18),transparent_20%),radial-gradient(circle_at_72%_82%,rgba(111,86,255,0.14),transparent_24%),radial-gradient(circle_at_42%_86%,rgba(236,72,153,0.08),transparent_24%)]" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),rgba(255,255,255,0)_24%,rgba(255,255,255,0.16)_54%,rgba(255,255,255,0)_100%)] opacity-80" />
                  <div className="relative grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-8">
                    <div className="flex h-full flex-col justify-between">
                      <div>
                        <span className="inline-flex rounded-full border border-sky-200 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 shadow-[0_16px_40px_-30px_rgba(22,104,255,0.22)]">
                          Featured now
                        </span>
                        <h3 className="mt-5 max-w-[11ch] text-[2.25rem] font-semibold leading-[0.94] tracking-[-0.05em] text-slate-950 sm:mt-6 sm:text-5xl">
                          {leadEvent.title}
                        </h3>
                        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">{formatEventDate(leadEvent)}</p>
                        <p className="mt-2 text-base text-slate-600">
                          {leadEvent.city}, {leadEvent.country} / {leadEvent.association ?? leadEvent.organiser}
                        </p>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-5">
                          {leadEvent.description || 'A featured event from the global calendar.'}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
                        <Link href={`/events/${getEventSlug(leadEvent)}`} className="btn-primary px-6 py-3">
                          Open event
                        </Link>
                        <a href={leadEvent.website} target="_blank" rel="noreferrer" className="btn-secondary px-6 py-3">
                          Official website
                        </a>
                      </div>
                    </div>

                    <EventCoverMedia
                      title={leadEvent.title}
                      city={leadEvent.city}
                      country={leadEvent.country}
                      region={leadEvent.region}
                      category={leadEvent.category}
                      coverImage={leadEvent.coverImage}
                      coverImageAlt={leadEvent.coverImageAlt}
                      associationName={leadEvent.association ?? leadEvent.organiser}
                      featured
                      className="h-[15rem] sm:h-[27rem]"
                    />
                  </div>
                </article>
              </Reveal>

              <div className="hidden gap-6 sm:grid">
                {supportEvents.map((event, index) => (
                  <Reveal key={event.id} x={18} delay={0.05 + index * 0.05}>
                    <article className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-4 shadow-[0_34px_96px_-56px_rgba(15,23,42,0.18)] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_54px_126px_-62px_rgba(76,90,255,0.28)] sm:rounded-[2.4rem] sm:p-6">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(14,182,255,0.14),transparent_22%),radial-gradient(circle_at_16%_84%,rgba(111,86,255,0.1),transparent_22%),radial-gradient(circle_at_18%_18%,rgba(236,72,153,0.06),transparent_24%)]" />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.3),rgba(255,255,255,0)_32%,rgba(255,255,255,0.14)_56%,rgba(255,255,255,0)_100%)]" />
                      <div className="relative grid gap-4 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:items-center sm:gap-5">
                        <EventCoverMedia
                          title={event.title}
                          city={event.city}
                          country={event.country}
                          region={event.region}
                          category={event.category}
                          coverImage={event.coverImage}
                          coverImageAlt={event.coverImageAlt}
                          associationName={event.association ?? event.organiser}
                          featured
                          compact
                          className="h-[9.75rem] sm:h-[11.5rem]"
                        />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">{formatEventDate(event)}</p>
                          <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] text-slate-950">{event.title}</h3>
                          <p className="mt-3 text-sm text-slate-600">
                            {event.city}, {event.country} / {event.association ?? event.organiser}
                          </p>
                          <div className="mt-5 flex flex-wrap gap-3">
                            <Link href={`/events/${getEventSlug(event)}`} className="btn-secondary px-5 py-2.5">
                              View event
                            </Link>
                            <a href={event.website} target="_blank" rel="noreferrer" className="premium-link text-sm font-semibold text-blue-700 transition hover:text-slate-950">
                              Official site
                            </a>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>

              {supportEvents.length > 0 ? (
                <div className="grid gap-2 sm:hidden">
                  {supportEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${getEventSlug(event)}`}
                      className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                    >
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">{formatEventDate(event)}</span>
                      <span className="mt-1 block line-clamp-1 text-base font-semibold text-slate-950">{event.title}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <Reveal className="mt-12">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-600">No featured events are available yet.</div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden py-14 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(22,104,255,0.12),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(20,184,255,0.12),transparent_18%),linear-gradient(180deg,rgba(240,246,255,0.62),rgba(255,255,255,0.96))]" />
        <div className="pointer-events-none absolute left-[4%] top-[12%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(20,184,255,0.16),transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] bottom-[10%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(111,86,255,0.14),transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute left-[34%] top-[8%] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.08),transparent_72%)] blur-3xl" />
        <div className="container-shell relative">
          <Reveal className="grid gap-8 sm:gap-10 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] xl:items-end">
            <div className="max-w-xl">
              <p className="eyebrow">Associations</p>
              <h2 className="mt-3 max-w-[12ch] text-[2.15rem] font-semibold leading-[0.94] tracking-[-0.05em] text-slate-950 sm:mt-4 sm:text-5xl lg:text-[4rem]">
                Trusted by the associations behind the calendar.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:mt-6">
                Associations are clearly linked to the events they run, so you can see who is behind each date.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                Supported by the ABI, WAD, and IKD, representing investigator associations in 30+ countries.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {activeCountries.map((country) => (
                  <span
                    key={country}
                    className="rounded-full border border-white/90 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.12)]"
                  >
                    {country}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2.5 sm:mt-8 sm:gap-3">
                <div className="rounded-[1.7rem] border border-white/80 bg-white/88 px-5 py-5 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.16)] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_34px_72px_-40px_rgba(36,76,170,0.22)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Visible bodies</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{visibleBodiesCount}</p>
                </div>
                <div className="rounded-[1.7rem] border border-white/80 bg-white/88 px-5 py-5 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.16)] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_34px_72px_-40px_rgba(36,76,170,0.22)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Countries</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{coverage.totalCountries}</p>
                </div>
                <div className="rounded-[1.7rem] border border-white/80 bg-white/88 px-5 py-5 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.16)] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_34px_72px_-40px_rgba(36,76,170,0.22)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Regions</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                    {coverage.regions.filter((region) => region.eventCount > 0).length}
                  </p>
                </div>
              </div>

              <Link href="/associations" className="btn-primary mt-8 px-6 py-3">
                Browse associations
              </Link>

              {featuredAssociation ? (
                <div className="mt-4 rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4 sm:hidden">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">Featured network</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">{featuredAssociation.canonicalName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {featuredAssociation.canonicalName} - {formatCount('event', featuredAssociation.eventCount)} across {formatCount('country', featuredAssociation.countryCount)}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="relative hidden overflow-hidden rounded-[2.8rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,246,255,0.86))] p-6 shadow-[0_44px_120px_-66px_rgba(22,104,255,0.26)] sm:block sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(22,104,255,0.16),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(20,184,255,0.14),transparent_20%),radial-gradient(circle_at_72%_82%,rgba(111,86,255,0.12),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.06),transparent_22%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.4),rgba(255,255,255,0)_28%,rgba(255,255,255,0.16)_56%,rgba(255,255,255,0)_100%)]" />
              <div className="relative">
                <div className="grid gap-3 sm:grid-cols-3">
                  {secondaryAssociations.map((association) => (
                    <div
                      key={association.calendarAssociation}
                      className="rounded-[1.6rem] border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,250,255,0.9))] p-4 shadow-[0_18px_46px_-34px_rgba(15,23,42,0.14)] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_30px_70px_-38px_rgba(22,104,255,0.22)]"
                    >
                      <div className="flex h-16 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(145deg,#ffffff,#f5f9ff)] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                        {(() => {
                          const logoSrc = getAssociationBrandLogoSrc(association.name);
                          return logoSrc ? (
                            <img
                              src={logoSrc}
                              alt={association.name}
                              className="h-12 w-auto max-w-[8rem] object-contain"
                            />
                          ) : (
                            <span className="text-lg font-semibold text-slate-500">{association.shortName ?? association.name}</span>
                          );
                        })()}
                      </div>
                      <p className="mt-4 text-sm font-semibold leading-tight text-slate-950">{association.canonicalName}</p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {formatCount('event', association.eventCount)} across {formatCount('country', association.countryCount)}
                      </p>
                    </div>
                  ))}
                </div>

                {featuredAssociation ? (
                  <div className="mt-6 grid gap-6 rounded-[2rem] border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_26px_70px_-42px_rgba(15,23,42,0.16)] lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-center">
                    <div className="flex h-32 items-center justify-center rounded-[1.7rem] bg-[linear-gradient(145deg,#ffffff,#f5f9ff)] px-6 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.82)]">
                      {(() => {
                        const logoSrc = getAssociationBrandLogoSrc(featuredAssociation.name);
                        return logoSrc ? (
                          <img
                            src={logoSrc}
                            alt={featuredAssociation.name}
                            className="h-16 w-auto max-w-[12rem] object-contain"
                          />
                        ) : (
                          <span className="text-2xl font-semibold text-slate-800">{featuredAssociation.shortName}</span>
                        );
                      })()}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">Featured network</p>
                      <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950">{featuredAssociation.canonicalName}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {featuredAssociation.canonicalName} - {formatCount('event', featuredAssociation.eventCount)} across {formatCount('country', featuredAssociation.countryCount)}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href={`/calendar?association=${encodeURIComponent(featuredAssociation.calendarAssociation)}`}
                          className="btn-secondary px-5 py-2.5"
                        >
                          View linked events
                        </Link>
                        {featuredAssociation.website ? (
                          <a href={featuredAssociation.website} target="_blank" rel="noreferrer" className="premium-link text-sm font-semibold text-blue-700 transition hover:text-slate-950">
                            Association website
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="newsletter" className="relative overflow-hidden pb-16 pt-16 sm:pb-28 sm:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(22,104,255,0.12),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(111,86,255,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0),rgba(241,246,255,0.84)_40%,rgba(255,255,255,0.98))]" />
        <div className="pointer-events-none absolute left-[8%] top-8 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(14,182,255,0.16),transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute right-[10%] bottom-[12%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(111,86,255,0.14),transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute left-[38%] top-[16%] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.08),transparent_72%)] blur-3xl" />
        <div className="container-shell relative">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,246,255,0.9))] p-4 shadow-[0_56px_150px_-74px_rgba(76,90,255,0.32)] sm:rounded-[3rem] sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.34),rgba(255,255,255,0)_28%,rgba(255,255,255,0.14)_56%,rgba(255,255,255,0)_100%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(111,86,255,0.16),transparent_22%),radial-gradient(circle_at_56%_78%,rgba(236,72,153,0.08),transparent_24%)]" />
              <div className="grid gap-6 sm:gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
                <div className="max-w-xl">
                  <p className="eyebrow">Newsletter</p>
                  <h2 className="mt-3 max-w-[10ch] text-[2.15rem] font-semibold leading-[0.94] tracking-[-0.05em] text-slate-950 sm:mt-4 sm:text-5xl lg:text-[4rem]">
                    Get free monthly event alerts
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-600 sm:mt-5">
                    New events, important dates, and key conferences sent straight to your inbox. No spam. Unsubscribe any time.
                  </p>
                  <div className="mt-6 hidden flex-wrap gap-3 sm:mt-8 sm:flex">
                    <span className="rounded-full border border-white/85 bg-white/88 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-[0_18px_40px_-30px_rgba(36,76,170,0.16)]">
                      New events
                    </span>
                    <span className="rounded-full border border-white/85 bg-white/88 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-[0_18px_40px_-30px_rgba(36,76,170,0.16)]">
                      Upcoming dates
                    </span>
                    <span className="rounded-full border border-white/85 bg-white/88 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-[0_18px_40px_-30px_rgba(36,76,170,0.16)]">
                      Featured events
                    </span>
                  </div>
                </div>

                <NewsletterSignupForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
