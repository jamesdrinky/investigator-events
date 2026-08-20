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
