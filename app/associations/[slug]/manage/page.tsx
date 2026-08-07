import Link from 'next/link';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { fetchAllEvents } from '@/lib/data/events';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import {
  eventMatchesAssociation,
  fetchAssociationPageBySlug,
  isAssociationAdmin,
} from '@/lib/data/association-console';
import { AssociationConsole, RequestAccessCard } from '@/components/AssociationConsole';

// The Association Console: an association's own admins manage their events
// through IE. Everything they submit goes through IE verification, then
// flows to their website widget, the global calendar, and the feeds at once.
export const dynamic = 'force-dynamic';

export default async function ManageAssociationPage({ params }: { params: { slug: string } }) {
  const page = await fetchAssociationPageBySlug(params.slug);

  if (!page) {
    return (
      <main className="container-shell py-28 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Association not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          Check the link, or <Link href="/associations" className="font-semibold text-blue-600">browse associations</Link>.
        </p>
      </main>
    );
  }

  const ssr = await createSupabaseSSRServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();

  if (!user) {
    return (
      <main className="container-shell flex min-h-[60vh] items-center justify-center py-20">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/60 bg-white p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-slate-900">Manage {page.name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to your Investigator Events account to manage this association&apos;s events.
          </p>
          <Link href={`/signin?next=${encodeURIComponent(`/associations/${page.slug}/manage`)}`} className="btn-primary mt-5 inline-block px-6 py-2.5 text-sm">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const isManager = await isAssociationAdmin(user.id, page.id);

  if (!isManager) {
    return (
      <main className="container-shell flex min-h-[60vh] items-center justify-center py-20">
        <RequestAccessCard slug={page.slug} name={page.name} />
      </main>
    );
  }

  // Their live events + their submissions still in review.
  const [allEvents, pendingResult] = await Promise.all([
    fetchAllEvents(),
    (createSupabaseAdminServerClient()
      .from('event_submissions')
      .select('id, event_name, start_date, end_date, city, country, status, created_at')
      .eq('organiser', page.name)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }) as any),
  ]);

  const now = Date.now();
  const liveEvents = allEvents
    .filter((e) => eventMatchesAssociation(e, page))
    .map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      date: e.date,
      endDate: e.endDate ?? null,
      city: e.city,
      country: e.country,
      upcoming: new Date(`${e.endDate ?? e.date}T23:59:59Z`).getTime() >= now,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="container-shell py-24">
        <AssociationConsole
          slug={page.slug}
          name={page.name}
          logoUrl={page.logo_url}
          liveEvents={liveEvents}
          pendingSubmissions={(pendingResult.data ?? []) as any[]}
        />
      </div>
    </main>
  );
}
