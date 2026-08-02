import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarCheck, RefreshCw, Users } from 'lucide-react';
import { fetchAllEvents } from '@/lib/data/events';
import { buildAssociationDirectory } from '@/lib/data/associations';
import { countrySlug } from '@/lib/utils/country-pages';
import { parseDate } from '@/lib/utils/date';
import { PartnerRequestForm } from '@/components/partners/PartnerRequestForm';

export const revalidate = 3600;
export const dynamicParams = true;

const BASE_URL = 'https://www.investigatorevents.com';

async function resolveAssociation(slug: string) {
  const events = await fetchAllEvents();
  const directory = buildAssociationDirectory(events);
  const assoc = directory.find((a) => a.slug === slug) ?? null;
  if (!assoc) return null;

  const now = Date.now();
  const upcoming = events.filter(
    (e) =>
      e.eventScope === 'main' &&
      parseDate(e.date).getTime() >= now &&
      [e.association, e.organiser].some(
        (label) => label && assoc.aliases.some((al) => al.toLowerCase() === label.trim().toLowerCase())
      )
  ).length;

  return { assoc, upcoming };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const resolved = await resolveAssociation(params.slug);
  if (!resolved) return { title: 'Partner with Investigator Events' };
  const { assoc } = resolved;
  return {
    title: `A live events calendar for ${assoc.shortName}'s website | Investigator Events`,
    description: `We built ${assoc.name} a live, always-current events calendar for their website — free, zero maintenance, one line of code. See it running.`,
    alternates: { canonical: `${BASE_URL}/partners/${assoc.slug}` },
  };
}

export default async function PartnerPage({ params }: { params: { slug: string } }) {
  const resolved = await resolveAssociation(params.slug);
  if (!resolved) notFound();
  const { assoc, upcoming } = resolved;

  // Their events if we track any; otherwise their region's calendar so the
  // demo is never empty.
  const embedFilter =
    upcoming > 0
      ? `association=${encodeURIComponent(assoc.calendarAssociation.toLowerCase())}`
      : `country=${countrySlug(assoc.country)}`;
  const embedSrc = `/embed/upcoming?${embedFilter}&limit=4`;
  const fakeDomain = assoc.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '') || `${assoc.slug}.org`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <header className="mx-auto mb-12 max-w-3xl text-center">
        <div className="mb-5 flex items-center justify-center gap-4">
          {assoc.logoSrc && (
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <Image src={assoc.logoSrc} alt={`${assoc.shortName} logo`} width={56} height={56} className="object-contain" />
            </span>
          )}
          <span className="text-2xl font-light text-slate-300">×</span>
          <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <Image src="/icon.png" alt="Investigator Events" width={56} height={56} className="object-contain" />
          </span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Built for {assoc.shortName} · nothing to install today
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          {assoc.shortName}&apos;s events calendar.
          <br />
          On your website. <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Done for you.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
          {upcoming > 0 ? (
            <>
              We already track <b>{upcoming} upcoming {assoc.shortName} {upcoming === 1 ? 'event' : 'events'}</b> — so
              the calendar below is live and populated right now. It updates itself, forever, for free.
            </>
          ) : (
            <>
              A live, always-current calendar of investigator events for your region — and your own events the moment
              they&apos;re listed (listing is free). It updates itself, forever.
            </>
          )}
        </p>
      </header>

      {/* Live demo in mock browser */}
      <section className="mx-auto mb-12 max-w-3xl">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
          Live preview — real data, updating itself
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-slate-400">
              https://{fakeDomain}/events
            </span>
          </div>
          <div className="bg-[#1e3a5f] px-5 py-3.5">
            <span className="text-[15px] font-extrabold text-white">{assoc.shortName}</span>
            <span className="ml-5 text-xs font-medium text-white/70">About</span>
            <span className="ml-4 text-xs font-medium text-white/70">Members</span>
            <span className="ml-4 text-xs font-semibold text-white">Events</span>
          </div>
          <div className="bg-white p-5">
            <iframe
              src={embedSrc}
              width="100%"
              height={456}
              style={{ border: 0, borderRadius: 16 }}
              title={`Upcoming ${assoc.shortName} events`}
            />
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          Want it in your colours?{' '}
          <Link href="/widget" className="font-semibold text-blue-600 hover:underline">
            Customise it live →
          </Link>
        </p>
      </section>

      {/* Benefits */}
      <section className="mx-auto mb-12 grid max-w-3xl gap-4 sm:grid-cols-3">
        {[
          { icon: RefreshCw, title: 'Zero maintenance', text: 'Updates itself. Your team never touches it again.' },
          { icon: Users, title: 'Members see who’s going', text: 'Every event links to details, attendees and reviews.' },
          { icon: CalendarCheck, title: 'Free, forever', text: 'No cost, no catch — we grow when the industry connects.' },
        ].map((b) => (
          <div key={b.title} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <b.icon className="mx-auto h-6 w-6 text-blue-600" />
            <p className="mt-2.5 text-sm font-bold text-slate-900">{b.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{b.text}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-7 shadow-lg sm:p-9">
          <h2 className="text-center text-xl font-extrabold text-slate-900">
            Get it on {assoc.shortName}&apos;s site
          </h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
            Leave your details and we&apos;ll handle everything with your web person — it&apos;s one line of code and
            usually live the same day.
          </p>
          <PartnerRequestForm associationSlug={assoc.slug} associationName={assoc.name} />
        </div>
      </section>
    </main>
  );
}
