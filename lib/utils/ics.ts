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

function eventToVevent(event: EventItem, dtstamp: string, subscribable: boolean): string[] {
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
    // Feed entries are free/transparent — a subscribed industry calendar must
    // not make someone look busy for every event in the profession. An event
    // the user deliberately added is the opposite: they mean to be there.
    subscribable ? 'TRANSP:TRANSPARENT' : 'TRANSP:OPAQUE',
    'END:VEVENT',
  ];
}

export interface FeedOptions {
  /** Shown as the calendar name in Google/Apple/Outlook. */
  name: string;
  description?: string;
  /**
   * True (the default) for the subscribable feeds — the calendar the user
   * keeps in their app forever.
   *
   * MUST be false for a one-off "add to calendar" download. Apple Calendar
   * decides what a .ics *is* from its headers: with X-WR-CALNAME and the
   * refresh hints present it treats the file as a calendar to subscribe to,
   * so tapping add silently creates a NEW calendar named after the event and
   * files the event in there. The confirmation looks identical to a normal
   * add, and the event never appears in the user's own calendar.
   */
  subscribable?: boolean;
}

/** Build a complete subscribable VCALENDAR from a list of events. */
export function buildIcsFeed(events: EventItem[], options: FeedOptions): string {
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const subscribable = options.subscribable ?? true;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Investigator Events//Calendar Feed//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    // Calendar-level identity and refresh hints belong to a subscription.
    // On a single-event download they are what makes Apple Calendar spawn a
    // new calendar instead of adding the event — see FeedOptions.subscribable.
    ...(subscribable
      ? [
          `X-WR-CALNAME:${escapeIcs(options.name)}`,
          ...(options.description ? [`X-WR-CALDESC:${escapeIcs(options.description)}`] : []),
          'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
          'X-PUBLISHED-TTL:PT12H',
        ]
      : []),
    ...events.flatMap((event) => eventToVevent(event, dtstamp, subscribable)),
    'END:VCALENDAR',
  ];

  return lines.map(foldLine).join('\r\n') + '\r\n';
}
