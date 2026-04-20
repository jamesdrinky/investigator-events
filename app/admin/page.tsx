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
  updateEventAction,
  toggleUserVerifiedAction
} from '@/app/admin/actions';
import { Calendar, Users, FileText, Megaphone, Globe, MapPin, Tag, ExternalLink, CheckCircle2, XCircle, Plus, Trash2, ShieldCheck, AlertTriangle, Mail } from 'lucide-react';
import { VerificationCodeManager } from '@/components/admin/VerificationCodeManager';
import { ModerationPanel } from '@/components/admin/ModerationPanel';
import { QuickAddEvent } from '@/components/admin/QuickAddEvent';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { associationRecords } from '@/lib/data/associations';
import { ImageDropZone } from '@/components/admin/ImageDropZone';

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
    imagePath?: string;
    featured?: boolean;
  };
  idPrefix: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${idPrefix}-title`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Title</label>
        <input id={`${idPrefix}-title`} name="title" required defaultValue={defaults?.title ?? ''} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-date`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Start date</label>
        <input id={`${idPrefix}-date`} type="date" name="date" required defaultValue={defaults?.date ?? ''} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-end-date`} className="text-xs font-medium uppercase tracking-wider text-slate-500">End date</label>
        <input id={`${idPrefix}-end-date`} type="date" name="endDate" defaultValue={defaults?.endDate ?? ''} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-city`} className="text-xs font-medium uppercase tracking-wider text-slate-500">City</label>
        <input id={`${idPrefix}-city`} name="city" required defaultValue={defaults?.city ?? ''} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-region`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Region</label>
        <select id={`${idPrefix}-region`} name="region" required defaultValue={defaults?.region ?? ''} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20">
          <option value="" disabled>Select region</option>
          {eventRegions.map((region) => <option key={region} value={region}>{region}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-country`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Country</label>
        <input id={`${idPrefix}-country`} name="country" list={`${idPrefix}-country-options`} required autoComplete="country-name" defaultValue={defaults?.country ?? ''} placeholder="Select or enter country" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
        <datalist id={`${idPrefix}-country-options`}>
          {eventCountries.map((country) => <option key={country} value={country} />)}
        </datalist>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-organiser`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Organiser</label>
        <input id={`${idPrefix}-organiser`} name="organiser" required defaultValue={defaults?.organiser ?? ''} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-association`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Association</label>
        <select id={`${idPrefix}-association`} name="association" defaultValue={defaults?.association ?? ''} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20">
          <option value="">None</option>
          {associationRecords.map((a) => <option key={a.slug} value={a.shortName}>{a.shortName} — {a.name}</option>)}
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-category`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Category</label>
        <input id={`${idPrefix}-category`} name="category" required defaultValue={defaults?.category ?? ''} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-event-scope`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Event scope</label>
        <select id={`${idPrefix}-event-scope`} name="eventScope" defaultValue={defaults?.eventScope ?? 'main'} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20">
          <option value="main">Main</option>
          <option value="secondary">Secondary</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-description`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Description</label>
        <textarea id={`${idPrefix}-description`} name="description" rows={3} required defaultValue={defaults?.description ?? ''} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-website`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Website</label>
        <input id={`${idPrefix}-website`} type="text" name="website" required inputMode="url" defaultValue={defaults?.website ?? ''} placeholder="example.com" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Cover image</label>
        <div className="mt-1">
          <ImageDropZone name="imagePath" defaultValue={defaults?.imagePath} />
        </div>
      </div>
      <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 sm:col-span-2">
        <input id={`${idPrefix}-featured`} type="checkbox" name="featured" defaultChecked={Boolean(defaults?.featured)} className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600" />
        Featured event
      </label>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}12` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs font-medium text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default async function AdminPage({ searchParams }: { searchParams?: { error?: string; tab?: string } }) {
  const isAuthed = hasValidAdminSessionCookie();

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-lg">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">Admin Access</h1>
              <p className="mt-2 text-sm text-slate-500">Enter the admin password to manage Investigator Events.</p>
            </div>

            {searchParams?.error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {searchParams.error === 'invalid' && 'Invalid password. Please try again.'}
                {searchParams.error === 'auth' && 'Your session has expired. Please log in again.'}
                {searchParams.error !== 'invalid' && searchParams.error !== 'auth' && 'Admin access is temporarily unavailable.'}
              </div>
            )}

            <form action={adminLoginAction} className="mt-6 space-y-4">
              <div>
                <label htmlFor="admin-password" className="text-xs font-medium uppercase tracking-wider text-slate-500">Password</label>
                <input id="admin-password" type="password" name="password" required autoFocus className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
              </div>
              <button type="submit" className="btn-primary w-full py-3 text-sm">Sign in to Admin</button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const admin = createSupabaseAdminServerClient();
  const [events, pendingSubmissions, advertiserLeads, assocPagesResult, assocSuggestionsResult, subscriberCountResult, newsletterSendsResult, recentSubscribersResult, allUsersResult] = await Promise.all([
    fetchAllEvents(),
    fetchPendingEventSubmissions(),
    fetchAdvertiserLeads(20),
    admin.from('association_pages').select('id, name, slug').order('name'),
    admin.from('association_suggestions' as any).select('*').eq('status', 'pending').order('created_at', { ascending: false }),
    admin.from('newsletter_subscribers' as never).select('id', { count: 'exact', head: true }),
    admin.from('newsletter_sends' as never).select('*').order('sent_at', { ascending: false }).limit(5) as any,
    admin.from('newsletter_subscribers' as never).select('email, status, region, created_at, confirmed_at').order('created_at', { ascending: false }).limit(20) as any,
    admin.from('profiles').select('id, full_name, username, email, avatar_url, country, specialisation, is_verified, is_public, created_at').order('created_at', { ascending: false }).limit(200) as any,
  ]);
  const associationPages = (assocPagesResult.data ?? []) as { id: string; name: string; slug: string }[];
  const assocSuggestions = (assocSuggestionsResult.data ?? []) as unknown as { id: string; name: string; country: string | null; website: string | null; created_at: string }[];

  const newsletterSends = (newsletterSendsResult?.data ?? []) as any[];
  const recentSubscribers = (recentSubscribersResult?.data ?? []) as any[];
  const allUsers = (allUsersResult?.data ?? []) as { id: string; full_name: string | null; username: string | null; email: string | null; avatar_url: string | null; country: string | null; specialisation: string | null; is_verified: boolean; is_public: boolean; created_at: string }[];
  const activeTab = searchParams?.tab ?? 'overview';
  const countries = new Set(events.map((e) => e.country));
  const mainEvents = events.filter((e) => e.eventScope === 'main');
  const featuredEvents = events.filter((e) => e.featured);

  return (
    <main className="min-h-screen bg-slate-50/80">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Manage events, submissions, and platform content.</p>
          </div>
          <form action={adminLogoutAction}>
            <button type="submit" className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50">
              Log out
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={Calendar} label="Total events" value={events.length} color="#3b82f6" />
          <StatCard icon={FileText} label="Pending submissions" value={pendingSubmissions.length} color="#f59e0b" />
          <StatCard icon={Megaphone} label="Ad inquiries" value={advertiserLeads.length} color="#8b5cf6" />
          <StatCard icon={Globe} label="Countries" value={countries.size} color="#10b981" />
          <StatCard icon={Mail} label="Newsletter subs" value={subscriberCountResult.count ?? 0} color="#ec4899" />
        </div>

        {/* Tab navigation */}
        <div className="mt-8 flex gap-1 overflow-x-auto rounded-xl border border-slate-200/60 bg-white p-1 shadow-sm">
          {[
            { id: 'overview', label: 'Create Event', icon: Plus },
            { id: 'submissions', label: `Submissions (${pendingSubmissions.length})`, icon: FileText },
            { id: 'events', label: `All Events (${events.length})`, icon: Calendar },
            { id: 'inquiries', label: `Inquiries (${advertiserLeads.length})`, icon: Megaphone },
            { id: 'newsletter', label: `Newsletter (${subscriberCountResult.count ?? 0})`, icon: Mail },
            { id: 'users', label: `Users (${allUsers.length})`, icon: Users },
            { id: 'verification', label: 'Verification Codes', icon: ShieldCheck },
            { id: 'moderation', label: 'Moderation', icon: AlertTriangle },
          ].map((tab) => (
            <a
              key={tab.id}
              href={`/admin?tab=${tab.id}`}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </a>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {/* Create Event */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Add — paste and extract */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">Quick Add</h2>
                <p className="mt-1 text-sm text-slate-500">Paste text from any association website to extract event details, or browse association events pages directly.</p>
                <div className="mt-4">
                  <QuickAddEvent associationUrls={Object.fromEntries(associationRecords.map((a) => [a.shortName, a.website]))} />
                </div>
              </div>

              {/* Create Event form */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">Create New Event</h2>
                <p className="mt-1 text-sm text-slate-500">Add an event directly to the live calendar.</p>
                <form action={createEventAction} className="mt-6 space-y-4">
                  <EventFields idPrefix="create" />
                  <button type="submit" className="btn-primary flex items-center gap-2 px-6 py-3 text-sm">
                    <Plus className="h-4 w-4" /> Create Event
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Pending Submissions */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              {pendingSubmissions.length === 0 ? (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-8 text-center shadow-sm">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                  <p className="mt-3 text-sm font-medium text-slate-900">All caught up!</p>
                  <p className="mt-1 text-sm text-slate-500">No pending submissions to review.</p>
                </div>
              ) : (
                pendingSubmissions.map((submission) => (
                  <div key={submission.id} className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                    {/* Submission header */}
                    <div className="border-b border-slate-100 bg-amber-50/50 px-6 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{submission.eventName}</h3>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{submission.startDate}{submission.endDate ? ` - ${submission.endDate}` : ''}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{submission.city}, {submission.country}</span>
                            <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{submission.category}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{submission.eventScope}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>Organiser: <strong className="text-slate-700">{submission.organiser}</strong></span>
                        <span>Contact: <strong className="text-slate-700">{submission.contactEmail}</strong></span>
                        {submission.website && (
                          <a href={submission.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                            <ExternalLink className="h-3 w-3" /> Website
                          </a>
                        )}
                      </div>
                      {submission.notes && <p className="mt-2 text-sm text-slate-600">{submission.notes}</p>}
                    </div>

                    {/* Editable fields + actions */}
                    <div className="p-6">
                      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">Edit before publishing</p>
                      <form action={approveSubmissionAction} className="space-y-4">
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
                        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                          <button type="submit" className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
                            <CheckCircle2 className="h-4 w-4" /> Approve & Publish
                          </button>
                        </div>
                      </form>
                      <form action={rejectSubmissionAction} className="mt-3">
                        <input type="hidden" name="submissionId" value={submission.id} />
                        <button type="submit" className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100">
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* All Events */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              {events.map((event) => (
                <details key={event.id} className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                  <summary className="flex cursor-pointer items-center gap-4 px-5 py-4 text-sm [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{event.title}</span>
                        {event.featured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Featured</span>}
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{event.eventScope}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.city}, {event.country}</span>
                        <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{event.category}</span>
                      </div>
                    </div>
                    <svg className="h-5 w-5 flex-shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </summary>

                  <div className="border-t border-slate-100 p-5">
                    <form action={updateEventAction} className="space-y-4">
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
                          imagePath: event.image_path,
                          featured: event.featured
                        }}
                      />
                      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                        <button type="submit" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
                          Save Changes
                        </button>
                        <a href={`/events/${event.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700">
                          <ExternalLink className="h-3.5 w-3.5" /> View live
                        </a>
                      </div>
                    </form>
                    <form action={deleteEventAction} className="mt-4 border-t border-slate-100 pt-4">
                      <input type="hidden" name="id" value={event.id} />
                      <button type="submit" className="flex items-center gap-2 text-sm text-red-500 transition hover:text-red-700">
                        <Trash2 className="h-4 w-4" /> Delete event
                      </button>
                    </form>
                  </div>
                </details>
              ))}
            </div>
          )}

          {/* Advertising Inquiries */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              {/* Association suggestions from users */}
              {assocSuggestions.length > 0 && (
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/30 p-6 shadow-sm sm:p-8">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Plus className="h-5 w-5 text-amber-500" /> Association Suggestions ({assocSuggestions.length})
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Users have suggested these associations. Review and add to the platform if they qualify.</p>
                  <div className="mt-4 space-y-2">
                    {assocSuggestions.map((s) => (
                      <div key={s.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-400">
                            {s.country && `${s.country} · `}
                            {s.website ? <a href={s.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{s.website}</a> : 'No website provided'}
                            {' · '}{new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <VerificationCodeManager associations={associationPages} />
              </div>
            </div>
          )}

          {activeTab === 'newsletter' && (
            <div className="space-y-6">
              {/* Send controls */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Weekly Newsletter</h2>
                    <p className="mt-1 text-sm text-slate-500">{subscriberCountResult.count ?? 0} subscribers · Sends every Monday at 9am UK</p>
                  </div>
                  <a
                    href={`/api/cron/weekly-newsletter`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <Mail className="h-4 w-4" /> Preview in browser
                  </a>
                </div>
              </div>

              {/* Recent sends */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">Send History</h2>
                {newsletterSends.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No newsletters sent yet. First send will be Monday 9am UK.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {newsletterSends.map((send: any) => (
                      <div key={send.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm">
                        <span className="font-medium text-slate-900">{new Date(send.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{send.recipient_count} sent</span>
                        {send.failed_count > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">{send.failed_count} failed</span>}
                        <span className="text-xs text-slate-400">{send.upcoming_count} upcoming · {send.new_count} new · {send.featured_count} featured</span>
                        {(send.open_count > 0 || send.click_count > 0) && (
                          <span className="text-xs text-blue-600">{send.open_count} opens · {send.click_count} clicks</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent subscribers */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">Recent Subscribers</h2>
                <div className="mt-4 divide-y divide-slate-100">
                  {recentSubscribers.map((sub: any) => (
                    <div key={sub.email} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <div className="min-w-0">
                        <span className="truncate font-medium text-slate-900">{sub.email}</span>
                        {sub.region && <span className="ml-2 text-xs text-slate-400">{sub.region}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          sub.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          sub.status === 'bounced' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>{sub.status}</span>
                        <span className="whitespace-nowrap text-xs text-slate-400">{new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">Registered Users</h2>
                <p className="mt-1 text-sm text-slate-500">{allUsers.length} users · {allUsers.filter(u => u.is_verified).length} verified</p>
                <div className="mt-6 divide-y divide-slate-100">
                  {allUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 py-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                            {(user.full_name ?? '?').charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">{user.full_name ?? 'No name'}</p>
                          {user.is_verified && <ShieldCheck className="h-4 w-4 flex-shrink-0 text-blue-600" />}
                          {!user.is_public && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">Private</span>}
                        </div>
                        <p className="truncate text-xs text-slate-400">
                          {user.username ? `@${user.username}` : user.email ?? 'No email'}
                          {user.country ? ` · ${user.country}` : ''}
                          {user.specialisation ? ` · ${user.specialisation}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="hidden text-[10px] text-slate-400 sm:block">{new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <form action={toggleUserVerifiedAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="currentlyVerified" value={String(user.is_verified)} />
                          <button
                            type="submit"
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              user.is_verified
                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {user.is_verified ? 'Verified ✓' : 'Verify'}
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
              <ModerationPanel />
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              {advertiserLeads.length === 0 ? (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-8 text-center shadow-sm">
                  <Megaphone className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">No advertising inquiries yet.</p>
                </div>
              ) : (
                advertiserLeads.map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{lead.companyName}</h3>
                        <p className="mt-1 text-sm text-slate-500">{lead.contactName} &middot; {lead.email}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">{lead.inquiryType}</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{lead.status}</span>
                          {lead.regionOrAudience && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">{lead.regionOrAudience}</span>}
                        </div>
                        {lead.message && <p className="mt-3 text-sm text-slate-600">{lead.message}</p>}
                      </div>
                      {lead.website && (
                        <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                          <ExternalLink className="h-3.5 w-3.5" /> Website
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
