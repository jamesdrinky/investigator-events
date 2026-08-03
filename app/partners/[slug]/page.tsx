import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BellRing, CalendarCheck, MessageSquareQuote, Users } from 'lucide-react';
import { fetchAllEvents, type EventItem } from '@/lib/data/events';
import { buildAssociationDirectory } from '@/lib/data/associations';
import { countrySlug } from '@/lib/utils/country-pages';
import { parseDate } from '@/lib/utils/date';
import { PartnerRequestForm } from '@/components/partners/PartnerRequestForm';
import { PartnerLiveDemo } from '@/components/partners/PartnerLiveDemo';
import { detectBrandColor } from '@/lib/utils/brand-color';

export const revalidate = 3600;
export const dynamicParams = true;

const BASE_URL = 'https://www.investigatorevents.com';

async function resolveAssociation(slug: string) {
  const events = await fetchAllEvents();
  const directory = buildAssociationDirectory(events);
  const assoc = directory.find((a) => a.slug === slug) ?? null;
  if (!assoc) return null;

  const now = Date.now();
  const upcomingAll = events.filter((e) => e.eventScope === 'main' && parseDate(e.date).getTime() >= now);
  const theirUpcoming = upcomingAll
    .filter((e) =>
      [e.association, e.organiser].some(
        (label) => label && assoc.aliases.some((al) => al.toLowerCase() === label.trim().toLowerCase())
      )
    )
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

  return {
    assoc,
    theirUpcoming,
    nextEvent: (theirUpcoming[0] ?? null) as EventItem | null,
    industryUpcoming: upcomingAll.length,
    countryCount: new Set(upcomingAll.map((e) => e.country).filter(Boolean)).size,
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const resolved = await resolveAssociation(params.slug);
  if (!resolved) return { title: 'Partner with Investigator Events' };
  const { assoc } = resolved;
  return {
    title: `A live events calendar for ${assoc.shortName}'s website | Investigator Events`,
    description: `We built ${assoc.name} a live, always-current events calendar for their website — free, zero maintenance, one line of code. See it running, in your colours.`,
    alternates: { canonical: `${BASE_URL}/partners/${assoc.slug}` },
  };
}

const FAQS = [
  {
    q: 'Is it really free?',
    a: 'Completely. No cost, no trial, no card. Investigator Events grows when the profession is better connected — a calendar on your site does exactly that. That’s the whole trade.',
  },
  {
    q: 'How much work is it for our team?',
    a: 'One line of code, pasted once, by whoever runs your website — about two minutes on WordPress, Squarespace, Wix or anything else. If you’d rather not touch it at all, send us your web person’s email and we handle everything with them directly.',
  },
  {
    q: 'Who keeps it up to date?',
    a: 'We do. Events, dates, venues and photos update automatically from the Investigator Events calendar. Your team never maintains it — that’s the point.',
  },
  {
    q: 'Can it match our branding?',
    a: 'Yes — your accent colour (any hex), light or dark, and how many events to show. You can try every option live on this page.',
  },
  {
    q: 'What if we change our minds?',
    a: 'Delete the one line and it’s gone. No contract, no lock-in, nothing to cancel.',
  },
  {
    q: 'Who is behind Investigator Events?',
    a: 'It’s co-founded by Mike LaCorte of Conflict International, built with and for the investigations profession — a free global calendar of conferences, AGMs and networking events, with attendee lists and reviews from fellow investigators.',
  },
];

/** Pure-CSS staggered entrance (no JS dependency — see .pr-rise). */
function rise(step: number) {
  return { className: 'pr-rise', style: { animationDelay: `${step * 90}ms` } };
}

export default async function PartnerPage({ params }: { params: { slug: string } }) {
  const resolved = await resolveAssociation(params.slug);
  if (!resolved) notFound();
  const { assoc, theirUpcoming, nextEvent, industryUpcoming, countryCount } = resolved;
  const upcoming = theirUpcoming.length;
  const brandAccent = await detectBrandColor(assoc.logoSrc);

  const embedFilter =
    upcoming > 0
      ? `association=${encodeURIComponent(assoc.calendarAssociation.toLowerCase())}`
      : `country=${countrySlug(assoc.country)}`;
  const fakeDomain = assoc.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '') || `${assoc.slug}.org`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl bg-[#050b1b] px-6 py-14 text-center sm:px-12 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 60% at 20% 0%, rgba(59,130,246,0.22), transparent), radial-gradient(50% 50% at 85% 100%, rgba(139,92,246,0.18), transparent)',
          }}
        />
        <div className="relative">
          <div {...rise(0)}>
            <div className="mb-6 flex items-center justify-center gap-4">
              {assoc.logoSrc && (
                <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white p-2 shadow-lg">
                  <Image src={assoc.logoSrc} alt={`${assoc.shortName} logo`} width={56} height={56} className="object-contain" />
                </span>
              )}
              <span className="text-2xl font-light text-white/30">×</span>
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white p-2 shadow-lg">
                <Image src="/icon.png" alt="Investigator Events" width={56} height={56} className="object-contain" />
              </span>
            </div>
          </div>

          <div {...rise(1)}>
            <div className="mx-auto mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-5 py-2">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-400 to-violet-500" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100">
                Built for {assoc.shortName} — already live
              </span>
            </div>
          </div>

          <div {...rise(2)}>
            <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              {assoc.shortName}&apos;s events calendar.
              <br />
              On your website.{' '}
              <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Done for you.
              </span>
            </h1>
          </div>

          <div {...rise(3)}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
              {upcoming > 0 ? (
                <>
                  We already track{' '}
                  <b className="text-white">
                    {upcoming} upcoming {assoc.shortName} {upcoming === 1 ? 'event' : 'events'}
                  </b>{' '}
                  — the calendar below is populated and updating itself right now. Free, forever, zero maintenance.
                </>
              ) : (
                <>
                  A live, always-current calendar of investigator events for your region — and your own events the
                  moment they&apos;re listed. Free, forever, zero maintenance.
                </>
              )}
            </p>
          </div>

          <div {...rise(4)}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              {[
                upcoming > 0 ? `${upcoming} ${assoc.shortName} events tracked` : `${assoc.country} events covered`,
                `${industryUpcoming} live industry events`,
                `${countryCount} countries`,
              ].map((stat) => (
                <span
                  key={stat}
                  className="rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 text-xs font-semibold text-slate-200"
                >
                  {stat}
                </span>
              ))}
            </div>
          </div>

          <div {...rise(5)}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#get-started"
                className="rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-90"
              >
                Put it on our site — free
              </a>
              <span className="text-xs font-medium text-slate-400">One line of code · live the same day</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive demo ── */}
      <section className="mx-auto mt-16 max-w-3xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Live preview — real data</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            This is your calendar. Make it look like {assoc.shortName}.
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-500">
            Everything below is live from the Investigator Events calendar — it loads in a colour picked from your
            own logo, and you can change every detail. What you see is exactly what your members would see.
          </p>
        </div>
        <PartnerLiveDemo
          shortName={assoc.shortName}
          fakeDomain={fakeDomain}
          embedFilter={embedFilter}
          defaultAccent={brandAccent}
        />
      </section>

      {/* ── Their share card ── */}
      {nextEvent && (
        <section className="mx-auto mt-20 grid max-w-4xl items-center gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">There&apos;s more</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Your events, presented properly — everywhere
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Every {assoc.shortName} event gets a full page on Investigator Events — details, attendee list,
              reviews — and when anyone shares the link on LinkedIn or WhatsApp, it renders a designed card like
              this one. Automatically. That&apos;s <b>{nextEvent.title}</b>&apos;s card, generated from your live
              listing.
            </p>
          </div>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/events/${nextEvent.slug}/opengraph-image`}
              alt={`Share card for ${nextEvent.title}`}
              className="w-full rounded-2xl border border-slate-200 shadow-xl"
            />
          </div>
        </section>
      )}

      {/* ── How it goes live ── */}
      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">How it goes live</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { n: '1', t: 'You say yes', d: 'The form below takes 30 seconds. No commitment, nothing signed.' },
            { n: '2', t: 'We sort it with your web person', d: 'We send them one line of code and stay on hand until it’s live — usually the same day.' },
            { n: '3', t: 'Done — forever', d: 'Your members always see what’s on. Nobody at your association ever maintains it.' },
          ].map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-sm font-extrabold text-white">
                {s.n}
              </span>
              <p className="mt-3 text-sm font-bold text-slate-900">{s.t}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What members get ── */}
      <section className="mx-auto mt-20 max-w-4xl">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">What your members get</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { icon: CalendarCheck, t: 'Every event, one place', d: 'Conferences, AGMs, regionals and training — yours and the wider industry’s, always current.' },
            { icon: Users, t: 'See who’s going', d: 'Members RSVP, see colleagues attending, and connect before the event.' },
            { icon: MessageSquareQuote, t: 'Honest reviews', d: 'Real feedback from investigators who attended — so members pick the right events.' },
            { icon: BellRing, t: 'Never miss a date', d: 'Add-to-calendar buttons and a weekly events newsletter, free to every member.' },
          ].map((f) => (
            <div key={f.t} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <f.icon className="h-5 w-5 text-blue-600" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">{f.t}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto mt-20 max-w-2xl">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">Fair questions</h2>
        <div className="mt-7 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-slate-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="get-started" className="mx-auto mt-20 max-w-xl scroll-mt-24">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-7 shadow-xl sm:p-9">
          <h2 className="text-center text-xl font-extrabold text-slate-900">
            Get it on {assoc.shortName}&apos;s site
          </h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
            Leave your details and we&apos;ll handle everything with your web person — usually live the same day.
          </p>
          <PartnerRequestForm associationSlug={assoc.slug} associationName={assoc.name} />
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs leading-relaxed text-slate-600">
              &ldquo;We built this because our profession deserves one proper calendar. Putting it on{' '}
              {assoc.shortName}&apos;s site costs you nothing and gives your members something genuinely useful —
              if it&apos;s ever not right for you, one line removes it.&rdquo;
            </p>
            <p className="mt-2 text-xs font-bold text-slate-900">
              Mike LaCorte <span className="font-medium text-slate-400">· Co-founder, Investigator Events</span>
            </p>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Prefer email?{' '}
            <a href="mailto:info@investigatorevents.com" className="font-semibold text-blue-600 hover:underline">
              info@investigatorevents.com
            </a>{' '}
            · Or{' '}
            <Link href="/widget" className="font-semibold text-blue-600 hover:underline">
              grab the code yourself
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
