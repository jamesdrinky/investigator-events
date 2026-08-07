import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventCard } from '@/components/event-card';
import { fetchAllEvents } from '@/lib/data/events';
import { getMonthKey, parseDate } from '@/lib/utils/date';

// SEO month pages: "PI conferences September 2026" — generated straight from
// the calendar, catching organic searches nobody else serves. Mirrors the
// country pages' on-demand ISR pattern.
export const revalidate = 3600;
export const dynamicParams = true;

const BASE_URL = 'https://www.investigatorevents.com';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseMonthParam(param: string): { year: number; month: number; key: string; label: string } | null {
  if (!/^\d{4}-\d{2}$/.test(param)) return null;
  const year = parseInt(param.slice(0, 4), 10);
  const month = parseInt(param.slice(5, 7), 10);
  if (month < 1 || month > 12 || year < 2020 || year > 2100) return null;
  return { year, month, key: param, label: `${MONTHS[month - 1]} ${year}` };
}

function monthShift(key: string, delta: number): string {
  const year = parseInt(key.slice(0, 4), 10);
  const month = parseInt(key.slice(5, 7), 10) - 1 + delta;
  const d = new Date(Date.UTC(year, month, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function generateMetadata({ params }: { params: { month: string } }): Promise<Metadata> {
  const info = parseMonthParam(params.month);
  if (!info) return { title: 'Events by month | Investigator Events' };

  const events = (await fetchAllEvents()).filter((e) => e.eventScope === 'main' && getMonthKey(e.date) === info.key);
  const countries = [...new Set(events.map((e) => e.country).filter(Boolean))];
  const title = `Private Investigator Conferences & Events — ${info.label}`;
  const description =
    events.length > 0
      ? `${events.length} investigator ${events.length === 1 ? 'event' : 'events'} in ${info.label}${countries.length > 0 ? ` across ${countries.slice(0, 4).join(', ')}${countries.length > 4 ? ' and more' : ''}` : ''}. Dates, venues, attendees and reviews — the global calendar for the investigations profession.`
      : `Investigator conferences, AGMs and training events in ${info.label} on Investigator Events — the global calendar for the investigations profession.`;

  return {
    title: `${title} | Investigator Events`,
    description,
    alternates: { canonical: `${BASE_URL}/events/month/${info.key}` },
    openGraph: { title, description, siteName: 'Investigator Events' },
  };
}

export default async function MonthEventsPage({ params }: { params: { month: string } }) {
  const info = parseMonthParam(params.month);
  if (!info) notFound();

  const allEvents = await fetchAllEvents();
  const events = allEvents
    .filter((e) => e.eventScope === 'main' && getMonthKey(e.date) === info.key)
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

  // Only months that have (or had) events deserve a page — thin pages hurt SEO.
  if (events.length === 0) notFound();

  const countries = [...new Set(events.map((e) => e.country).filter(Boolean))];
  const prevKey = monthShift(info.key, -1);
  const nextKey = monthShift(info.key, 1);
  const monthKeysWithEvents = new Set(allEvents.filter((e) => e.eventScope === 'main').map((e) => getMonthKey(e.date)));

  // Months around now with events, for the browse strip.
  const nowKey = getMonthKey(new Date().toISOString().slice(0, 10));
  const otherMonths = [...monthKeysWithEvents]
    .filter((k) => k >= nowKey && k !== info.key)
    .sort()
    .slice(0, 8)
    .map((k) => parseMonthParam(k))
    .filter((m): m is NonNullable<ReturnType<typeof parseMonthParam>> => m !== null);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Investigator events in ${info.label}`,
    numberOfItems: events.length,
    itemListElement: events.map((e, i) => ({
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
        <span className="text-slate-700">{info.label}</span>
      </nav>

      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Investigator Events Calendar</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          PI Conferences &amp; Events — {info.label}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          {events.length} investigator {events.length === 1 ? 'event' : 'events'} in {info.label}
          {countries.length > 0 && <> across {countries.slice(0, 5).join(', ')}{countries.length > 5 ? ' and more' : ''}</>}.
          Dates, venues, who&apos;s attending, and reviews from fellow investigators.
        </p>
        <div className="mt-4 flex gap-2 text-xs font-semibold">
          {monthKeysWithEvents.has(prevKey) && (
            <Link href={`/events/month/${prevKey}` as Route} className="rounded-full border border-slate-200 px-4 py-1.5 text-slate-600 transition hover:bg-slate-50">
              ← {parseMonthParam(prevKey)?.label}
            </Link>
          )}
          {monthKeysWithEvents.has(nextKey) && (
            <Link href={`/events/month/${nextKey}` as Route} className="rounded-full border border-slate-200 px-4 py-1.5 text-slate-600 transition hover:bg-slate-50">
              {parseMonthParam(nextKey)?.label} →
            </Link>
          )}
        </div>
      </header>

      <section className="mb-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      <section className="mb-14 rounded-2xl bg-slate-900 px-6 py-8 text-center sm:px-10">
        <h2 className="text-xl font-bold text-white">Put the whole calendar in your calendar</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          One click subscribes you to every PI event worldwide — new events appear in your own calendar
          automatically, forever.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent('webcal://www.investigatorevents.com/api/ics')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Add to Google Calendar
          </a>
          <a
            href="webcal://www.investigatorevents.com/api/ics"
            className="rounded-full border border-slate-600 px-6 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Apple / Outlook
          </a>
        </div>
      </section>

      {otherMonths.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Browse by month</h2>
          <div className="flex flex-wrap gap-2">
            {otherMonths.map((m) => (
              <Link
                key={m.key}
                href={`/events/month/${m.key}` as Route}
                className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {m.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
