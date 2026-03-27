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
  if (!slug) {
    return { event: null, events: [] };
  }

  const [event, events] = await Promise.all([fetchEventBySlug(slug), fetchAllEvents()]);

  return { event, events };
}

function buildAudienceCopy(category?: string) {
  if (!category) {
    return 'Best for investigators, organisers, suppliers, and industry professionals tracking major dates and network activity.';
  }

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
  const slug = params?.slug?.trim();
  const { event } = await resolveEvent(slug ?? '');

  if (!event) {
    return {
      title: 'Event Not Found | Investigator Events'
    };
  }

  return {
    title: `${event.title ?? 'Event detail'} | Investigator Events`,
    description: event.description
      ? `${event.title ?? 'Event'} in ${event.city ?? 'Unknown location'}, ${event.country ?? 'Unknown country'}. ${event.description}`
      : `${event.title ?? 'Event'} in ${event.city ?? 'Unknown location'}, ${event.country ?? 'Unknown country'}.`
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug?.trim();
  if (!slug) {
    notFound();
  }

  const { event, events } = await resolveEvent(slug);

  if (!event) {
    notFound();
  }

  const category = event.category ?? 'Event';
  const region = event.region ?? 'Global';
  const country = event.country ?? 'Unknown country';
  const city = event.city ?? 'Location to be confirmed';
  const organiser = event.association ?? event.organiser ?? 'Organiser to be confirmed';
  const website = event.website?.trim();
  const title = event.title ?? 'Event detail';
  const eventDate = event.date ? formatEventDate(event) : 'Date to be confirmed';

  const relatedEvents = events
    .filter((item) => item.id !== event.id)
    .filter((item) => item.eventScope === 'main')
    .filter((item) => item.region === event.region || item.category === event.category || item.country === event.country)
    .sort(
      (a, b) =>
        Math.abs(parseDate(a.date).getTime() - parseDate(event.date ?? a.date).getTime()) -
        Math.abs(parseDate(b.date).getTime() - parseDate(event.date ?? b.date).getTime())
    )
    .slice(0, 3);

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_84%_20%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="pointer-events-none absolute left-[8%] top-[10%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(22,104,255,0.12),transparent_72%)] blur-3xl" />
      <div className="container-shell relative space-y-6 sm:space-y-8">
        <Reveal>
          <header className="overflow-hidden rounded-[1.9rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_48%,#f5fbff_100%)] p-4 shadow-[0_36px_96px_-56px_rgba(15,23,42,0.18)] sm:rounded-[2.5rem] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_28%,rgba(255,255,255,0.1)_56%,rgba(255,255,255,0)_100%)]" />
            <div className="grid gap-5 sm:gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="city-chip">{category}</span>
                  <span className="global-chip">{region}</span>
                  <span className="country-chip">
                    <span>{getCountryFlag(country)}</span>
                    <span>{country}</span>
                  </span>
                </div>

                <h1 className="mt-5 max-w-4xl font-[var(--font-serif)] text-[2.2rem] leading-[0.94] text-slate-950 sm:mt-6 sm:text-5xl lg:text-[4rem]">
                  {title}
                </h1>
                <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-slate-600 sm:mt-4 sm:text-base">
                  {event.description || 'Official event details, organiser information, location, dates, and save links in one clean record.'}
                </p>

                <div className="mt-5 grid gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3">
                  <div className="rounded-[1.2rem] border border-white/90 bg-white/90 p-3.5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1 sm:rounded-[1.5rem] sm:p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Dates</p>
                    <p className="mt-2 text-sm font-medium text-slate-950">{eventDate}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/90 bg-white/90 p-3.5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1 sm:rounded-[1.5rem] sm:p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Location</p>
                    <p className="mt-2 text-sm font-medium text-slate-950">
                      {city}, {country}
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/90 bg-white/90 p-3.5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1 sm:rounded-[1.5rem] sm:p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Organiser</p>
                    <p className="mt-2 text-sm font-medium text-slate-950">{organiser}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
                  {website ? (
                    <a href={website} target="_blank" rel="noreferrer" className="btn-primary px-5 py-2.5">
                      Official website
                    </a>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-500" aria-disabled="true">
                      Official website not provided
                    </span>
                  )}
                  <Link href="/calendar" className="btn-secondary px-5 py-2.5">
                    Back to calendar
                  </Link>
                  <SaveDateLinks event={event} />
                </div>
              </div>

              <EventCoverMedia
                title={title}
                city={city}
                country={country}
                region={region}
                category={category}
                coverImage={event.coverImage}
                coverImageAlt={event.coverImageAlt}
                associationName={organiser}
                featured={event.featured}
                className="h-[14.5rem] sm:h-[20rem] lg:h-[27rem]"
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
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{buildAudienceCopy(category)}</p>
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
                  <dd className="mt-2 text-base text-slate-950">{category}</dd>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Coverage region</dt>
                  <dd className="mt-2 text-base text-slate-950">{region}</dd>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Host organisation</dt>
                  <dd className="mt-2 text-base text-slate-950">{event.organiser ?? organiser}</dd>
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
