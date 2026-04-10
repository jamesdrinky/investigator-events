import { fetchAllEvents } from '@/lib/data/events';
import { sortEventsByDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';

export const dynamic = 'force-dynamic';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://investigatorevents.com';

  const allEvents = await fetchAllEvents();
  const mainEvents = allEvents.filter((event) => event.eventScope === 'main');
  const sortedEvents = sortEventsByDate(mainEvents);

  const items = sortedEvents
    .map((event) => {
      const slug = getEventSlug(event);
      const link = `${siteUrl}/events/${slug}`;
      const pubDate = new Date(event.date).toUTCString();

      const descriptionParts: string[] = [];
      if (event.city && event.country) {
        descriptionParts.push(`${event.city}, ${event.country}`);
      }
      if (event.organiser) {
        descriptionParts.push(`Organised by ${event.organiser}`);
      }
      if (event.description) {
        descriptionParts.push(event.description);
      }
      const description = descriptionParts.join(' — ');

      return `    <item>
      <title>${escapeXml(event.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>${event.category ? `\n      <category>${escapeXml(event.category)}</category>` : ''}
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Investigator Events</title>
    <description>Confirmed private investigator conferences, AGMs, training events, and association meetings worldwide.</description>
    <link>${escapeXml(siteUrl)}</link>
    <atom:link href="${escapeXml(siteUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
