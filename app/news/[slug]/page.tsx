import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/motion/reveal';
import { ArticleShare } from '@/components/news/ArticleShare';
import { fetchArticleBySlug, fetchPublishedArticles, formatArticleDate, parseArticleBody } from '@/lib/data/articles';

export const revalidate = 120;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await fetchArticleBySlug(params.slug);
  if (!article) return { title: 'Story not found' };
  return {
    title: article.title,
    description: article.dek ?? undefined,
    openGraph: {
      title: article.title,
      description: article.dek ?? undefined,
      images: article.heroImageUrl ? [{ url: article.heroImageUrl }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await fetchArticleBySlug(params.slug);
  if (!article) notFound();

  const blocks = parseArticleBody(article.body);
  const related = (await fetchPublishedArticles()).filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="relative">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-950">
        {article.heroImageUrl ? (
          <div className="absolute inset-0 opacity-40">
            <Image src={article.heroImageUrl} alt="" fill className="object-cover" sizes="100vw" priority />
          </div>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950" />
        <div className="container-shell relative z-10 pb-12 pt-28 sm:pb-16">
          <Reveal>
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 transition hover:text-white"
            >
              ← The Brief
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85 backdrop-blur-md">
                {article.category}
              </span>
            </div>
            <h1 className="mt-4 max-w-3xl text-[1.9rem] font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-[2.8rem]">
              {article.title}
            </h1>
            {article.dek ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{article.dek}</p>
            ) : null}
            <div className="mt-6 flex items-center gap-3">
              {article.authorAvatarUrl ? (
                <Image src={article.authorAvatarUrl} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10" />
              ) : null}
              <div>
                <p className="text-sm font-bold text-white">{article.authorName ?? 'Investigator Events'}</p>
                <p className="text-xs text-slate-400">
                  {article.authorTitle ? `${article.authorTitle} · ` : ''}
                  {formatArticleDate(article.publishedAt)}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="bg-white">
        <div className="container-shell py-12 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <Reveal>
              <div className="space-y-6">
                {blocks.map((block, i) => {
                  if (block.kind === 'heading') {
                    return (
                      <h2 key={i} className="pt-2 text-xl font-bold tracking-[-0.02em] text-slate-950 sm:text-2xl">
                        {block.text}
                      </h2>
                    );
                  }
                  if (block.kind === 'quote') {
                    return (
                      <blockquote key={i} className="border-l-[3px] border-blue-500 bg-slate-50 py-4 pl-5 pr-4 text-[17px] font-medium leading-relaxed text-slate-800 rounded-r-xl">
                        {block.text}
                      </blockquote>
                    );
                  }
                  return (
                    <p key={i} className="text-[16px] leading-[1.85] text-slate-700">
                      {block.text}
                    </p>
                  );
                })}
              </div>

              <div className="mt-10 border-t border-slate-200 pt-8">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Pass it on</p>
                <ArticleShare title={article.title} slug={article.slug} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Related ── */}
      {related.length > 0 ? (
        <section className="border-t border-slate-200/60 bg-slate-50">
          <div className="container-shell py-12 sm:py-16">
            <Reveal>
              <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-950 sm:text-xl">More from The Brief</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {related.map((a) => (
                  <Link
                    key={a.id}
                    href={`/news/${a.slug}`}
                    className="group rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-600">{a.category}</p>
                    <h3 className="mt-2 text-[15px] font-bold leading-snug text-slate-950 group-hover:text-blue-700">{a.title}</h3>
                    <p className="mt-2 text-[11px] text-slate-400">{formatArticleDate(a.publishedAt)}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ── Contribute ── */}
      <section className="bg-white">
        <div className="container-shell py-12 sm:py-14">
          <Reveal>
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 p-7 text-center ring-1 ring-inset ring-slate-200/60 sm:p-9">
              <p className="text-[15px] font-semibold text-slate-800">Got a story of your own?</p>
              <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-slate-500">
                Association news, event recaps, milestones — the community reads this page.
              </p>
              <Link
                href="/news/submit"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Write for The Brief →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
