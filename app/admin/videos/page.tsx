import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, Film, Clock } from 'lucide-react';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { fetchPendingVideos } from '@/lib/data/association-videos';
import { approveVideoAction, rejectVideoAction } from './actions';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Video verification · Admin' };

export default async function AdminVideosPage() {
  if (!(await hasValidAdminSessionCookie())) {
    redirect('/admin?error=auth');
  }

  const pending = await fetchPendingVideos();

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to admin
        </Link>

        <div className="mt-5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Video verification</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Clock className="h-3.5 w-3.5" /> {pending.length} pending
          </span>
        </div>
        <p className="mt-1.5 text-sm text-slate-500">
          Nothing appears publicly until you approve it here.
        </p>

        {pending.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            <p className="mt-3 text-sm font-semibold text-slate-700">All caught up</p>
            <p className="mt-1 text-xs text-slate-500">No videos waiting for review.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {pending.map((v) => (
              <div key={v.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <video
                  src={v.videoUrl}
                  poster={v.thumbnailUrl ?? undefined}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full bg-black object-contain"
                />
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{v.title}</h2>
                    {v.isPaid && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                        Paid
                      </span>
                    )}
                  </div>
                  {v.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{v.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Film className="h-3.5 w-3.5" /> {v.associationName ?? v.associationSlug ?? '—'}
                    </span>
                    <span>{v.submitterName}</span>
                    <span>{v.submitterEmail}</span>
                    {v.durationSeconds != null && <span>{v.durationSeconds}s</span>}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <form action={approveVideoAction}>
                      <input type="hidden" name="videoId" value={v.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </button>
                    </form>

                    <form action={rejectVideoAction} className="flex items-center gap-2">
                      <input type="hidden" name="videoId" value={v.id} />
                      <input
                        type="text"
                        name="reason"
                        placeholder="Reason (optional)"
                        className="w-40 rounded-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 sm:w-48"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
