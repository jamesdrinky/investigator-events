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
  toggleUserVerifiedAction,
  toggleUserPublicAction,
  adminAddAssociationAction,
  adminRemoveAssociationAction
} from '@/app/admin/actions';
import { Calendar, Users, FileText, Megaphone, Globe, MapPin, Tag, ExternalLink, CheckCircle2, XCircle, Plus, Trash2, ShieldCheck, AlertTriangle, Mail, Send } from 'lucide-react';
import { VerificationCodeManager } from '@/components/admin/VerificationCodeManager';
import { ModerationPanel } from '@/components/admin/ModerationPanel';
import { QuickAddEvent } from '@/components/admin/QuickAddEvent';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { associationRecords } from '@/lib/data/associations';
import { ImageDropZone } from '@/components/admin/ImageDropZone';
import { OutreachManager } from '@/components/admin/OutreachManager';
import { ReengageSender } from '@/components/admin/ReengageSender';

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
    pricing?: string;
    timezone?: string;
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
        <label htmlFor={`${idPrefix}-co-association`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Co-association</label>
        <select id={`${idPrefix}-co-association`} name="coAssociation" defaultValue={(defaults as any)?.coAssociation ?? ''} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20">
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
      <div>
        <label htmlFor={`${idPrefix}-pricing`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Pricing (optional)</label>
        <input id={`${idPrefix}-pricing`} type="text" name="pricing" defaultValue={defaults?.pricing ?? ''} placeholder="e.g. Free, £150, $200-$500" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-timezone`} className="text-xs font-medium uppercase tracking-wider text-slate-500">Timezone (optional)</label>
        <input id={`${idPrefix}-timezone`} type="text" name="timezone" defaultValue={defaults?.timezone ?? ''} placeholder="e.g. GMT, EST, CET" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
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
  const isAuthed = await hasValidAdminSessionCookie();

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
    admin.from('profiles' as never).select('*').order('created_at', { ascending: false }).limit(200) as any,
  ]);
  const associationPages = (assocPagesResult.data ?? []) as { id: string; name: string; slug: string }[];
  const assocSuggestions = (assocSuggestionsResult.data ?? []) as unknown as { id: string; name: string; country: string | null; website: string | null; created_at: string }[];

  const newsletterSends = (newsletterSendsResult?.data ?? []) as any[];
  const recentSubscribers = (recentSubscribersResult?.data ?? []) as any[];
  const allUsers = (allUsersResult?.data ?? []) as { id: string; full_name: string | null; username: string | null; avatar_url: string | null; country: string | null; specialisation: string | null; is_verified: boolean; is_public: boolean; created_at: string; linkedin_url: string | null; linkedin_name: string | null; linkedin_picture: string | null; auth_provider: string | null }[];

  // Re-engagement campaign state
  const { data: reengageRows } = await (admin.from('reengagement_sends' as any)
    .select('user_id, variant, status, sent_at')
    .eq('campaign', 'reengagement_v1')
    .order('sent_at', { ascending: false }) as any);
  const reengageMap: Record<string, { variant: string; status: string; sent_at: string }> = {};
  for (const r of (reengageRows ?? []) as { user_id: string; variant: string; status: string; sent_at: string }[]) {
    if (!reengageMap[r.user_id]) reengageMap[r.user_id] = { variant: r.variant, status: r.status, sent_at: r.sent_at };
  }

  // Map of newsletter-subscribed user IDs (for GDPR-eligible recipients of the re-engagement campaign).
  // We need to join auth.users.email -> newsletter_subscribers.email since profiles doesn't carry email.
  const newsletterEligibleSet = new Set<string>();
  try {
    const { data: activeSubs } = await (admin.from('newsletter_subscribers' as any)
      .select('email')
      .eq('status', 'active') as any);
    const activeEmails = new Set<string>(((activeSubs ?? []) as { email: string }[]).map((s) => s.email.toLowerCase()));
    if (activeEmails.size > 0 && allUsers.length > 0) {
      const { data: authPage } = await admin.auth.admin.listUsers({ perPage: 1000 });
      for (const u of authPage?.users ?? []) {
        if (u.email && activeEmails.has(u.email.toLowerCase())) newsletterEligibleSet.add(u.id);
      }
    }
  } catch {}
  const reengageEligibleCount = allUsers.filter((u) => newsletterEligibleSet.has(u.id) && !reengageMap[u.id]).length;
  const reengageIneligibleCount = allUsers.filter((u) => !newsletterEligibleSet.has(u.id)).length;

  // Fetch all user_associations for the admin panel
  let userAssocMap: Record<string, { association_name: string; association_slug: string; role: string | null }[]> = {};
  try {
    const { data: allUserAssocs } = await admin.from('user_associations').select('user_id, association_name, association_slug, role') as any;
    ((allUserAssocs ?? []) as any[]).forEach((ua: any) => {
      if (!userAssocMap[ua.user_id]) userAssocMap[ua.user_id] = [];
      userAssocMap[ua.user_id].push({ association_name: ua.association_name, association_slug: ua.association_slug, role: ua.role });
    });
  } catch { /* ignore — associations just won't show */ }
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
            { id: 'outreach', label: 'Outreach', icon: Send },
            { id: 'reengage', label: 'Re-engage', icon: Send },
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

          {activeTab === 'newsletter' && (() => {
            const activeCount = recentSubscribers.filter((s: any) => s.status === 'active').length;
            const pendingCount = recentSubscribers.filter((s: any) => s.status === 'pending').length;
            const bouncedCount = recentSubscribers.filter((s: any) => s.status === 'bounced').length;
            const latestSend = newsletterSends[0];
            const openRate = latestSend && latestSend.recipient_count > 0 ? Math.round((latestSend.open_count / latestSend.recipient_count) * 100) : 0;
            const clickRate = latestSend && latestSend.recipient_count > 0 ? Math.round((latestSend.click_count / latestSend.recipient_count) * 100) : 0;

            return (
            <div className="space-y-6">
              {/* Overview stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total subscribers</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{subscriberCountResult.count ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Last send</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-600">{latestSend?.recipient_count ?? 0}</p>
                  <p className="text-xs text-slate-400">{latestSend ? new Date(latestSend.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Never'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Open rate</p>
                  <p className="mt-2 text-3xl font-extrabold text-blue-600">{openRate}%</p>
                  <p className="text-xs text-slate-400">{latestSend?.open_count ?? 0} opens</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Click rate</p>
                  <p className="mt-2 text-3xl font-extrabold text-purple-600">{clickRate}%</p>
                  <p className="text-xs text-slate-400">{latestSend?.click_count ?? 0} clicks</p>
                </div>
              </div>

              {/* Controls */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Weekly Newsletter</h2>
                    <p className="mt-1 text-sm text-slate-500">Sends every Monday at 9am UK via Vercel Cron + Resend</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="/api/newsletter/preview"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      Preview
                    </a>
                    <a
                      href="/api/newsletter/preview?send=james@drinky.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <Mail className="h-4 w-4" /> Send test to me
                    </a>
                  </div>
                </div>
              </div>

              {/* Send history */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">Send History</h2>
                {newsletterSends.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No newsletters sent yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {newsletterSends.map((send: any, i: number) => (
                      <div key={send.id} className={`rounded-xl border px-4 py-3.5 text-sm ${i === 0 ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-semibold text-slate-900">{new Date(send.sent_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {i === 0 && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">Latest</span>}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">{send.recipient_count} delivered</span>
                          {send.failed_count > 0 && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">{send.failed_count} failed</span>}
                          {send.open_count > 0 && <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">{send.open_count} opens ({send.recipient_count > 0 ? Math.round((send.open_count / send.recipient_count) * 100) : 0}%)</span>}
                          {send.click_count > 0 && <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700">{send.click_count} clicks ({send.recipient_count > 0 ? Math.round((send.click_count / send.recipient_count) * 100) : 0}%)</span>}
                        </div>
                        <div className="mt-1.5 text-xs text-slate-400">Content: {send.upcoming_count} upcoming · {send.new_count} new · {send.featured_count} featured</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subscriber breakdown */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">Subscribers</h2>
                <div className="mt-3 flex gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{activeCount} active</span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{pendingCount} pending</span>
                  {bouncedCount > 0 && <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">{bouncedCount} bounced</span>}
                </div>
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
            );
          })()}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Registered Users</h2>
                    <p className="mt-1 text-sm text-slate-500">{allUsers.length} users · {allUsers.filter(u => u.is_verified === true).length} verified · {allUsers.filter(u => u.auth_provider === 'linkedin_oidc').length} LinkedIn-verified · {allUsers.filter(u => u.is_public === false).length} private</p>
                  </div>
                </div>

                {/* User cards */}
                <div className="mt-6 space-y-3">
                  {allUsers.map((user) => {
                    const assocs = userAssocMap[user.id] ?? [];
                    const isLinkedInVerified = user.auth_provider === 'linkedin_oidc';
                    const linkedinSearchName = user.linkedin_name || user.full_name || '';
                    const linkedinUrl = user.linkedin_url
                      || (isLinkedInVerified && linkedinSearchName
                        ? `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(linkedinSearchName)}`
                        : '');
                    const isVerified = user.is_verified === true;
                    const isPublic = user.is_public !== false;

                    return (
                      <details key={user.id} className="group rounded-xl border border-slate-200/60 bg-white transition open:shadow-sm">
                        <summary className="flex cursor-pointer items-center gap-4 px-4 py-3 [&::-webkit-details-marker]:hidden">
                          {/* Avatar */}
                          <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                                {(user.full_name ?? '?').charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Name + meta */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">{user.full_name ?? 'No name'}</p>
                              {isVerified && <ShieldCheck className="h-4 w-4 flex-shrink-0 text-blue-600" />}
                              {isLinkedInVerified && (
                                <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700" title="Authenticated via LinkedIn">
                                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.48-.9 1.65-1.85 3.39-1.85 3.62 0 4.29 2.39 4.29 5.49v6.25zM5.34 7.43a2.06 2.06 0 11.001-4.121 2.06 2.06 0 01-.001 4.121zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
                                  LinkedIn
                                </span>
                              )}
                              {!isPublic && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Private</span>}
                            </div>
                            <p className="truncate text-xs text-slate-400">
                              {user.username ? `@${user.username}` : ''}
                              {user.country ? ` · ${user.country}` : ''}
                              {user.specialisation ? ` · ${user.specialisation}` : ''}
                            </p>
                            {assocs.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {assocs.map((a) => (
                                  <span key={a.association_name} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{a.association_name}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Right side: date + verify */}
                          <div className="flex items-center gap-2">
                            <span className="hidden text-[10px] text-slate-400 sm:block">{user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                            <form action={toggleUserVerifiedAction}>
                              <input type="hidden" name="userId" value={user.id} />
                              <input type="hidden" name="currentlyVerified" value={String(isVerified)} />
                              <button
                                type="submit"
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                  isVerified
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                {isVerified ? 'Verified ✓' : 'Verify'}
                              </button>
                            </form>
                          </div>
                        </summary>

                        {/* Expanded detail panel */}
                        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                          {/* Quick action bar */}
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            {user.username && (
                              <a
                                href={`/profile/${user.username}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View site profile
                              </a>
                            )}
                            {linkedinUrl ? (
                              <a
                                href={linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.48-.9 1.65-1.85 3.39-1.85 3.62 0 4.29 2.39 4.29 5.49v6.25zM5.34 7.43a2.06 2.06 0 11.001-4.121 2.06 2.06 0 01-.001 4.121zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
                                {user.linkedin_url ? 'View LinkedIn' : `Find on LinkedIn`}
                              </a>
                            ) : (
                              <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400">
                                No LinkedIn
                              </span>
                            )}
                            <form action={toggleUserPublicAction} className="inline">
                              <input type="hidden" name="userId" value={user.id} />
                              <input type="hidden" name="currentlyPublic" value={String(isPublic)} />
                              <button
                                type="submit"
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  isPublic
                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    : 'bg-amber-500 text-white hover:bg-amber-600'
                                }`}
                                title={isPublic ? 'Profile is publicly visible' : 'Profile is hidden — clicking will make it public'}
                              >
                                {isPublic ? 'Public ✓' : 'Make public'}
                              </button>
                            </form>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* LinkedIn details */}
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">LinkedIn</p>
                              {isLinkedInVerified ? (
                                <div className="mt-1 flex items-center gap-2">
                                  {user.linkedin_picture && (
                                    <img src={user.linkedin_picture} alt="" className="h-7 w-7 flex-shrink-0 rounded-full object-cover" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-900">{user.linkedin_name || user.full_name}</p>
                                    <p className="text-[11px] text-emerald-600">✓ Verified via LinkedIn OAuth</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="mt-1 text-sm text-slate-400">Not authenticated via LinkedIn</p>
                              )}
                            </div>

                            {/* User info */}
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Details</p>
                              <p className="mt-1 text-sm text-slate-600">{user.username ? `@${user.username}` : 'No username'}</p>
                              <p className="text-sm text-slate-600">Signed up via {user.auth_provider === 'linkedin_oidc' ? 'LinkedIn' : user.auth_provider === 'google' ? 'Google' : 'email'}</p>
                            </div>
                          </div>

                          {/* Association management */}
                          <div className="mt-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Associations</p>
                            {assocs.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {assocs.map((a) => (
                                  <div key={a.association_name} className="flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-3 pr-1 text-xs font-medium text-blue-700">
                                    {a.association_name}{a.role ? ` (${a.role})` : ''}
                                    <form action={adminRemoveAssociationAction} className="inline">
                                      <input type="hidden" name="userId" value={user.id} />
                                      <input type="hidden" name="associationName" value={a.association_name} />
                                      <button type="submit" className="ml-0.5 rounded-full p-1 text-blue-400 transition hover:bg-blue-100 hover:text-red-500">
                                        <XCircle className="h-3.5 w-3.5" />
                                      </button>
                                    </form>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 text-sm text-slate-400">No associations yet</p>
                            )}

                            {/* Add association form */}
                            <form action={adminAddAssociationAction} className="mt-3 flex items-center gap-2">
                              <input type="hidden" name="userId" value={user.id} />
                              <select name="associationName" className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-400" defaultValue="">
                                <option value="" disabled>Add association...</option>
                                {associationRecords
                                  .filter((ar) => !assocs.some((a) => a.association_name === ar.shortName))
                                  .sort((a, b) => a.shortName.localeCompare(b.shortName))
                                  .map((ar) => (
                                    <option key={ar.slug} value={ar.shortName}>{ar.shortName} — {ar.name}</option>
                                  ))}
                              </select>
                              <button type="submit" className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">
                                <Plus className="h-4 w-4" />
                              </button>
                            </form>
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
              <ModerationPanel />
            </div>
          )}

          {activeTab === 'outreach' && (
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-1 text-lg font-bold text-slate-900">Association Outreach</h2>
              <p className="mb-4 text-sm text-slate-500">Send introduction emails to associations. Preview before sending.</p>
              <OutreachManager />
            </div>
          )}

          {activeTab === 'reengage' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-1 text-lg font-bold text-slate-900">Re-engagement Campaign</h2>
                <p className="mb-4 text-sm text-slate-500">
                  Personalised email per user — variant chosen from profile completeness (3 tiers) × LinkedIn-verified status. Includes new event titles + association names since their last login. <strong>Sends only to users who opted into the newsletter</strong> — GDPR-safe.
                </p>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total users</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{allUsers.length}</p>
                  </div>
                  <div className="rounded-xl border border-blue-200/60 bg-blue-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Eligible & pending</p>
                    <p className="mt-1 text-2xl font-bold text-blue-900">{reengageEligibleCount}</p>
                    <p className="mt-1 text-[10px] text-blue-600">opted-in, not yet sent</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200/60 bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Already sent</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-900">{Object.keys(reengageMap).length}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200/60 bg-amber-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Not opted in</p>
                    <p className="mt-1 text-2xl font-bold text-amber-900">{reengageIneligibleCount}</p>
                    <p className="mt-1 text-[10px] text-amber-600">will be skipped</p>
                  </div>
                </div>
                <div className="mt-4">
                  <ReengageSender totalUsers={reengageEligibleCount} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="mb-3 text-sm font-bold text-slate-900">Per-user preview & status</h3>
                <p className="mb-4 text-xs text-slate-500">Click "Preview" to open the exact email that user would receive in a new tab.</p>
                <div className="divide-y divide-slate-100">
                  {allUsers.map((user) => {
                    const sent = reengageMap[user.id];
                    const eligible = newsletterEligibleSet.has(user.id);
                    return (
                      <div key={user.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <div className="min-w-0 flex-1 truncate">
                          <span className="font-medium text-slate-900">{user.full_name ?? 'No name'}</span>
                          {user.username && <span className="ml-2 text-xs text-slate-400">@{user.username}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {sent ? (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              Sent · {sent.variant.replace('tier_', 'T').replace('_unverified', '·U').replace('_verified', '·V')}
                            </span>
                          ) : eligible ? (
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">Eligible</span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">Not opted in</span>
                          )}
                          <a
                            href={`/api/admin/reengagement/preview?userId=${user.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Preview
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
