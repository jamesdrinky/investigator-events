import { fetchAllEvents } from '@/lib/data/events';
import { fetchPendingEventSubmissions } from '@/lib/data/event-submissions';
import { fetchAdvertiserLeads } from '@/lib/data/advertiser-leads';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { eventCountries, eventRegions } from '@/lib/forms/event-form-options';
import {
  adminLoginAction,
  adminLogoutAction,
  approveSubmissionAction,
  createEventAction,
  deleteEventAction,
  rejectSubmissionAction,
  updateEventAction
} from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

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
      <label className="text-sm text-slate-300" htmlFor={`${idPrefix}-title`}>
        Title
        <input
          id={`${idPrefix}-title`}
          name="title"
          required
          defaultValue={defaults?.title ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300" htmlFor={`${idPrefix}-date`}>
        Date
        <input
          id={`${idPrefix}-date`}
          type="date"
          name="date"
          required
          defaultValue={defaults?.date ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300" htmlFor={`${idPrefix}-end-date`}>
        End Date
        <input
          id={`${idPrefix}-end-date`}
          type="date"
          name="endDate"
          defaultValue={defaults?.endDate ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300" htmlFor={`${idPrefix}-city`}>
        City
        <input
          id={`${idPrefix}-city`}
          name="city"
          required
          defaultValue={defaults?.city ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300" htmlFor={`${idPrefix}-region`}>
        Region
        <select
          id={`${idPrefix}-region`}
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
      <label className="text-sm text-slate-300" htmlFor={`${idPrefix}-country`}>
        Country
        <input
          id={`${idPrefix}-country`}
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
      <label className="text-sm text-slate-300" htmlFor={`${idPrefix}-organiser`}>
        Organiser
        <input
          id={`${idPrefix}-organiser`}
          name="organiser"
          required
          defaultValue={defaults?.organiser ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300" htmlFor={`${idPrefix}-association`}>
        Association
        <input
          id={`${idPrefix}-association`}
          name="association"
          defaultValue={defaults?.association ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300" htmlFor={`${idPrefix}-category`}>
        Category
        <input
          id={`${idPrefix}-category`}
          name="category"
          required
          defaultValue={defaults?.category ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300" htmlFor={`${idPrefix}-event-scope`}>
        Event scope
        <select
          id={`${idPrefix}-event-scope`}
          name="eventScope"
          defaultValue={defaults?.eventScope ?? 'main'}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        >
          <option value="main">Main</option>
          <option value="secondary">Secondary</option>
        </select>
      </label>
      <label className="text-sm text-slate-300 sm:col-span-2" htmlFor={`${idPrefix}-description`}>
        Description
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          rows={3}
          required
          defaultValue={defaults?.description ?? ''}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="text-sm text-slate-300 sm:col-span-2" htmlFor={`${idPrefix}-website`}>
        Website
        <input
          id={`${idPrefix}-website`}
          type="text"
          name="website"
          required
          inputMode="url"
          defaultValue={defaults?.website ?? ''}
          placeholder="example.com"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-slate-300 sm:col-span-2" htmlFor={`${idPrefix}-featured`}>
        <input
          id={`${idPrefix}-featured`}
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

export default async function AdminPage({
  searchParams
}: {
  searchParams?: {
    error?: string;
  };
}) {
  const isAuthed = hasValidAdminSessionCookie();

  if (!isAuthed) {
    return (
      <section className="section-pad">
        <div className="container-shell max-w-lg">
          <div className="glass-panel p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-accent2">Admin Access</p>
            <h1 className="mt-3 font-[var(--font-serif)] text-3xl text-white">Investigator Events Admin</h1>
            <p className="mt-3 text-sm text-slate-300">Enter the admin password to manage events.</p>

            {searchParams?.error && (
              <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                {searchParams.error === 'invalid' && 'Invalid password. Please try again.'}
                {searchParams.error === 'auth' && 'Your admin session has expired. Please log in again.'}
                {searchParams.error !== 'invalid' && searchParams.error !== 'auth' &&
                  'Admin access is temporarily unavailable. Please contact the site administrator.'}
              </p>
            )}

            <form action={adminLoginAction} className="mt-5 space-y-4">
              <label className="block text-sm text-slate-300" htmlFor="admin-password">
                Password
                <input
                  id="admin-password"
                  type="password"
                  name="password"
                  required
                  className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-slate-100"
                />
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900"
              >
                Access Admin
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  const [events, pendingSubmissions, advertiserLeads] = await Promise.all([
    fetchAllEvents(),
    fetchPendingEventSubmissions(),
    fetchAdvertiserLeads(12)
  ]);

  return (
    <section className="section-pad">
      <div className="container-shell space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accent2">Admin</p>
            <h1 className="mt-2 font-[var(--font-serif)] text-3xl text-white sm:text-4xl">Manage Events</h1>
          </div>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              Log out
            </button>
          </form>
        </header>

        <section className="glass-panel p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white">Create New Event</h2>
          <form action={createEventAction} className="mt-5 space-y-4">
            <EventFields idPrefix="create" />
            <button
              type="submit"
              className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900"
            >
              Create Event
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Pending Submissions ({pendingSubmissions.length})</h2>
            <p className="text-sm text-slate-400">Approve submissions into the live calendar or reject them from the queue.</p>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="glass-panel p-5 text-sm text-slate-300">No pending organiser submissions.</div>
          ) : (
            pendingSubmissions.map((submission) => (
              <details key={submission.id} className="glass-panel p-5" open={false}>
                <summary className="cursor-pointer list-none text-sm text-slate-200">
                  <span className="font-semibold text-white">{submission.eventName}</span>
                  <span className="ml-2 text-slate-400">
                    {submission.startDate} · {submission.city}, {submission.country}
                  </span>
                </summary>

                <form action={approveSubmissionAction} className="mt-4 space-y-4">
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
                      description: submission.notes ?? 'Pending organiser submission.',
                      website: submission.website,
                      featured: false
                    }}
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
                    >
                      Approve and Publish
                    </button>
                  </div>
                </form>

                <form action={rejectSubmissionAction} className="mt-3">
                  <input type="hidden" name="submissionId" value={submission.id} />
                  <button
                    type="submit"
                    className="inline-flex rounded-full border border-rose-300/30 bg-rose-400/10 px-5 py-2 text-sm font-medium text-rose-200"
                  >
                    Reject Submission
                  </button>
                </form>
              </details>
            ))
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Existing Events ({events.length})</h2>

          {events.map((event) => (
            <details key={event.id} className="glass-panel p-5" open={false}>
              <summary className="cursor-pointer list-none text-sm text-slate-200">
                <span className="font-semibold text-white">{event.title}</span>
                <span className="ml-2 text-slate-400">
                  {event.date} · {event.city}, {event.country}
                </span>
              </summary>

              <form action={updateEventAction} className="mt-4 space-y-4">
                <input type="hidden" name="id" value={event.id} />
                <EventFields
                  idPrefix={`event-${event.id}`}
                  defaults={{
                    title: event.title,
                    date: event.date,
                    endDate: event.endDate,
                    city: event.city,
                    region: event.region,
                    country: event.country,
                    organiser: event.organiser,
                    association: event.association,
                    category: event.category,
                    eventScope: event.eventScope,
                    description: event.description,
                    website: event.website,
                    featured: event.featured
                  }}
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              <form action={deleteEventAction} className="mt-3">
                <input type="hidden" name="id" value={event.id} />
                <button
                  type="submit"
                  className="inline-flex rounded-full border border-rose-300/30 bg-rose-400/10 px-5 py-2 text-sm font-medium text-rose-200"
                >
                  Delete Event
                </button>
              </form>
            </details>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Advertising Inquiries ({advertiserLeads.length})</h2>
            <p className="text-sm text-slate-400">Recent advertiser, sponsor, vendor, and partner inquiries from `/advertise`.</p>
          </div>

          {advertiserLeads.length === 0 ? (
            <div className="glass-panel p-5 text-sm text-slate-300">No advertising inquiries yet.</div>
          ) : (
            advertiserLeads.map((lead) => (
              <article key={lead.id} className="glass-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{lead.companyName}</h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {lead.contactName} · {lead.email}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="city-chip">{lead.inquiryType}</span>
                      <span className="city-chip">{lead.status}</span>
                      {lead.regionOrAudience ? <span className="city-chip">{lead.regionOrAudience}</span> : null}
                    </div>
                    <p className="mt-4 max-w-3xl text-sm text-slate-400">{lead.message}</p>
                  </div>
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noreferrer" className="text-sm text-slate-300 hover:text-white">
                      Open website
                    </a>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </section>
  );
}
