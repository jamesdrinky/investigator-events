import type { EventItem } from '@/lib/data/events';

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
});

const fullDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
});

export function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function getMonthKey(date: string): string {
  return date.slice(0, 7);
}

export function formatMonthLabel(monthKey: string): string {
  const date = parseDate(`${monthKey}-01`);
  return monthFormatter.format(date);
}

export function formatEventDate(event: EventItem): string {
  const start = fullDateFormatter.format(parseDate(event.date));

  if (!event.endDate) {
    return start;
  }

  const end = fullDateFormatter.format(parseDate(event.endDate));
  return `${start} - ${end}`;
}

export function getEventDurationDays(event: Pick<EventItem, 'date' | 'endDate'>): number {
  if (!event.endDate) {
    return 1;
  }

  const diff = parseDate(event.endDate).getTime() - parseDate(event.date).getTime();
  return Math.max(1, Math.round(diff / (24 * 60 * 60 * 1000)) + 1);
}

export function sortEventsByDate(items: EventItem[]): EventItem[] {
  return [...items].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
}
