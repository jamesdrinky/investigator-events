import { NextRequest, NextResponse } from 'next/server';
import { fetchAllEvents } from '@/lib/data/events';
import { parseDate } from '@/lib/utils/date';
import { countrySlug } from '@/lib/utils/country-pages';
import { buildIcsFeed } from '@/lib/utils/ics';

// Subscribable calendar feed. Anyone can add it to Google/Apple/Outlook and
// every PI event (optionally filtered by country or association) stays in
// their own calendar forever, refreshed automatically:
//   /api/ics                          → all upcoming events
//   /api/ics?country=united-kingdom   → one country
//   /api/ics?association=wad          → one association/organiser
//   /api/ics?event=wad-conference-2026 → a single event, for "add to calendar"
export const revalidate = 1800;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country')?.trim().toLowerCase() || null;
  const association = searchParams.get('association')?.trim().toLowerCase() || null;
  // A single event is served from here rather than a data: URL, because iOS
  // Safari supports neither `download` nor data: downloads reliably — tapping
  // "add to calendar" on an iPhone did nothing. A real text/calendar response
  // opens straight in Apple Calendar (and Outlook).
  const eventSlug = searchParams.get('event')?.trim().toLowerCase() || null;

  // Include events from the last 30 days so subscribers' calendars don't
  // abruptly lose entries the day after an event ends.
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const allEvents = await fetchAllEvents();

  // A named event is returned whatever its scope or date — someone asking for
  // this one event should get it, not be filtered out for being a side listing.
  if (eventSlug) {
    const single = allEvents.filter((e) => (e.slug ?? '').toLowerCase() === eventSlug);
    if (single.length === 0) {
      return new NextResponse('Event not found', { status: 404 });
    }
    return new NextResponse(
      buildIcsFeed(single, {
        name: single[0].title,
        description: single[0].website
          ? `${single[0].title} — ${single[0].website}`
          : `${single[0].title} — investigatorevents.com`,
      }),
      {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `inline; filename="${eventSlug}.ics"`,
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    );
  }

  const events = allEvents
    .filter((e) => e.eventScope === 'main' && parseDate(e.endDate ?? e.date).getTime() >= cutoff)
    .filter((e) => !country || countrySlug(e.country ?? '') === country)
    .filter(
      (e) =>
        !association ||
        (e.association ?? '').toLowerCase().includes(association) ||
        (e.organiser ?? '').toLowerCase().includes(association)
    )
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

  const filterLabel = association
    ? ` — ${association.toUpperCase()}`
    : country
      ? ` — ${country
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')}`
      : '';

  const ics = buildIcsFeed(events, {
    name: `Investigator Events${filterLabel}`,
    description: 'The global calendar of conferences and events for the private investigations profession. investigatorevents.com',
  });

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="investigator-events.ics"',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
