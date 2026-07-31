import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { fetchAllEvents } from '@/lib/data/events';
import { formatEventDate, parseDate } from '@/lib/utils/date';
import { OutreachQueue, type OutreachRow } from '@/components/admin/OutreachQueue';

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

export default async function OutreachAdminPage() {
  if (!(await hasValidAdminSessionCookie())) redirect('/admin?error=auth');

  const supabase = createSupabaseAdminServerClient();
  const [events, { data: outreachRows }] = await Promise.all([
    fetchAllEvents(),
    supabase.from('event_outreach').select('*'),
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

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Organizer outreach</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            The flywheel queue: contact every organizer, log the reply, get the share. Copy the
            pre-filled email, send it from Mike&apos;s account, then move the status along.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          ← Admin home
        </Link>
      </div>

      <OutreachQueue rows={rows} />
    </main>
  );
}
