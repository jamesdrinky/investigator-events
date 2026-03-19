import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  adminLogoutAction,
  approveSubmissionAction,
  createEventAction,
  rejectSubmissionAction
} from '@/app/admin/actions';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { fetchPendingEventSubmissions } from '@/lib/data/event-submissions';
import { eventCountries, eventRegions } from '@/lib/forms/event-form-options';

export const dynamic = 'force-dynamic';

const scopes = [
  { value: 'main', label: 'Main' },
  { value: 'secondary', label: 'Secondary' }
];

function EventFields({
  defaults,
  idPrefix
}: {
  defaults?: {
    title?: string;
    date?: string;
    endDate?: string;
    city?: string;
    region?: string;
    country?: string;
    organiser?: string;
    association?: string;
    category?: string;
    eventScope?: 'main' | 'secondary';
    description?: string;
    website?: string;
    featured?: boolean;
  };
  idPrefix: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm text-slate-300">
        Title
        <input
          name="title"
          required
          defaultValue={defaults?.title ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300">
        Start date
        <input
          type="date"
          name="date"
          required
          defaultValue={defaults?.date ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300">
        End date
        <input
          type="date"
          name="endDate"
          defaultValue={defaults?.endDate ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300">
        City
        <input
          name="city"
          required
          defaultValue={defaults?.city ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300">
        Region
        <select
          name="region"
          required
          defaultValue={defaults?.region ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        >
          <option value="" disabled>
            Select region
          </option>
          {eventRegions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-slate-300">
        Country
        <input
          name="country"
          list={`${idPrefix}-country-options`}
          required
          autoComplete="country-name"
          defaultValue={defaults?.country ?? ''}
          placeholder="Select or enter country"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
        <datalist id={`${idPrefix}-country-options`}>
          {eventCountries.map((country) => (
            <option key={country} value={country} />
          ))}
        </datalist>
      </label>
      <label className="text-sm text-slate-300">
        Organiser
        <input
          name="organiser"
          required
          defaultValue={defaults?.organiser ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300">
        Association
        <input
          name="association"
          defaultValue={defaults?.association ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300">
        Category
        <input
          name="category"
          required
          defaultValue={defaults?.category ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300">
        Event scope
        <select
          name="eventScope"
          defaultValue={defaults?.eventScope ?? 'main'}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        >
          {scopes.map((scope) => (
            <option key={scope.value} value={scope.value}>
              {scope.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-slate-300 sm:col-span-2">
        Description
        <textarea
          name="description"
          rows={4}
          required
          defaultValue={defaults?.description ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300 sm:col-span-2">
        Website
        <input
          type="text"
          name="website"
          required
          inputMode="url"
          defaultValue={defaults?.website ?? ''}
          placeholder="example.com"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={Boolean(defaults?.featured)}
          className="h-4 w-4 rounded border-white/20 bg-white/10"
        />
        Featured event
      </label>
    </div>
  );
}

export default async function AdminEventsPage() {
  if (!hasValidAdminSessionCookie()) {
    redirect('/admin?error=auth');
  }

  const pendingSubmissions = await fetchPendingEventSubmissions();

  return (
    <section className="section-pad">
      <div className="container-shell space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accent2">Admin Events</p>
            <h1 className="mt-2 font-[var(--font-serif)] text-3xl text-white sm:text-4xl">Submissions and live event entry</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
              Full Admin
            </Link>
            <form action={adminLogoutAction}>
              <button type="submit" className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
                Log out
              </button>
            </form>
          </div>
        </header>

        <section className="glass-panel p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white">Create Live Event</h2>
          <p className="mt-2 text-sm text-slate-400">
            Use this form for approved events that should go straight onto the public calendar.
          </p>
          <form action={createEventAction} className="mt-5 space-y-4">
            <EventFields idPrefix="create-live-event" />
            <button type="submit" className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900">
              Create Live Event
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Pending Review ({pendingSubmissions.length})</h2>
            <p className="text-sm text-slate-400">
              Review organiser submissions here before they are promoted to the live calendar.
            </p>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="glass-panel p-5 text-sm text-slate-300">No pending event submissions.</div>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.map((submission) => (
                <article key={submission.id} className="glass-panel p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{submission.eventName}</h3>
                      <p className="mt-1 text-sm text-slate-300">
                        {submission.startDate}
                        {submission.endDate ? ` to ${submission.endDate}` : ''} · {submission.city}, {submission.country}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="city-chip">{submission.category}</span>
                        <span className="city-chip">{submission.eventScope}</span>
                        <span className="city-chip">{submission.organiser}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                        <a href={submission.website} target="_blank" rel="noreferrer" className="hover:text-white">
                          Open source link
                        </a>
                        <span>{submission.contactEmail}</span>
                      </div>
                      {submission.notes ? <p className="mt-4 max-w-3xl text-sm text-slate-400">{submission.notes}</p> : null}
                    </div>
                  </div>

                  <form action={approveSubmissionAction} className="mt-5 space-y-4 border-t border-white/10 pt-5">
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <EventFields
                      idPrefix={`submission-${submission.id}`}
                      defaults={{
                        title: submission.eventName,
                        date: submission.startDate,
                        endDate: submission.endDate,
                        city: submission.city,
                        region: submission.region,
                        country: submission.country,
                        organiser: submission.organiser,
                        association: '',
                        category: submission.category,
                        eventScope: submission.eventScope,
                        description: submission.notes ?? '',
                        website: submission.website,
                        featured: false
                      }}
                    />

                    <div className="flex flex-wrap gap-3">
                      <button type="submit" className="inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900">
                        Approve and Publish
                      </button>
                    </div>
                  </form>

                  <form action={rejectSubmissionAction} className="mt-3">
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <button type="submit" className="inline-flex rounded-full border border-rose-300/30 bg-rose-400/10 px-5 py-2 text-sm font-medium text-rose-200">
                      Reject Submission
                    </button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
