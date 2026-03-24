import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventCard } from '@/components/event-card';
import { EventCoverMedia } from '@/components/event-cover-media';
import { Reveal } from '@/components/motion/reveal';
import { SaveDateLinks } from '@/components/save-date-links';
import { fetchAllEvents, fetchEventBySlug } from '@/lib/data/events';
import { formatEventDate, parseDate } from '@/lib/utils/date';
import { getCountryFlag } from '@/lib/utils/location';

export const dynamic = 'force-dynamic';

async function resolveEvent(slug: string) {
  const [event, events] = await Promise.all([fetchEventBySlug(slug), fetchAllEvents()]);

  return { event, events };
}

function buildAudienceCopy(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes('training')) {
    return 'Best for investigators, analysts, and teams looking for practical development, certification, or specialist upskilling.';
  }

  if (normalized.includes('association')) {
    return 'Best for members, leadership teams, and professionals following association activity and industry coordination.';
  }

  return 'Best for investigators, organisers, suppliers, and industry professionals tracking major dates and network activity.';
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

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_84%_20%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="pointer-events-none absolute left-[8%] top-[10%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(22,104,255,0.12),transparent_72%)] blur-3xl" />
      <div className="container-shell relative space-y-8">
        <Reveal>
          <header className="overflow-hidden rounded-[2.5rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_48%,#f5fbff_100%)] p-6 shadow-[0_36px_96px_-56px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_28%,rgba(255,255,255,0.1)_56%,rgba(255,255,255,0)_100%)]" />
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="city-chip">{event.category}</span>
                  <span className="global-chip">{event.region}</span>
                  <span className="country-chip">
                    <span>{getCountryFlag(event.country)}</span>
                    <span>{event.country}</span>
                  </span>
                </div>

                <h1 className="mt-6 max-w-4xl font-[var(--font-serif)] text-4xl leading-[0.94] text-slate-950 sm:text-5xl lg:text-[4rem]">
                  {event.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                  {event.description || 'Official event details, organiser information, location, dates, and save links in one clean record.'}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white/90 bg-white/90 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Dates</p>
                    <p className="mt-2 text-sm font-medium text-slate-950">{formatEventDate(event)}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/90 bg-white/90 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Location</p>
                    <p className="mt-2 text-sm font-medium text-slate-950">
                      {event.city}, {event.country}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/90 bg-white/90 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Organiser</p>
                    <p className="mt-2 text-sm font-medium text-slate-950">{event.association ?? event.organiser}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={event.website} target="_blank" rel="noreferrer" className="btn-primary px-5 py-2.5">
                    Official website
                  </a>
                  <Link href="/calendar" className="btn-secondary px-5 py-2.5">
                    Back to calendar
                  </Link>
                  <SaveDateLinks event={event} />
                </div>
              </div>

              <EventCoverMedia
                title={event.title}
                city={event.city}
                country={event.country}
                region={event.region}
                category={event.category}
                coverImage={event.coverImage}
                coverImageAlt={event.coverImageAlt}
                associationName={event.association ?? event.organiser}
                featured={event.featured}
                className="h-[20rem] lg:h-[27rem]"
              />
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.04}>
          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-7">
              <p className="eyebrow">Why Open This</p>
              <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-slate-950">A useful event record, not just a title and date.</h2>
              <div className="mt-6 grid gap-3">
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-blue-700">Who it is for</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{buildAudienceCopy(event.category)}</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-700">Why it matters</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    This record brings together the key facts people need before they decide to travel, register, submit, sponsor, or monitor timing.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-700">What to do next</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    Use the official website for registration and agenda details, then save the dates to your own calendar.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-7">
              <p className="eyebrow">Event Summary</p>
              <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-slate-950">Confirmed details</h2>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Event type</dt>
                  <dd className="mt-2 text-base text-slate-950">{event.category}</dd>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Coverage region</dt>
                  <dd className="mt-2 text-base text-slate-950">{event.region}</dd>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Host organisation</dt>
                  <dd className="mt-2 text-base text-slate-950">{event.organiser}</dd>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Association</dt>
                  <dd className="mt-2 text-base text-slate-950">{event.association ?? 'Not specified separately'}</dd>
                </div>
              </dl>
            </article>
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(245,249,255,0.92))] p-6 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Related Events</p>
                <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-slate-950">Other major events to compare</h2>
              </div>
              <Link href="/submit-event" className="btn-secondary px-5 py-2.5">
                Submit an event
              </Link>
            </div>

            {relatedEvents.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {relatedEvents.map((relatedEvent) => (
                  <EventCard key={relatedEvent.id} event={relatedEvent} />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-600">No closely related major events are available right now.</p>
            )}
          </section>
        </Reveal>
      </div>
    </section>
  );
}
