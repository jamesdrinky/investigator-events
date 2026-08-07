import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { fetchAllEvents } from '@/lib/data/events';
import { buildAssociationDirectory } from '@/lib/data/associations';
import { formatEventDate, parseDate } from '@/lib/utils/date';
import { OutreachQueue, type OutreachRow } from '@/components/admin/OutreachQueue';
import { AssociationPitchQueue, type AssociationPitchRow } from '@/components/admin/AssociationPitchQueue';
import { ADMIN_ALERT_INBOX } from '@/lib/email/admin-alert';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Organizer outreach | Admin' };

interface OutreachRecord {
  event_id: string;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  notes: string | null;
  last_contacted_at: string | null;
}

interface AssocOutreachRecord {
  association_slug: string;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  notes: string | null;
  last_contacted_at: string | null;
}

interface PartnerRequestRow {
  id: string;
  association_slug: string;
  association_name: string;
  contact_name: string;
  contact_email: string;
  webmaster_email: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export default async function OutreachAdminPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  if (!(await hasValidAdminSessionCookie())) redirect('/admin?error=auth');
  const tabParam = searchParams?.tab;
  const tab =
    tabParam === 'associations' ? 'associations' : tabParam === 'requests' ? 'requests' : 'organizers';

  const supabase = createSupabaseAdminServerClient();
  const [events, { data: outreachRows }, { data: assocOutreachRows }, { data: assocPages }, { data: partnerRows }] =
    await Promise.all([
      fetchAllEvents(),
      supabase.from('event_outreach').select('*'),
      supabase.from('association_outreach').select('*'),
      supabase.from('association_pages').select('slug, contact_email'),
      supabase.from('partner_requests').select('*').order('created_at', { ascending: false }),
    ]);
  // Every email address we've EVER sent outreach to (any campaign), so the
  // queue can steer toward the follow-up template instead of re-pitching cold.
  const { data: sentRows } = await (supabase
    .from('outreach_sends')
    .select('recipient_email, sent_at')
    .not('sent_at', 'is', null) as any);
  const lastSendByEmail = new Map<string, string>();
  for (const row of (sentRows ?? []) as { recipient_email: string; sent_at: string }[]) {
    const key = row.recipient_email.trim().toLowerCase();
    const prev = lastSendByEmail.get(key);
    if (!prev || row.sent_at > prev) lastSendByEmail.set(key, row.sent_at);
  }
  const partnerRequests = (partnerRows ?? []) as PartnerRequestRow[];
  const newRequests = partnerRequests.filter((r) => r.status === 'new').length;

  const outreachByEvent = new Map<string, OutreachRecord>(
    ((outreachRows ?? []) as OutreachRecord[]).map((r) => [r.event_id, r])
  );

  const now = Date.now();
  const rows: OutreachRow[] = events
    .filter((e) => e.eventScope === 'main')
    // Upcoming first (soonest at the top — most urgent to contact), past events last.
    .sort((a, b) => {
      const at = parseDate(a.date).getTime();
      const bt = parseDate(b.date).getTime();
      const aPast = at < now;
      const bPast = bt < now;
      if (aPast !== bPast) return aPast ? 1 : -1;
      return aPast ? bt - at : at - bt;
    })
    .map((e) => {
      const rec = outreachByEvent.get(e.id);
      return {
        eventId: e.id,
        slug: e.slug,
        title: e.title,
        dateLine: e.date ? formatEventDate(e) : 'TBC',
        isPast: parseDate(e.date).getTime() < now,
        city: e.city ?? '',
        country: e.country ?? '',
        organiser: e.association ?? e.organiser ?? '',
        website: e.website ?? '',
        status: (rec?.status ?? 'not_started') as OutreachRow['status'],
        contactName: rec?.contact_name ?? '',
        contactEmail: rec?.contact_email ?? '',
        notes: rec?.notes ?? '',
        lastContactedAt: rec?.last_contacted_at ?? null,
      };
    });

