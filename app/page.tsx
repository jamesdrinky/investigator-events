import Image from 'next/image';
import Link from 'next/link';
import { EventCard } from '@/components/event-card';
import { EventCoverMedia } from '@/components/event-cover-media';
import { HeroSearchDemoPanel } from '@/components/hero-search-demo-panel';
import { Reveal } from '@/components/motion/reveal';
import { SectionStage } from '@/components/motion/section-stage';
import { NewsletterSignupForm } from '@/components/newsletter-signup-form';
import { SaveDateLinks } from '@/components/save-date-links';
import { fetchAllEvents, fetchFeaturedEvents } from '@/lib/data/events';
import { getHomepageAssociationNetwork } from '@/lib/utils/associations';
import { getCoverageMetrics } from '@/lib/utils/coverage';
import { formatEventDate, formatMonthLabel, getMonthKey, parseDate, sortEventsByDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

export const dynamic = 'force-dynamic';

const exampleQueries = [
  'investigator events in munich germany',
  'fraud conference london',
  'private investigator training usa',
  'association meeting paris'
];

export default async function HomePage() {
  const [featuredEvents, allEvents] = await Promise.all([fetchFeaturedEvents(6), fetchAllEvents()]);
  const mainEvents = sortEventsByDate(allEvents.filter((event) => event.eventScope === 'main'));
  const coverage = getCoverageMetrics(mainEvents);
  const network = getHomepageAssociationNetwork(mainEvents, 18);
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const upcomingEvents = mainEvents.filter((event) => parseDate(event.date).getTime() >= today.getTime());

  const leadDiscovery = upcomingEvents[0] ?? mainEvents[0] ?? null;
  const supportingDiscovery = upcomingEvents.slice(1, 5);
  const featuredLead = featuredEvents[0] ?? mainEvents[1] ?? null;
  const featuredSecond = featuredEvents[1] ?? mainEvents[2] ?? null;
  const associationWall = network.slice(0, 15);
  const heroDemoEvents = (featuredEvents.length > 0 ? featuredEvents : upcomingEvents).slice(0, 4);
  const heroDemos = heroDemoEvents.map((event, index) => ({
    query: exampleQueries[index] ?? `investigator events in ${event.city.toLowerCase()} ${event.country.toLowerCase()}`,
    event
  }));
  const monthOptions = Array.from(new Set(mainEvents.map((event) => formatMonthLabel(getMonthKey(event.date)))));
  const regionOptions = Array.from(new Set(mainEvents.map((event) => event.region))).sort((a, b) => a.localeCompare(b));
  const associationOptions = Array.from(new Set(mainEvents.map((event) => event.association ?? event.organiser))).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <>
      <section className="section-open relative overflow-hidden pb-16 pt-8 sm:pb-20 sm:pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_16%,rgba(22,104,255,0.12),transparent_22%),radial-gradient(circle_at_88%_14%,rgba(20,184,255,0.1),transparent_18%),radial-gradient(circle_at_74%_72%,rgba(100,91,255,0.08),transparent_18%)]" />
        <SectionStage className="container-shell" x={-18}>
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <Reveal x={-24}>
              <div className="max-w-2xl">
                <p className="eyebrow">Global Investigator Events</p>
                <h1 className="mt-5 font-[var(--font-serif)] text-5xl leading-[0.9] text-slate-950 sm:text-6xl lg:text-[5.4rem]">
                  Every Investigator Event.
                  <span className="mt-2 block bg-[linear-gradient(90deg,#1668ff,#0fb5ff,#645bff)] bg-clip-text text-transparent">
                    One Global Calendar.
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Browse conferences, training, association meetings, and major industry dates in one live international discovery platform.
                </p>

                <form action="/calendar" className="mt-7 grid gap-3 rounded-[2rem] border border-white/80 bg-white/90 p-4 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.18)] sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className="sr-only">Search the calendar</span>
                    <input
                      name="search"
                      placeholder="Search events, cities, associations, countries"
                      className="field-input mt-0 h-12 rounded-full px-5"
                    />
                  </label>
                  <label>
                    <span className="sr-only">Filter by month</span>
                    <select name="month" defaultValue="" className="field-input mt-0 h-12 rounded-full px-5">
                      <option value="">Any month</option>
                      {monthOptions.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Filter by region</span>
                    <select name="region" defaultValue="" className="field-input mt-0 h-12 rounded-full px-5">
                      <option value="">Any region</option>
                      {regionOptions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="sm:col-span-2">
                    <span className="sr-only">Filter by association</span>
                    <select name="association" defaultValue="" className="field-input mt-0 h-12 rounded-full px-5">
                      <option value="">Any association</option>
                      {associationOptions.map((association) => (
                        <option key={association} value={association}>
                          {association}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row">
                    <button type="submit" className="btn-primary min-h-[3rem] flex-1">
                      Search events
                    </button>
                    <Link href="/submit-event" className="btn-secondary min-h-[3rem] flex-1">
                      List an event for free
                    </Link>
                  </div>
                </form>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Live events', value: coverage.totalEvents },
                    { label: 'Countries', value: coverage.totalCountries },
                    { label: 'Regions', value: coverage.regions.filter((region) => region.eventCount > 0).length },
                    { label: 'Associations', value: network.length }
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.4rem] border border-white/80 bg-white/82 px-4 py-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.16)]">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                      <p className="mt-2 font-[var(--font-serif)] text-3xl leading-none text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal x={24} delay={0.05}>
              <HeroSearchDemoPanel demos={heroDemos} />
            </Reveal>
          </div>
        </SectionStage>
      </section>

      <section className="section-open relative overflow-hidden py-16 sm:py-20">
        <div className="container-shell">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="eyebrow">Live Event Discovery</p>
              <h2 className="section-title">See what is on now, not a stack of filler.</h2>
              <p className="section-copy">
                The homepage leads with live event surfaces: one major event up front, strong supporting cards, and clear host identity on every listing.
              </p>
            </div>
            <Link href="/calendar" className="btn-secondary px-5 py-2.5">
              Open full calendar
            </Link>
          </Reveal>

          {leadDiscovery ? (
            <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
              <Reveal x={-18}>
                <article className="group relative overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_46%,#effcff_100%)] p-5 shadow-[0_40px_110px_-56px_rgba(22,104,255,0.24)] sm:p-6">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(22,104,255,0.12),transparent_24%),radial-gradient(circle_at_82%_20%,rgba(20,184,255,0.1),transparent_20%),radial-gradient(circle_at_82%_82%,rgba(100,91,255,0.08),transparent_18%)]" />
                  <div className="relative grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[linear-gradient(135deg,#1668ff,#14b8ff)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                          Global spotlight
                        </span>
                        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                          {leadDiscovery.category}
                        </span>
                      </div>
                      <h3 className="mt-4 font-[var(--font-serif)] text-4xl leading-[0.92] text-slate-950 sm:text-[3.8rem]">
                        {leadDiscovery.title}
                      </h3>
                      <p className="mt-4 text-sm font-medium uppercase tracking-[0.16em] text-blue-700">
                        {formatEventDate(leadDiscovery)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {leadDiscovery.city}, {leadDiscovery.country} · {leadDiscovery.region}
                      </p>
                      <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                        {leadDiscovery.description || 'Open the event page for the official website, organiser details, city context, and save links.'}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link href={`/events/${getEventSlug(leadDiscovery)}`} className="btn-primary px-5 py-2.5">
                          View event
                        </Link>
                        <SaveDateLinks event={leadDiscovery} />
                      </div>
                    </div>

                    <EventCoverMedia
                      title={leadDiscovery.title}
                      city={leadDiscovery.city}
                      country={leadDiscovery.country}
                      region={leadDiscovery.region}
                      category={leadDiscovery.category}
                      coverImage={leadDiscovery.coverImage}
                      coverImageAlt={leadDiscovery.coverImageAlt}
                      associationName={leadDiscovery.association ?? leadDiscovery.organiser}
                      featured={leadDiscovery.featured}
                      className="h-[19rem] lg:h-[24rem]"
                    />
                  </div>
                </article>
              </Reveal>

              <div className="grid gap-4">
                {supportingDiscovery.map((event, index) => (
                  <Reveal key={event.id} delay={index * 0.05} x={18}>
                    <EventCard event={event} />
                  </Reveal>
                ))}
              </div>
            </div>
          ) : (
            <Reveal>
              <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 text-sm text-slate-600">
                No live events are available yet.
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="section-open relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(238,246,255,0.7),rgba(255,255,255,0.5))]" />
        <div className="container-shell relative">
          <Reveal className="mb-8 max-w-3xl">
            <p className="eyebrow">Featured / Major Events</p>
            <h2 className="section-title">Editorial placement for the events people travel for.</h2>
            <p className="section-copy">
              Major events get larger visual surfaces, stronger color, and faster paths to the official event page.
            </p>
          </Reveal>

          <div className="grid gap-5 xl:grid-cols-2">
            {[featuredLead, featuredSecond].filter(Boolean).map((event, index) => {
              const item = event!;

              return (
                <Reveal key={item.id} delay={index * 0.05} x={index === 0 ? -16 : 16}>
                  <article className="group relative overflow-hidden rounded-[2.3rem] border border-white/80 bg-white p-5 shadow-[0_34px_90px_-52px_rgba(22,104,255,0.24)] sm:p-6">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(22,104,255,0.1),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(100,91,255,0.1),transparent_18%)]" />
                    <div className="relative grid gap-5">
                      <EventCoverMedia
                        title={item.title}
                        city={item.city}
                        country={item.country}
                        region={item.region}
                        category={item.category}
                        coverImage={item.coverImage}
                        coverImageAlt={item.coverImageAlt}
                        associationName={item.association ?? item.organiser}
                        featured
                        className="h-[18rem]"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700">
                          Featured event
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                          {item.category}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-[var(--font-serif)] text-4xl leading-[0.94] text-slate-950">{item.title}</h3>
                        <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-blue-700">{formatEventDate(item)}</p>
                        <p className="mt-2 text-sm text-slate-600">
                          {item.city}, {item.country} · {item.region}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/events/${getEventSlug(item)}`} className="btn-primary px-5 py-2.5">
                          Open event
                        </Link>
                        <a href={item.website} target="_blank" rel="noreferrer" className="btn-secondary px-5 py-2.5">
                          Official website
                        </a>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-open relative overflow-hidden py-16 sm:py-20">
        <div className="container-shell">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="eyebrow">Associations Network</p>
              <h2 className="section-title">A real international network, visible at a glance.</h2>
              <p className="section-copy">
                Associations are not buried in text. Their logos, countries, and linked event counts are part of the browsing experience.
              </p>
            </div>
            <Link href="/associations" className="btn-secondary px-5 py-2.5">
              Browse all associations
            </Link>
          </Reveal>

          <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
            <Reveal x={-18}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {associationWall.map((association, index) => (
                  <Link
                    key={association.calendarAssociation}
                    href={`/calendar?association=${encodeURIComponent(association.calendarAssociation)}`}
                    className="group relative overflow-hidden rounded-[1.8rem] border border-white/80 bg-white p-4 shadow-[0_22px_52px_-38px_rgba(15,23,42,0.16)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_34px_74px_-40px_rgba(22,104,255,0.18)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(22,104,255,0.08),transparent_22%),radial-gradient(circle_at_80%_82%,rgba(20,184,255,0.06),transparent_18%)] opacity-70" />
                    <div className="relative">
                      <div className="flex h-20 items-center justify-center rounded-[1.2rem] border border-slate-100 bg-slate-50 px-4">
                        {association.logoSrc ? (
                          <Image
                            src={association.logoSrc}
                            alt={`${association.canonicalName} logo`}
                            width={180}
                            height={80}
                            className="h-full w-full object-contain"
                            priority={index < 6}
                          />
                        ) : (
                          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">{association.shortName}</span>
                        )}
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-950">{association.canonicalName}</p>
                      <p className="mt-1 text-sm text-slate-500">{association.countries[0] ?? association.region}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="city-chip">{association.eventCount} events</span>
                        <span className="global-chip">{association.region}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>

            <Reveal x={18} delay={0.04}>
              <div className="rounded-[2.3rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_48%,#f4f9ff_100%)] p-6 shadow-[0_34px_86px_-50px_rgba(22,104,255,0.2)] sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">Featured association</p>
                {network[0] ? (
                  <>
                    <div className="mt-5 flex h-28 items-center justify-center rounded-[1.5rem] border border-white/90 bg-white px-6 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.16)]">
                      {network[0].logoSrc ? (
                        <Image
                          src={network[0].logoSrc}
                          alt={`${network[0].canonicalName} logo`}
                          width={240}
                          height={92}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-lg font-semibold uppercase tracking-[0.24em] text-slate-700">{network[0].shortName}</span>
                      )}
                    </div>
                    <h3 className="mt-5 font-[var(--font-serif)] text-4xl leading-[0.94] text-slate-950">{network[0].canonicalName}</h3>
                    <p className="mt-3 text-sm text-slate-600">
                      {network[0].countryCount} countries represented across linked event activity. Open the calendar to see every connected listing.
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.4rem] border border-white/90 bg-white/90 p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Linked events</p>
                        <p className="mt-2 font-[var(--font-serif)] text-3xl text-slate-950">{network[0].eventCount}</p>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/90 bg-white/90 p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Countries</p>
                        <p className="mt-2 font-[var(--font-serif)] text-3xl text-slate-950">{network[0].countryCount}</p>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/90 bg-white/90 p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Primary region</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{network[0].region}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/calendar?association=${encodeURIComponent(network[0].calendarAssociation)}`}
                        className="btn-primary px-5 py-2.5"
                      >
                        View linked events
                      </Link>
                      {network[0].website ? (
                        <a href={network[0].website} target="_blank" rel="noreferrer" className="btn-secondary px-5 py-2.5">
                          Visit association site
                        </a>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-slate-600">Association profiles will appear here as linked events are added.</p>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="newsletter" className="section-open relative overflow-hidden py-16 sm:py-20">
        <div className="container-shell">
          <Reveal>
            <div className="rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_46%,#f4fbff_100%)] p-6 shadow-[0_34px_90px_-52px_rgba(22,104,255,0.18)] sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div>
                  <p className="eyebrow">Newsletter</p>
                  <h2 className="section-title">One useful email each week.</h2>
                  <p className="section-copy">
                    Get newly added events, approaching deadlines, and one standout investigator event worth opening.
                  </p>
                </div>
                <NewsletterSignupForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-open relative overflow-hidden pb-20 pt-6 sm:pb-24">
        <div className="container-shell">
          <Reveal>
            <div className="rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#09111f_0%,#10264a_56%,#13305d_100%)] p-6 text-white shadow-[0_38px_100px_-58px_rgba(8,17,32,0.6)] sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">Submit / Promote</p>
                  <h2 className="mt-4 font-[var(--font-serif)] text-4xl leading-[0.94] text-white sm:text-5xl">
                    Listing is free. Promotion comes later.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    Submit conferences, training, and association meetings for review. Most listings are reviewed within 48 hours, and promoted visibility is available for major placements.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link href="/submit-event" className="btn-primary px-6 py-3">
                    Submit an event
                  </Link>
                  <Link href="/advertise" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/14">
                    Promote a major event
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
