import type { EventItem } from '@/lib/data/events';

export function slugifyEventTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function getEventSlug(event: Pick<EventItem, 'title'> & { slug?: string }): string {
  return event.slug ?? slugifyEventTitle(event.title);
}