  // Associations tab: registry + tracker + any contact email we already hold.
  const contactBySlug = new Map((assocPages ?? []).map((p) => [p.slug, p.contact_email ?? '']));
  const assocRecBySlug = new Map(
    ((assocOutreachRows ?? []) as AssocOutreachRecord[]).map((r) => [r.association_slug, r])
  );
  const nowTs = Date.now();
  const assocRows: AssociationPitchRow[] = buildAssociationDirectory(events)
    .map((a) => {
      const rec = assocRecBySlug.get(a.slug);
      const upcomingCount = events.filter(
        (e) =>
          e.eventScope === 'main' &&
          parseDate(e.date).getTime() >= nowTs &&
          [e.association, e.organiser].some(
            (label) => label && a.aliases.some((al) => al.toLowerCase() === label.trim().toLowerCase())
          )
      ).length;
      const contactEmail = rec?.contact_email ?? contactBySlug.get(a.slug) ?? '';
      return {
        slug: a.slug,
        name: a.name,
        shortName: a.shortName,
        country: a.country,
        region: a.region,
        website: a.website ?? '',
        upcomingCount,
        status: (rec?.status ?? 'not_started') as AssociationPitchRow['status'],
        contactName: rec?.contact_name ?? '',
        contactEmail,
        notes: rec?.notes ?? '',
        lastContactedAt: rec?.last_contacted_at ?? null,
        hasConsolePage: contactBySlug.has(a.slug),
        priorSendAt: contactEmail ? (lastSendByEmail.get(contactEmail.trim().toLowerCase()) ?? null) : null,
      };
    })
    .sort((a, b) => b.upcomingCount - a.upcomingCount || a.name.localeCompare(b.name));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Outreach</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            The flywheel queue. Copy the pre-filled email, send it from Mike&apos;s account, move the
            status along.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          ← Admin home
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        <Link
          href="/admin/outreach"
          className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
            tab === 'organizers' ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Event organizers
        </Link>
        <Link
          href="/admin/outreach?tab=associations"
          className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
            tab === 'associations' ? 'bg-violet-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Associations ({assocRows.length})
        </Link>
        <Link
          href="/admin/outreach?tab=requests"
          className={`relative rounded-xl px-5 py-2.5 text-sm font-bold transition ${
            tab === 'requests' ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Widget requests ({partnerRequests.length})
          {newRequests > 0 && tab !== 'requests' && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white">
              {newRequests}
            </span>
          )}
        </Link>
      </div>

      {tab === 'organizers' && <OutreachQueue rows={rows} />}
      {tab === 'associations' && <AssociationPitchQueue rows={assocRows} />}
      {tab === 'requests' && (
        <div>
          <p className="mb-4 text-sm text-slate-500">
            Associations who asked us to put the events widget on their site, straight from their
            partner page. These also email {ADMIN_ALERT_INBOX} — this list is the record that survives if a
            mail ever goes astray.
          </p>
          {partnerRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
              No requests yet. Pitch some associations from the Associations tab.
            </div>
          ) : (
            <ul className="space-y-3">
              {partnerRequests.map((r) => (
                <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">{r.association_name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {r.contact_name} ·{' '}
                        <a href={`mailto:${r.contact_email}`} className="text-blue-600 hover:underline">
                          {r.contact_email}
                        </a>
                        {r.webmaster_email && (
                          <>
                            {' '}· web:{' '}
                            <a href={`mailto:${r.webmaster_email}`} className="text-blue-600 hover:underline">
                              {r.webmaster_email}
                            </a>
                          </>
                        )}
                      </p>
                      {r.message && <p className="mt-2 text-sm text-slate-600">{r.message}</p>}
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {r.status}
                      </span>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {new Date(r.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/partners/${r.association_slug}`}
                    target="_blank"
                    className="mt-3 inline-block text-xs font-semibold text-violet-700 hover:underline"
                  >
                    Their partner page →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
