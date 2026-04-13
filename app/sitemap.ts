import type { MetadataRoute } from 'next';
import { fetchAllEvents } from '@/lib/data/events';

const BASE_URL = 'https://www.investigatorevents.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await fetchAllEvents();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/calendar`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/associations`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/people`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/directory`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/weekly`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/advice`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/submit-event`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/clash-checker`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/jobs`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/resources`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/why-join-an-association`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/signin`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/signup`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const eventPages: MetadataRoute.Sitemap = events
    .filter((e) => e.eventScope === 'main')
    .map((e) => ({
      url: `${BASE_URL}/events/${e.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  return [...staticPages, ...eventPages];
}
