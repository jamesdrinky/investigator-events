// Shared iCalendar (RFC 5545) helpers: single-event exports live in
// calendar-links.ts; this module builds full subscribable feeds — the
// "add our whole calendar to yours" surface served by /api/ics.
import type { EventItem } from '@/lib/data/events';
import { getEventLocation } from '@/lib/utils/calendar-links';

const SITE = 'https://www.investigatorevents.com';

function toAllDayStamp(dateString: string): string {
  return dateString.slice(0, 10).replace(/-/g, '');
}

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/** RFC 5545 line folding: lines longer than 75 octets continue on the next
 *  line prefixed with a space. We fold at 74 chars to stay safely under the
 *  octet limit for typical content. */
function foldLine(line: string): string {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 74));
  rest = rest.slice(74);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 73)}`);
    rest = rest.slice(73);
  }
  return parts.join('\r\n');
}

function eventToVevent(event: EventItem, dtstamp: string): string[] {
  const pageUrl = `${SITE}/events/${event.slug}?utm_source=ics&utm_medium=calendar`;
  const description = [
    event.description?.trim(),
    event.organiser ? `Organiser: ${event.organiser}` : null,
    `Event page: ${pageUrl}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return [
    'BEGIN:VEVENT',
    `UID:${event.id}@investigatorevents.com`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${toAllDayStamp(event.date)}`,
    `DTEND;VALUE=DATE:${toAllDayStamp(addDays(event.endDate ?? event.date, 1))}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(getEventLocation(event))}`,
    `URL:${pageUrl}`,
    ...(event.category ? [`CATEGORIES:${escapeIcs(event.category)}`] : []),
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
  ];
}

export interface FeedOptions {
  /** Shown as the calendar name in Google/Apple/Outlook. */
  name: string;
  description?: string;
}

/** Build a complete subscribable VCALENDAR from a list of events. */
export function buildIcsFeed(events: EventItem[], options: FeedOptions): string {
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Investigator Events//Calendar Feed//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(options.name)}`,
    ...(options.description ? [`X-WR-CALDESC:${escapeIcs(options.description)}`] : []),
    // Hint clients to refresh twice a day so new events appear promptly.
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
    ...events.flatMap((event) => eventToVevent(event, dtstamp)),
    'END:VCALENDAR',
  ];

  return lines.map(foldLine).join('\r\n') + '\r\n';
}
