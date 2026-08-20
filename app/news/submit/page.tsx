import Link from 'next/link';
import { submitStoryAction } from '@/app/news/submit/actions';
import { createSignedFormState } from '@/lib/security/server';
import { ARTICLE_CATEGORIES } from '@/lib/data/articles';

export const dynamic = 'force-dynamic';

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

const promises = [
  { title: 'Reviewed fast', desc: 'Stories are reviewed and published within 48 hours.' },
  { title: 'Your byline', desc: 'Published under your name and title, with a link the industry can share.' },
  { title: 'Real reach', desc: 'The Brief feeds the weekly newsletter and our social channels.' },
];

export default function SubmitStoryPage({ searchParams }: { searchParams?: { status?: string } }) {
  const isSuccess = searchParams?.status === 'success';
  const isError = searchParams?.status === 'error';
  const formState = createSignedFormState('submit-story');

  return (
    <section className="relative bg-slate-50">
      {/* Compact hero — flat, matching the submit-event page pattern */}
      <div className="bg-[linear-gradient(165deg,#eef2ff_0%,#f4f6ff_55%,#f8fafc_100%)] pb-5 pt-7 sm:pb-7 sm:pt-12">
        <div className="container-shell">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
              Write for The Brief
            </span>
            <h1 className="mt-3 text-[1.7rem] font-bold leading-[1] tracking-[-0.04em] text-slate-950 sm:text-[2.4rem]">
              Your story, in front of the{' '}
              <span className="bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-clip-text text-transparent">
                industry
              </span>.
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
              Association news, event recaps, firm milestones, opinion — reviewed before publication.
            </p>
          </div>
        </div>
      </div>

      <div className="container-shell pb-28 pt-5 sm:pb-16 sm:pt-6">
        <div className="mx-auto max-w-2xl">
          {/* What you get */}
          <div className="mb-5 grid gap-2 sm:grid-cols-3">
            {promises.map((p) => (
              <div key={p.title} className="rounded-xl border border-slate-200/60 bg-white px-4 py-3">
                <p className="text-[12px] font-bold text-slate-900">{p.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-8">
            {isSuccess ? (
              <div className="rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-inset ring-emerald-200">
                <p className="text-base font-bold text-emerald-800">Story received — thank you.</p>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-emerald-700">
                  We review every submission and most are live within 48 hours. We&apos;ll email you when it publishes.
                </p>
                <Link href="/news" className="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700">
                  Back to The Brief
                </Link>
              </div>
            ) : (
              <form action={submitStoryAction} className="space-y-4">
                <input type="hidden" name="issuedAt" value={formState.issuedAt} />
                <input type="hidden" name="formToken" value={formState.token} />
                {/* Honeypot */}
                <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                {isError ? (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200">
                    Something went wrong — check the fields and try again, or email info@investigatorevents.com.
                  </p>
                ) : null}

                <div>
                  <label htmlFor="title" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Headline</label>
                  <input id="title" name="title" required maxLength={140} placeholder="e.g. NCISS marks fifty years in Nashville" className={fieldClass} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="category" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Category</label>
                    <select id="category" name="category" required className={fieldClass} defaultValue="Industry news">
                      {ARTICLE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dek" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">One-line summary <span className="font-normal normal-case text-slate-400">(optional)</span></label>
                    <input id="dek" name="dek" maxLength={240} placeholder="The standfirst under your headline" className={fieldClass} />
                  </div>
                </div>

                <div>
                  <label htmlFor="body" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Your story</label>
                  <textarea
                    id="body"
                    name="body"
                    required
                    minLength={200}
                    maxLength={12000}
                    rows={12}
                    placeholder={'Write naturally — blank line between paragraphs.\n\nStart a line with "## " for a subheading, or "> " for a pull quote.'}
                    className={`${fieldClass} resize-y leading-relaxed`}
                  />
                  <p className="mt-1.5 text-[11px] text-slate-400">Minimum 200 characters. Blank line = new paragraph · &quot;## &quot; = subheading · &quot;&gt; &quot; = pull quote.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="authorName" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Your name</label>
                    <input id="authorName" name="authorName" required maxLength={120} placeholder="Byline as it should appear" className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="authorTitle" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Role / firm <span className="font-normal normal-case text-slate-400">(optional)</span></label>
                    <input id="authorTitle" name="authorTitle" maxLength={140} placeholder="e.g. Director, Smith Investigations" className={fieldClass} />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Email</label>
                  <input id="email" name="email" type="email" required maxLength={160} placeholder="So we can tell you when it's live" className={fieldClass} />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
                >
                  Submit for review →
                </button>
                <p className="text-center text-[11px] leading-relaxed text-slate-400">
                  Stories are reviewed before publication. By submitting you confirm the story is yours to share.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
