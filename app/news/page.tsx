import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { fetchPublishedArticles, formatArticleDate, type Article } from '@/lib/data/articles';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'The Brief — Industry News',
  description:
    'What’s happening in the professional investigations industry — news, association updates, event coverage, and the PI magazine shelf.',
};

function CategoryChip({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-blue-700 ring-1 ring-inset ring-blue-100">
      {category}
    </span>
  );
}

function AuthorLine({ article }: { article: Article }) {
  return (
    <div className="flex items-center gap-2.5">
      {article.authorAvatarUrl ? (
        <Image src={article.authorAvatarUrl} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-800">{article.authorName ?? 'Investigator Events'}</p>
        <p className="truncate text-[11px] text-slate-400">{formatArticleDate(article.publishedAt)}</p>
      </div>
    </div>
  );
}

function FeaturedCard({ article }: { article: Article }) {
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
          {article.authorName ?? 'Investigator Events'} · {formatArticleDate(article.publishedAt)}
        </p>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {article.heroImageUrl ? (
          <Image
            src={article.heroImageUrl}
            alt=""
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50">
            <Image src="/logo/ielogo1.PNG" alt="" width={56} height={56} className="h-14 w-14 rounded-2xl opacity-40" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <CategoryChip category={article.category} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[17px] font-bold leading-snug tracking-[-0.02em] text-slate-950 group-hover:text-blue-700">
          {article.title}
        </h3>
        {article.dek ? <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{article.dek}</p> : null}
        <div className="mt-auto pt-4">
          <AuthorLine article={article} />
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-500 sm:text-xs">The shelf</p>
            <h2 className="mt-3 text-xl font-bold tracking-[-0.02em] text-slate-950 sm:text-2xl">Magazine &amp; long reads</h2>
            {magazine.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {magazine.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 p-8 ring-1 ring-inset ring-slate-200/60 sm:p-10">
                <p className="max-w-xl text-[15px] leading-relaxed text-slate-600">
                  The PI magazine and selected long-form pieces are coming to the shelf. Publish with us —{' '}
                  <Link href="/news/submit" className="font-semibold text-blue-600 hover:underline">pitch a story</Link>.
                </p>
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
