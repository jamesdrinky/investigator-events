import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventCoverMedia } from '@/components/event-cover-media';
import { EventCard } from '@/components/event-card';
import { PageAtmosphere } from '@/components/global/page-atmosphere';
import { LocationSignature } from '@/components/location-signature';
import { Reveal } from '@/components/motion/reveal';
import { SaveDateLinks } from '@/components/save-date-links';
import { fetchAllEvents, fetchEventBySlug } from '@/lib/data/events';
import { formatEventDate, parseDate } from '@/lib/utils/date';
import { getCityHeroDownloadMeta, hasCityHeroImage } from '@/lib/utils/city-media.server';
import { getCountryFlag } from '@/lib/utils/location';

export const dynamic = 'force-dynamic';

async function resolveEvent(slug: string) {
  const [event, events] = await Promise.all([fetchEventBySlug(slug), fetchAllEvents()]);

  return { event, events };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { event } = await resolveEvent(params.slug);

  if (!event) {
    return {
      title: 'Event Not Found | Investigator Events'
    };
  }

  return {
    title: `${event.title} | Investigator Events`,
    description: event.description
      ? `${event.title} in ${event.city}, ${event.country}. ${event.description}`
      : `${event.title} in ${event.city}, ${event.country}.`
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const { event, events } = await resolveEvent(params.slug);

  if (!event) {
    notFound();
  }

  const relatedEvents = events
    .filter((item) => item.id !== event.id)
    .filter((item) => item.eventScope === 'main')
    .filter((item) => item.region === event.region || item.category === event.category || item.country === event.country)
    .sort(
      (a, b) =>
        Math.abs(parseDate(a.date).getTime() - parseDate(event.date).getTime()) -
        Math.abs(parseDate(b.date).getTime() - parseDate(event.date).getTime())
    )
    .slice(0, 3);
  const hasCityImage = await hasCityHeroImage(event.city);
  const heroDownload = !event.coverImage && hasCityImage ? getCityHeroDownloadMeta(event.city) : null;

  return (
    <section className="section-pad relative overflow-hidden">
      <PageAtmosphere />
      <div className="container-shell space-y-8">
        <Reveal>
          <header className="global-panel relative overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.06]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="city-chip">{event.category}</span>
                <span className="global-chip">{event.region}</span>
                <span className="country-chip">
                  <span>{getCountryFlag(event.country)}</span>
                  <span>{event.country}</span>
                </span>
                <span className="city-chip">{event.association ?? event.organiser}</span>
              </div>
              <div className="mt-5 max-w-4xl">
                <EventCoverMedia
                  title={event.title}
                  city={event.city}
                  country={event.country}
                  region={event.region}
                  category={event.category}
                  coverImage={event.coverImage}
                  coverImageAlt={event.coverImageAlt}
                />
              </div>
              <div className="mt-5 max-w-3xl">
                <LocationSignature city={event.city} country={event.country} region={event.region} />
              </div>
              <h1 className="section-title max-w-4xl">{event.title}</h1>
              {event.description ? <p className="section-copy max-w-3xl">{event.description}</p> : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <a href={event.website} target="_blank" rel="noreferrer" className="btn-primary px-5 py-2.5">
                  Open Official Website
                </a>
                <Link href="/calendar" className="btn-secondary px-5 py-2.5">
                  Return to Calendar
                </Link>
                <SaveDateLinks event={event} />
                {heroDownload ? (
                  <a href={heroDownload.url} download={heroDownload.filename} className="btn-secondary px-5 py-2.5">
                    Download Event Media
                  </a>
                ) : null}
              </div>
            </div>

            <article className="rounded-[1.7rem] border border-white/12 bg-white/[0.03] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Event record</p>
              <dl className="mt-5 grid gap-4 text-sm text-slate-300">
                <div className="grid gap-1">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Dates</dt>
                  <dd className="text-base text-white">{formatEventDate(event)}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Location</dt>
                  <dd className="text-base text-white">
                    {event.city}, {event.country}
                  </dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Organiser</dt>
                  <dd className="text-base text-white">{event.organiser}</dd>
                </div>
                {event.association ? (
                  <div className="grid gap-1">
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Association</dt>
                    <dd className="text-base text-white">{event.association}</dd>
                  </div>
                ) : null}
                <div className="grid gap-1">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Category</dt>
                  <dd className="text-base text-white">{event.category}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Coverage region</dt>
                  <dd className="text-base text-white">{event.region}</dd>
                </div>
              </dl>
            </article>
          </div>
          </header>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
            <article className="lux-panel p-6 sm:p-7">
            <p className="eyebrow">Event Summary</p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-white">What is confirmed here</h2>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Confirmed details</p>
                <p className="mt-2 text-sm text-slate-200">
                  Dates, organiser, and location are listed here so this event can be checked quickly against the rest of
                  the live calendar.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Official source</p>
                <p className="mt-2 text-sm text-slate-200">
                  Use the official website link above for registration, agenda details, venue updates, and organiser
                  notices.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Calendar context</p>
                <p className="mt-2 text-sm text-slate-200">
                  The category and region tags make it easier to compare this event with other live meetings in the same
                  part of the calendar.
                </p>
              </div>
            </div>
          </article>

            <article className="lux-panel p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Related Events</p>
                  <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-white">Other live main events to compare</h2>
                </div>
                <Link href="/submit-event" className="btn-secondary px-5 py-2.5">
                  Submit an Event
                </Link>
              </div>

              {relatedEvents.length > 0 ? (
                <div className="mt-6 grid gap-4">
                  {relatedEvents.map((relatedEvent) => (
                    <EventCard key={relatedEvent.id} event={relatedEvent} />
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-300">No closely related live main events are available to compare right now.</p>
              )}
            </article>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
