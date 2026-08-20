import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import {
  categoryStyle,
  fetchPublishedArticles,
  formatArticleDate,
  readMinutes,
  type Article,
} from '@/lib/data/articles';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'The Brief — Industry News',
  description:
    'What’s happening in the professional investigations industry — news, association updates, event coverage, and the PI magazine shelf.',
};

function PlayBadge() {
  return (
    <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 backdrop-blur-md ring-1 ring-white/20">
      <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-white" aria-hidden>
        <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l11-6.86a1.03 1.03 0 0 0 0-1.76l-11-6.86A1.03 1.03 0 0 0 8 5.14z" />
      </svg>
    </span>
  );
}

function FeaturedCard({ article }: { article: Article }) {
  const style = categoryStyle(article.category);
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group relative block overflow-hidden rounded-3xl bg-slate-950 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      {article.heroImageUrl ? (
        <Image
          src={article.heroImageUrl}
          alt=""
          fill
          className="object-cover opacity-60 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-70"
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/10" />
      <div aria-hidden className={`absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r ${style.bar}`} />
      <div className="relative z-10 flex min-h-[22rem] flex-col justify-end p-6 sm:min-h-[26rem] sm:p-9">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur-md">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Featured · {article.category}
        </span>
        <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight tracking-[-0.03em] text-white sm:text-4xl">
          {article.title}
        </h2>
        {article.dek ? <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-[15px]">{article.dek}</p> : null}
        <p className="mt-4 text-xs font-semibold text-slate-400">
          {article.authorName ?? 'Investigator Events'} · {formatArticleDate(article.publishedAt)} · {readMinutes(article.body)} min read
        </p>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const style = categoryStyle(article.category);
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {article.heroImageUrl ? (
          <>
            <Image
              src={article.heroImageUrl}
              alt=""
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/50 to-transparent" />
          </>
        ) : (
          <div className={`flex h-full items-center justify-center bg-gradient-to-br ${style.bar} opacity-90`}>
            <Image src="/logo/ielogo1.PNG" alt="" width={64} height={64} className="h-16 w-16 rounded-2xl shadow-lg" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ring-inset ${style.chip}`}>
            {article.category}
          </span>
        </div>
        {article.videoEventSlug ? <PlayBadge /> : null}
      </div>
      <div className="relative flex flex-1 flex-col p-5">
        <div aria-hidden className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${style.bar} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
        <h3 className="text-[17px] font-bold leading-snug tracking-[-0.02em] text-slate-950 group-hover:text-blue-700">
          {article.title}
        </h3>
        {article.dek ? <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{article.dek}</p> : null}
        <div className="mt-auto flex items-center gap-2.5 pt-4">
          {article.authorAvatarUrl ? (
            <Image src={article.authorAvatarUrl} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <span aria-hidden className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${style.bar} text-[11px] font-extrabold text-white`}>
              {(article.authorName ?? 'IE').slice(0, 1)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-800">{article.authorName ?? 'Investigator Events'}</p>
            <p className="truncate text-[11px] text-slate-400">
              {formatArticleDate(article.publishedAt)} · {readMinutes(article.body)} min
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function NewsPage() {
  const articles = await fetchPublishedArticles();
  const featured = articles.find((a) => a.featured) ?? articles[0] ?? null;
  const rest = articles.filter((a) => a.id !== featured?.id);
  const magazine = articles.filter((a) => a.category === 'Magazine');
  const contributors = new Set(articles.map((a) => a.authorName).filter(Boolean)).size;

  return (
    <div className="relative">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-30">
          <Image src="/conference/conference6.avif" alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 left-1/4 h-64 w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.30),transparent_70%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 right-1/4 h-64 w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.20),transparent_70%)] blur-3xl" />

        <div className="container-shell relative z-10 pb-12 pt-28 sm:pb-16">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md sm:tracking-[0.28em]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.25)] animate-pulse" />
              The Brief
            </span>
            <h1 className="mt-4 max-w-3xl text-[2.2rem] font-bold leading-[0.95] tracking-[-0.05em] text-white sm:text-[3.2rem] lg:text-[4rem]">
              The pulse of the{' '}
              <span
                className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
                style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
              >
                investigations
              </span>{' '}
              industry.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              News, association updates, event coverage, and the magazine shelf — written by the community that lives it.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/news/submit"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-blue-50"
              >
                Write for The Brief →
              </Link>
              <Link
                href="/weekly"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/[0.12]"
              >
                Get the weekly briefing
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-400">
              <span><span className="text-white">{articles.length}</span> stories</span>
              <span><span className="text-white">{contributors}</span> contributor{contributors === 1 ? '' : 's'}</span>
              <span>New every <span className="text-white">Monday</span> — with the briefing</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Featured + latest ── */}
      <section className="border-b border-slate-200/60 bg-slate-50">
        <div className="container-shell py-12 sm:py-16">
          {featured ? (
            <Reveal>
              <FeaturedCard article={featured} />
            </Reveal>
          ) : null}

          {rest.length > 0 ? (
            <Reveal delay={0.05}>
              <div className="mt-10 flex items-end justify-between gap-4">
                <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-950 sm:text-2xl">Latest</h2>
                <p className="text-xs font-medium text-slate-400">{articles.length} stories</p>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </Reveal>
          ) : null}

          {articles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-sm font-semibold text-slate-600">First stories landing shortly.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Magazine shelf ── */}
      <section className="border-b border-slate-200/60 bg-white">
        <div className="container-shell py-12 sm:py-16">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-600 sm:text-xs">The shelf</p>
            <h2 className="mt-3 text-xl font-bold tracking-[-0.02em] text-slate-950 sm:text-2xl">Magazine &amp; long reads</h2>
            {magazine.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {magazine.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-8 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-900 p-8 ring-1 ring-inset ring-white/5 sm:flex-row sm:p-10">
                {/* Stylised magazine cover placeholder — swapped for the real cover when issues land */}
                <div className="relative h-52 w-40 shrink-0 -rotate-3 transition-transform duration-500 hover:rotate-0">
                  <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 rounded-r-xl rounded-l-sm bg-slate-700/40 blur-sm" />
                  <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-r-xl rounded-l-sm bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 p-4 shadow-2xl">
                    <div aria-hidden className="absolute left-0 top-0 h-full w-1.5 bg-black/25" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/80">The PI Magazine</p>
                    <div>
                      <p className="text-xl font-extrabold leading-tight text-white">Coming to the shelf</p>
                      <p className="mt-1 text-[10px] font-semibold text-white/70">Long reads · Interviews · Casework</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="max-w-xl text-[15px] leading-relaxed text-slate-300">
                    The PI magazine and selected long-form pieces are coming to the shelf — a permanent home for the industry&apos;s
                    deeper reads, right beside the news.
                  </p>
                  <Link href="/news/submit" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-xs font-bold text-white ring-1 ring-inset ring-white/15 backdrop-blur-md transition hover:bg-white/20">
                    Pitch a long read →
                  </Link>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── Contribute band ── */}
      <section className="bg-white">
        <div className="container-shell py-14 sm:py-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-center sm:px-12 sm:py-14">
              <div aria-hidden className="pointer-events-none absolute -top-16 left-1/3 h-56 w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.25),transparent_70%)] blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-16 right-1/4 h-56 w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_70%)] blur-3xl" />
              <div className="relative z-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-400 sm:text-xs">Your story here</p>
                <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
                  Seen something the industry should know?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                  Association news, a conference recap, a milestone in your firm — write it up and we&apos;ll put it in front of the community.
                </p>
                <Link
                  href="/news/submit"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-blue-50"
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
