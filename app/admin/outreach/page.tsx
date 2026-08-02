import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { fetchAllEvents } from '@/lib/data/events';
import { buildAssociationDirectory } from '@/lib/data/associations';
import { formatEventDate, parseDate } from '@/lib/utils/date';
import { OutreachQueue, type OutreachRow } from '@/components/admin/OutreachQueue';
import { AssociationPitchQueue, type AssociationPitchRow } from '@/components/admin/AssociationPitchQueue';

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

export default async function OutreachAdminPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  if (!(await hasValidAdminSessionCookie())) redirect('/admin?error=auth');
  const tab = searchParams?.tab === 'associations' ? 'associations' : 'organizers';

  const supabase = createSupabaseAdminServerClient();
  const [events, { data: outreachRows }, { data: assocOutreachRows }, { data: assocPages }] = await Promise.all([
    fetchAllEvents(),
    supabase.from('event_outreach').select('*'),
    supabase.from('association_outreach').select('*'),
    supabase.from('association_pages').select('slug, contact_email'),
  ]);

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
        contactEmail: rec?.contact_email ?? contactBySlug.get(a.slug) ?? '',
        notes: rec?.notes ?? '',
        lastContactedAt: rec?.last_contacted_at ?? null,
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
      </div>

      {tab === 'organizers' ? <OutreachQueue rows={rows} /> : <AssociationPitchQueue rows={assocRows} />}
    </main>
  );
}
