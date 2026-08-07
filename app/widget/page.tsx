import type { Metadata } from 'next';
import { fetchAllEvents } from '@/lib/data/events';
import { groupEventsByCountry } from '@/lib/utils/country-pages';
import { WidgetBuilder } from '@/components/WidgetBuilder';
import { ArrowRight, CalendarCheck2, Palette, RefreshCw } from 'lucide-react';

// Rendered at request time — the build-time events fetch is empty in
// production (same as the country pages), which left the association
// picker blank on the statically-built version.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your Events, On Your Website — Free Widget | Investigator Events',
  description:
    "A live events section for your association's website — your events, your colours, updating itself forever. Free, one line of code, with member calendar subscriptions built in.",
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-12 pt-24 sm:pb-16 sm:pt-32">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-20 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_65%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-10 -right-20 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.14),transparent_65%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

        <div className="container-shell relative text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600 backdrop-blur-sm sm:tracking-[0.3em]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)] animate-pulse" />
            For associations — free, forever
          </span>
          <h1 className="mt-4 text-[2.2rem] font-bold leading-[0.98] tracking-[-0.04em] text-slate-950 sm:text-[3.6rem] lg:text-[4.4rem]">
            Your events. Your website.{' '}
            <span
              className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
              style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
            >
              Zero upkeep.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            A live events section for your site that runs itself — your events, your colours, one line of
            code. Your members can even subscribe so every event lands straight in their own calendar.
          </p>

          <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-600 backdrop-blur-sm">
              <RefreshCw className="h-3.5 w-3.5 text-blue-500" /> Updates itself forever
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-600 backdrop-blur-sm">
              <Palette className="h-3.5 w-3.5 text-purple-500" /> Your brand colours
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-600 backdrop-blur-sm">
              <CalendarCheck2 className="h-3.5 w-3.5 text-cyan-500" /> Members subscribe in one click
            </span>
          </div>
        </div>
      </div>

      {/* Builder */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <WidgetBuilder countries={countries} associations={associations} />

        {/* Console cross-sell */}
        <div className="mt-14 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0a1120_0%,#101a35_55%,#1a1040_100%)] p-8 text-center shadow-xl sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300">The other half</p>
          <h2 className="mx-auto mt-3 max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Run your events through your own console
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
            Add an event once in your association&apos;s console — after verification it appears on this
            widget, the global calendar, and every subscribed member&apos;s personal calendar. No more
            updating three places.
          </p>
          <a
            href="/associations"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-blue-50"
          >
            Find your association <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </main>
  );
}
