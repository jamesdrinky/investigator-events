import type { EventItem } from '@/lib/data/events';

function toUtcDateStamp(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function toAllDayStamp(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function getEventLocation(event: EventItem) {
  return `${event.city}, ${event.country}`;
}

export function getGoogleCalendarUrl(event: EventItem) {
  const start = toAllDayStamp(new Date(`${event.date}T00:00:00Z`));
  const inclusiveEnd = event.endDate ?? event.date;
  const end = toAllDayStamp(addDays(inclusiveEnd, 1));
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description || `Official event page: ${event.website}`,
    location: getEventLocation(event),
    ctz: 'UTC'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getIcsHref(event: EventItem) {
  const startDate = new Date(`${event.date}T00:00:00Z`);
  const endDateExclusive = addDays(event.endDate ?? event.date, 1);
  const created = toUtcDateStamp(new Date());
  const uid = `${event.id}@investigatorevents.com`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Investigator Events//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${created}`,
    `DTSTART;VALUE=DATE:${toAllDayStamp(startDate)}`,
    `DTEND;VALUE=DATE:${toAllDayStamp(endDateExclusive)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description || `Official event page: ${event.website}`)}`,
    `LOCATION:${escapeIcs(getEventLocation(event))}`,
    `URL:${event.website}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}
