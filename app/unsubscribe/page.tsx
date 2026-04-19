import Link from 'next/link';

export default function UnsubscribePage({ searchParams }: { searchParams?: { success?: string } }) {
  const success = searchParams?.success === 'true';

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-lg">
          {success ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 className="mt-5 text-xl font-bold text-slate-900">Unsubscribed</h1>
              <p className="mt-2 text-sm text-slate-500">
                You've been removed from the weekly briefing. You won't receive any more emails from us.
              </p>
              <p className="mt-4 text-sm text-slate-400">
                Changed your mind? Subscribe again on the <Link href="/weekly" className="text-blue-600 hover:underline">weekly page</Link>.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-slate-900">Unsubscribe</h1>
              <p className="mt-2 text-sm text-slate-500">
                Use the link in your email to unsubscribe from the weekly briefing.
              </p>
            </>
          )}
          <Link href="/" className="mt-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-700">
            Back to Investigator Events
          </Link>
        </div>
      </div>
    </main>
  );
}
