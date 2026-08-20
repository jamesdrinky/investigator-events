import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/motion/reveal';
import { ArticleShare } from '@/components/news/ArticleShare';
import { EventVideo } from '@/components/EventVideo';
import { fetchApprovedVideosForEvent } from '@/lib/data/association-videos';
import {
  categoryStyle,
  fetchArticleBySlug,
  fetchPublishedArticles,
  formatArticleDate,
  parseArticleBody,
  readMinutes,
} from '@/lib/data/articles';

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
  const style = categoryStyle(article.category);
  const [related, videos] = await Promise.all([
    fetchPublishedArticles().then((all) => all.filter((a) => a.slug !== article.slug).slice(0, 3)),
    article.videoEventSlug ? fetchApprovedVideosForEvent(article.videoEventSlug) : Promise.resolve([]),
  ]);
  const video = videos[0] ?? null;
  let firstParagraphSeen = false;

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
        <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.25),transparent_70%)] blur-3xl" />
        <div className="container-shell relative z-10 pb-12 pt-28 sm:pb-16">
          <Reveal>
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 transition hover:text-white"
            >
              ← The Brief
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85 backdrop-blur-md">
                <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-r ${style.bar}`} />
                {article.category}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">{readMinutes(article.body)} min read</span>
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
              ) : (
                <span aria-hidden className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${style.bar} text-sm font-extrabold text-white`}>
                  {(article.authorName ?? 'IE').slice(0, 1)}
                </span>
              )}
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
              {video ? (
                <div className="mb-10">
                  <EventVideo
                    id={video.id}
                    videoUrl={video.videoUrl}
                    label={video.title}
                    className="overflow-hidden rounded-2xl shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/70"
                  />
                </div>
              ) : null}

              <div className="space-y-6">
                {blocks.map((block, i) => {
                  if (block.kind === 'heading') {
                    return (
                      <div key={i} className="pt-2">
                        <div aria-hidden className={`mb-3 h-1 w-10 rounded-full bg-gradient-to-r ${style.bar}`} />
                        <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-950 sm:text-2xl">{block.text}</h2>
                      </div>
                    );
                  }
                  if (block.kind === 'quote') {
                    return (
                      <blockquote key={i} className="relative rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 px-7 py-6 ring-1 ring-inset ring-slate-200/60">
                        <span aria-hidden className={`absolute -top-3 left-5 bg-gradient-to-br ${style.bar} bg-clip-text font-serif text-5xl leading-none text-transparent`}>&ldquo;</span>
                        <p className="text-[17px] font-semibold leading-relaxed text-slate-800">{block.text}</p>
                      </blockquote>
                    );
                  }
                  const isFirst = !firstParagraphSeen;
                  if (isFirst) firstParagraphSeen = true;
                  return (
                    <p
                      key={i}
                      className={`text-[16px] leading-[1.85] text-slate-700 ${
                        isFirst
                          ? 'first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-[3.4rem] first-letter:font-extrabold first-letter:leading-[0.8] first-letter:text-slate-950'
                          : ''
                      }`}
                    >
                      {block.text}
                    </p>
                  );
                })}
              </div>

              <div aria-hidden className={`mt-10 h-1 w-16 rounded-full bg-gradient-to-r ${style.bar}`} />
              <div className="mt-6 border-t border-slate-200 pt-8">
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
                {related.map((a) => {
                  const s = categoryStyle(a.category);
                  return (
                    <Link
                      key={a.id}
                      href={`/news/${a.slug}`}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div aria-hidden className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.bar}`} />
                      <p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.1em] ${s.ink}`}>{a.category}</p>
                      <h3 className="mt-2 text-[15px] font-bold leading-snug text-slate-950 group-hover:text-blue-700">{a.title}</h3>
                      <p className="mt-2 text-[11px] text-slate-400">{formatArticleDate(a.publishedAt)} · {readMinutes(a.body)} min</p>
                    </Link>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ── Contribute ── */}
      <section className="bg-white">
        <div className="container-shell py-12 sm:py-14">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-7 text-center sm:p-9">
              <div aria-hidden className="pointer-events-none absolute -top-12 left-1/3 h-40 w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.28),transparent_70%)] blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-12 right-1/4 h-40 w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.2),transparent_70%)] blur-3xl" />
              <div className="relative z-10">
                <p className="text-[15px] font-bold text-white">Got a story of your own?</p>
                <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-slate-400">
                  Association news, event recaps, milestones — the community reads this page.
                </p>
                <Link
                  href="/news/submit"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-blue-50"
                >
                  Write for The Brief →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
