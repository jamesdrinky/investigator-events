import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventCard } from '@/components/event-card';
import { fetchAllEvents } from '@/lib/data/events';
import { groupEventsByCountry } from '@/lib/utils/country-pages';
import { getCountryFlag } from '@/lib/utils/location';

// On-demand ISR: rendered at request time (the build-time events fetch is
// empty in production), then cached for an hour.
export const revalidate = 3600;
export const dynamicParams = true;

const BASE_URL = 'https://www.investigatorevents.com';

async function resolveCountry(slug: string) {
  const events = await fetchAllEvents();
  const groups = groupEventsByCountry(events);
  return { group: groups.find((g) => g.slug === slug) ?? null, groups };
}

export async function generateMetadata({ params }: { params: { country: string } }): Promise<Metadata> {
  const { group } = await resolveCountry(params.country);
  if (!group) return { title: 'Events by country | Investigator Events' };

  const year = new Date().getFullYear();
  const total = group.upcoming.length + group.past.length;
  const title = `Private Investigator Conferences & Events in ${group.country} ${year}`;
  const description = `${group.upcoming.length} upcoming investigator ${
    group.upcoming.length === 1 ? 'event' : 'events'
  } in ${group.country} (${total} tracked). Dates, venues, attendees and reviews for PI conferences, AGMs and networking events — on Investigator Events, the global calendar for the investigations profession.`;

  return {
    title: `${title} | Investigator Events`,
    description,
    alternates: { canonical: `${BASE_URL}/events/country/${group.slug}` },
    openGraph: { title, description, siteName: 'Investigator Events' },
  };
}

export default async function CountryEventsPage({ params }: { params: { country: string } }) {
  const { group, groups } = await resolveCountry(params.country);
  if (!group) notFound();

  const flag = getCountryFlag(group.country);
  const year = new Date().getFullYear();
  const cities = [...new Set(group.upcoming.map((e) => e.city).filter(Boolean))].slice(0, 6);
  const otherCountries = groups.filter((g) => g.slug !== group.slug).slice(0, 24);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Investigator events in ${group.country}`,
    numberOfItems: group.upcoming.length,
    itemListElement: group.upcoming.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE_URL}/events/${e.slug}`,
      name: e.title,
    })),
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 text-xs font-medium text-slate-500">
        <Link href="/" className="hover:text-slate-700">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/calendar" className="hover:text-slate-700">
          Events
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700">{group.country}</span>
      </nav>

      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          Investigator Events Calendar
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {flag && <span className="mr-2">{flag}</span>}
          PI Conferences &amp; Events in {group.country} {year}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          {group.upcoming.length > 0 ? (
            <>
              {group.upcoming.length} upcoming investigator{' '}
              {group.upcoming.length === 1 ? 'event' : 'events'} in {group.country}
              {cities.length > 0 && <> — including {cities.join(', ')}</>}. Dates, venues, who&apos;s
              attending, and reviews from fellow investigators.
            </>
          ) : (
            <>
              No upcoming events listed in {group.country} right now — know of one?{' '}
              <Link href="/submit-event" className="font-semibold text-blue-600 hover:underline">
                Submit it free
              </Link>{' '}
              and we&apos;ll feature it.
            </>
          )}
        </p>
      </header>

      {group.upcoming.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Upcoming events</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {group.upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {group.past.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Past events in {group.country}</h2>
          <div className="grid gap-6 opacity-80 sm:grid-cols-2 lg:grid-cols-3">
            {group.past.slice(0, 6).map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      <section className="mb-14 rounded-2xl bg-slate-900 px-6 py-8 text-center sm:px-10">
        <h2 className="text-xl font-bold text-white">Never miss an event in {group.country}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          Join Investigator Events free — RSVP to events, see who else is going, and get the weekly
          events newsletter read by investigators in 18+ countries.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Create your free profile
          </Link>
          <Link
            href="/calendar"
            className="rounded-full border border-white/25 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Browse all events
          </Link>
        </div>
      </section>

      {otherCountries.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
            Browse events by country
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCountries.map((g) => (
              <Link
                key={g.slug}
                href={`/events/country/${g.slug}`}
                className="rounded-full border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                {getCountryFlag(g.country)} {g.country}
                {g.upcoming.length > 0 && (
                  <span className="ml-1 text-xs text-slate-400">({g.upcoming.length})</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
