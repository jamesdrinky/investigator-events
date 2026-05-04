import type { EventItem } from '@/lib/data/events';
import { parseDate } from '@/lib/utils/date';

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function createdAtTime(event: EventItem): number {
  return event.createdAt ? new Date(event.createdAt).getTime() : 0;
}

export function getWeeklyCollections(events: EventItem[], now = new Date()) {
  const start = startOfDay(now);
  const past7 = start.getTime() - 7 * 24 * 60 * 60 * 1000;
  const next30 = start.getTime() + 30 * 24 * 60 * 60 * 1000;

  const newlyAdded = [...events]
    .filter((event) => createdAtTime(event) >= past7)
    .sort((a, b) => createdAtTime(b) - createdAtTime(a))
    .slice(0, 6);

  const upcoming = [...events]
    .filter((event) => {
      const time = parseDate(event.date).getTime();
      return time >= start.getTime() && time <= next30;
    })
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
    .slice(0, 8);

  const featured = [...events]
    .filter((event) => event.featured && parseDate(event.date).getTime() >= start.getTime())
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
    .slice(0, 4);

  // Events that ended in the last 14 days — prompt reviews (exclude online/webinar events)
  const past14 = start.getTime() - 14 * 24 * 60 * 60 * 1000;
  const recentlyPast = [...events]
    .filter((event) => {
      const endTime = parseDate(event.endDate ?? event.date).getTime();
      const isOnline = event.city?.toLowerCase() === 'online' || event.category?.toLowerCase().includes('webinar') || event.category?.toLowerCase().includes('seminar');
      const isMain = event.eventScope === 'main';
      return endTime < start.getTime() && endTime >= past14 && !isOnline && isMain;
    })
    .sort((a, b) => parseDate(b.endDate ?? b.date).getTime() - parseDate(a.endDate ?? a.date).getTime())
    .slice(0, 3);

  return {
    newlyAdded,
    upcoming,
    featured,
    recentlyPast,
    hasFreshActivity: newlyAdded.length > 0 || upcoming.length > 0
  };
}
