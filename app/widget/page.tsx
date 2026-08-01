import type { Metadata } from 'next';
import { fetchAllEvents } from '@/lib/data/events';
import { groupEventsByCountry } from '@/lib/utils/country-pages';
import { WidgetBuilder } from '@/components/WidgetBuilder';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Free Events Widget for Your Website | Investigator Events',
  description:
    'Add a live "Upcoming investigator events" widget to your association or company website — free, always up to date, one line of code.',
  alternates: { canonical: 'https://www.investigatorevents.com/widget' },
};

export default async function WidgetPage() {
  const events = await fetchAllEvents();
  const countries = groupEventsByCountry(events).map((g) => ({
    slug: g.slug,
    name: g.country,
    upcoming: g.upcoming.length,
  }));

  // Associations with at least one upcoming event, for the "just yours" filter.
  const now = Date.now();
  const assocCounts = new Map<string, { name: string; upcoming: number }>();
  for (const e of events) {
    const name = e.association?.trim();
    if (!name || e.eventScope !== 'main') continue;
    if (new Date(e.date).getTime() < now) continue;
    const key = name.toLowerCase();
    const existing = assocCounts.get(key);
    if (existing) existing.upcoming += 1;
    else assocCounts.set(key, { name, upcoming: 1 });
  }
  const associations = [...assocCounts.entries()]
    .map(([key, v]) => ({ key, name: v.name, upcoming: v.upcoming }))
    .sort((a, b) => b.upcoming - a.upcoming || a.name.localeCompare(b.name));

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">For associations &amp; partners</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Put the industry&apos;s events calendar on your website
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          A live, always-up-to-date list of upcoming investigator events — free, no maintenance, one
          line of code. Filter it to your country or association so your members see the events that
          matter to them.
        </p>
      </header>

      <WidgetBuilder countries={countries} associations={associations} />
    </main>
  );
}
