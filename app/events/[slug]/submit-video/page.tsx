import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { fetchEventBySlug } from '@/lib/data/events';
import { SubmitVideoForm } from '@/components/associations/SubmitVideoForm';
import { submitEventVideoAction } from './actions';
import { isFeatureEnabled, VIDEO_SUBMISSIONS_FLAG } from '@/lib/data/feature-flags';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: 'Submit a video',
    description: `Submit a short video to feature on this event page on Investigator Events.`,
  };
}

export default async function SubmitEventVideoPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { status?: string; reason?: string };
}) {
  const event = await fetchEventBySlug(params.slug);
  if (!event) notFound();

  // If public submissions are locked, show a contact state.
  const submissionsEnabled = await isFeatureEnabled(VIDEO_SUBMISSIONS_FLAG);
  if (!submissionsEnabled) {
    const contactHref = `mailto:info@investigatorevents.com?subject=${encodeURIComponent(`Feature a video — ${event.title}`)}`;
    return (
      <main className="min-h-screen bg-slate-50/80">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          <Link href={`/events/${event.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> Back to {event.title}
          </Link>
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Video submissions are by invitation</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              We're not taking open video submissions right now. If you'd like a video featuring this event, get in touch and we'll set it up.
            </p>
            <a href={contactHref} className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
              <Mail className="h-4 w-4" /> Contact us about a video
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Require sign-in.
  const supabase = await createSupabaseSSRServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/signin?next=/events/${params.slug}/submit-video`);
  }

  const status = searchParams.status;

  return (
    <main className="min-h-screen bg-slate-50/80">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <Link href={`/events/${event.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to {event.title}
        </Link>

        <div className="mt-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Submit a video</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Share a video (up to 500 MB) to feature on the{' '}
            <strong className="text-slate-800">{event.title}</strong> event page. It's free — our team
            reviews every submission before it goes live.
          </p>
        </div>

        {status === 'success' ? (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h2 className="mt-3 text-lg font-bold text-slate-900">Video received</h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Thanks! Your video is now in our verification queue. We'll email you once it's
              approved and live on the event page.
            </p>
            <Link href={`/events/${event.slug}`} className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
              Back to event
            </Link>
          </div>
        ) : (
          <>
            {status === 'error' && (
              <p className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {searchParams.reason === 'length'
                  ? 'That video is longer than 3 minutes.'
                  : searchParams.reason === 'duration'
                    ? "We couldn't read your video's length. Please re-export it (MP4 works best) and try again."
                    : searchParams.reason === 'title'
                      ? 'Please add a title.'
                      : searchParams.reason === 'video'
                        ? 'Please upload your video before submitting.'
                        : 'Something went wrong. Please try again.'}
              </p>
            )}

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SubmitVideoForm slug={event.slug} targetName={event.title} action={submitEventVideoAction} maxSeconds={null} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
