import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Newspaper, Star } from 'lucide-react';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { formatArticleDate } from '@/lib/data/articles';
import { approveArticleAction, rejectArticleAction, toggleFeaturedAction } from './actions';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'The Brief · Admin' };

type Row = {
  id: string;
  title: string;
  dek: string | null;
  body: string;
  category: string;
  author_name: string | null;
  author_title: string | null;
  submitter_email: string | null;
  source: string;
  status: string;
  featured: boolean;
  slug: string;
  published_at: string | null;
  created_at: string;
};

export default async function AdminNewsPage() {
  if (!(await hasValidAdminSessionCookie())) {
    redirect('/admin?error=auth');
  }

  const admin = createSupabaseAdminServerClient();
  const { data } = await (admin
    .from('articles' as never)
    .select('*')
    .order('created_at', { ascending: false }) as any);
  const rows = (data ?? []) as Row[];
  const pending = rows.filter((r) => r.status === 'pending');
  const published = rows.filter((r) => r.status === 'published');

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to admin
        </Link>

        <div className="mt-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">The Brief</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Clock className="h-3.5 w-3.5" /> {pending.length} pending
          </span>
        </div>
        <p className="mt-1.5 text-sm text-slate-500">Member stories publish only after approval here.</p>

        {/* Pending queue */}
        {pending.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            <p className="mt-3 text-sm font-semibold text-slate-700">No stories waiting for review</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {pending.map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-600">{r.category}</p>
                    <h2 className="mt-1 text-base font-bold text-slate-900">{r.title}</h2>
                    {r.dek ? <p className="mt-1 text-sm text-slate-500">{r.dek}</p> : null}
                    <p className="mt-2 text-xs text-slate-400">
                      {r.author_name}{r.author_title ? ` — ${r.author_title}` : ''} · {r.submitter_email}
                    </p>
                  </div>
                  <Newspaper className="h-5 w-5 shrink-0 text-slate-300" />
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-800">Read full story</summary>
                  <div className="mt-2 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    {r.body}
                  </div>
                </details>
                <div className="mt-4 flex gap-2">
                  <form action={approveArticleAction}>
                    <input type="hidden" name="articleId" value={r.id} />
                    <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve &amp; publish
                    </button>
                  </form>
                  <form action={rejectArticleAction}>
                    <input type="hidden" name="articleId" value={r.id} />
                    <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-300">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Published */}
        <h2 className="mt-10 text-lg font-bold text-slate-900">Published ({published.length})</h2>
        <div className="mt-3 space-y-2">
          {published.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="min-w-0">
                <a href={`/news/${r.slug}`} target="_blank" rel="noreferrer" className="truncate text-sm font-semibold text-slate-900 hover:text-blue-700">
                  {r.title}
                </a>
                <p className="text-[11px] text-slate-400">
                  {r.category} · {r.author_name ?? '—'} · {formatArticleDate(r.published_at)}
                </p>
              </div>
              <form action={toggleFeaturedAction}>
                <input type="hidden" name="articleId" value={r.id} />
                <input type="hidden" name="featured" value={r.featured ? 'false' : 'true'} />
                <button
                  type="submit"
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition ${
                    r.featured ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <Star className={`h-3 w-3 ${r.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                  {r.featured ? 'Featured' : 'Feature'}
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
