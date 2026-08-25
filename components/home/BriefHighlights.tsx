'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export type BriefArticle = {
  slug: string;
  title: string;
  dek: string | null;
  category: string | null;
  publishedAt: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
}

/**
 * The Brief on the homepage. The hub was reachable only from the nav, so real
 * editorial sat invisible to anyone landing on the front page — and articles
 * are the one acquisition channel that compounds rather than depending on a
 * feed algorithm.
 *
 * Fetched client-side on purpose. The homepage is ISR (revalidate = 60) and
 * Vercel's build-time Supabase fetches come back empty, which cached an empty
 * block that never recovered — the same failure the news hub hit in 78f488d.
 * Forcing the whole landing page dynamic to fix one section would put a
 * database round-trip on every visit; loading just this block after hydration
 * keeps the page cached. Articles are publicly readable, so the anon client is
 * all it needs.
 */
export function BriefHighlights() {
  const [articles, setArticles] = useState<BriefArticle[]>([]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();
    // `articles` postdates the generated database types, so this is cast the
    // same way the rest of the codebase reaches it.
    (supabase
      .from('articles' as never)
      .select('slug, title, dek, category, published_at')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(3) as any)
      .then(({ data, error }: { data: unknown; error: unknown }) => {
        if (cancelled || error || !data) return;
        setArticles(
          (data as any[]).map((a) => ({
            slug: a.slug,
            title: a.title,
            dek: a.dek ?? null,
            category: a.category ?? null,
            publishedAt: a.published_at ?? null,
          }))
        );
      });
    return () => { cancelled = true; };
  }, []);

  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;

  return (
    <section className="container-shell py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">The Brief</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Industry news for investigators
          </h2>
        </div>
        <Link
          href="/news"
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Read The Brief &rarr;
        </Link>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Link
          href={`/news/${lead.slug}`}
          className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md lg:col-span-2"
        >
          {lead.category && (
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
              {lead.category}
            </span>
          )}
          <h3 className="mt-2 text-xl font-bold leading-snug text-slate-950 transition group-hover:text-blue-700 sm:text-2xl">
            {lead.title}
          </h3>
          {lead.dek && <p className="mt-3 text-sm leading-relaxed text-slate-600">{lead.dek}</p>}
          {formatDate(lead.publishedAt) && (
            <span className="mt-4 text-xs text-slate-400">{formatDate(lead.publishedAt)}</span>
          )}
        </Link>

        <div className="flex flex-col gap-5">
          {rest.slice(0, 2).map((article) => (
            <Link
              key={article.slug}
              href={`/news/${article.slug}`}
              className="group flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              {article.category && (
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  {article.category}
                </span>
              )}
              <h3 className="mt-1.5 text-base font-bold leading-snug text-slate-950 transition group-hover:text-blue-700">
                {article.title}
              </h3>
              {formatDate(article.publishedAt) && (
                <span className="mt-auto pt-3 text-xs text-slate-400">{formatDate(article.publishedAt)}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
