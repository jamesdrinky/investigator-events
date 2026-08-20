import { unstable_cache } from 'next/cache';
import { createSupabasePublicServerClient } from '@/lib/supabase/public';

export const ARTICLE_CATEGORIES = [
  'Industry news',
  'From the associations',
  'Event coverage',
  'Magazine',
  'Community',
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

/** Per-category accent so the hub reads as a colour-coded magazine, not a grid of grey. */
export const CATEGORY_STYLE: Record<string, { chip: string; bar: string; ink: string }> = {
  'Industry news': { chip: 'bg-blue-50 text-blue-700 ring-blue-200/70', bar: 'from-blue-600 to-cyan-400', ink: 'text-blue-600' },
  'From the associations': { chip: 'bg-violet-50 text-violet-700 ring-violet-200/70', bar: 'from-violet-600 to-purple-400', ink: 'text-violet-600' },
  'Event coverage': { chip: 'bg-cyan-50 text-cyan-700 ring-cyan-200/70', bar: 'from-cyan-600 to-teal-400', ink: 'text-cyan-600' },
  Magazine: { chip: 'bg-amber-50 text-amber-700 ring-amber-200/70', bar: 'from-amber-500 to-orange-400', ink: 'text-amber-600' },
  Community: { chip: 'bg-pink-50 text-pink-700 ring-pink-200/70', bar: 'from-fuchsia-600 to-pink-400', ink: 'text-pink-600' },
};

export function categoryStyle(category: string) {
  return CATEGORY_STYLE[category] ?? CATEGORY_STYLE['Industry news'];
}

/** Rounded-up minutes at ~220 wpm — floor of 1 so nothing says "0 min". */
export function readMinutes(body: string): number {
  return Math.max(1, Math.round(body.split(/\s+/).length / 220));
}

export type Article = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  body: string;
  category: string;
  heroImageUrl: string | null;
  authorName: string | null;
  authorTitle: string | null;
  authorAvatarUrl: string | null;
  source: 'editorial' | 'newsletter' | 'member';
  featured: boolean;
  publishedAt: string | null;
  videoEventSlug: string | null;
};

function mapRow(row: Record<string, unknown>): Article {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    dek: (row.dek as string | null) ?? null,
    body: String(row.body),
    category: String(row.category ?? 'Industry news'),
    heroImageUrl: (row.hero_image_url as string | null) ?? null,
    authorName: (row.author_name as string | null) ?? null,
    authorTitle: (row.author_title as string | null) ?? null,
    authorAvatarUrl: (row.author_avatar_url as string | null) ?? null,
    source: (row.source as Article['source']) ?? 'editorial',
    featured: Boolean(row.featured),
    publishedAt: (row.published_at as string | null) ?? null,
    videoEventSlug: (row.video_event_slug as string | null) ?? null,
  };
}

async function fetchPublishedArticlesUncached(): Promise<Article[]> {
  const supabase = createSupabasePublicServerClient();
  const { data, error } = await (supabase
    .from('articles' as never)
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false }) as unknown as Promise<{ data: Record<string, unknown>[] | null; error: unknown }>);
  if (error || !data) return [];
  return data.map(mapRow);
}

export const fetchPublishedArticles = unstable_cache(fetchPublishedArticlesUncached, ['published-articles'], {
  revalidate: 120,
  tags: ['articles'],
});

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createSupabasePublicServerClient();
  const { data, error } = await (supabase
    .from('articles' as never)
    .select('*')
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle() as unknown as Promise<{ data: Record<string, unknown> | null; error: unknown }>);
  if (error || !data) return null;
  return mapRow(data);
}

export function formatArticleDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Minimal article body renderer input. Bodies are plain text with two
 * affordances per line-block: "## " starts a subheading, "> " starts a pull
 * quote. Everything is escaped; no HTML passes through.
 */
export type ArticleBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'quote'; text: string };

export function parseArticleBody(body: string): ArticleBlock[] {
  return body
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      if (chunk.startsWith('## ')) return { kind: 'heading' as const, text: chunk.slice(3).trim() };
      if (chunk.startsWith('> ')) return { kind: 'quote' as const, text: chunk.slice(2).trim() };
      return { kind: 'paragraph' as const, text: chunk };
    });
}
