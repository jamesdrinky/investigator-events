import Link from 'next/link';
import { NewsletterSignupForm } from '@/components/newsletter-signup-form';
import { WeeklyStatCards } from '@/components/weekly/weekly-stat-cards';
import { EventCoverMedia } from '@/components/event-cover-media';
import { LocationSignature } from '@/components/location-signature';
import { Reveal } from '@/components/motion/reveal';
import { SaveDateLinks } from '@/components/save-date-links';
import { WeeklyEventFeed } from '@/components/weekly-event-feed';
import { fetchAllEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { formatEventDate } from '@/lib/utils/date';
import { getEventSlug } from '@/lib/utils/event-slugs';
import { getCountryFlag } from '@/lib/utils/location';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Weekly Brief',
  description: 'A weekly view of newly added and upcoming private investigator events from the live calendar.'
};

export default async function WeeklyPage() {
  const events = await fetchAllEvents();
  const weekly = getWeeklyCollections(events);
  const leadEvent = weekly.featured[0] ?? weekly.upcoming[0] ?? weekly.newlyAdded[0] ?? null;

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="container-shell space-y-6">
        <Reveal>
          <header className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,246,255,0.9))] p-6 shadow-[0_32px_76px_-42px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(37,99,235,0.1),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(45,212,191,0.08),transparent_20%),radial-gradient(circle_at_62%_80%,rgba(139,92,246,0.08),transparent_24%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <p className="eyebrow">Weekly Brief</p>
                <h1 className="section-title">A simple weekly read on new and upcoming events.</h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                  Use this page to check what was added recently, what is coming up soon, and which event is worth opening next.
                </p>
                <WeeklyStatCards newlyAddedCount={weekly.newlyAdded.length} upcomingCount={weekly.upcoming.length} />
              </div>

              {leadEvent ? (
                <article className="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-5 shadow-[0_24px_54px_-34px_rgba(15,23,42,0.16)]">
                  <EventCoverMedia
                    title={leadEvent.title}
                    city={leadEvent.city}
                    country={leadEvent.country}
                    region={leadEvent.region}
                    category={leadEvent.category}
                    imagePath={leadEvent.image_path}
                    coverImage={leadEvent.coverImage}
                    coverImageAlt={leadEvent.coverImageAlt}
                    associationName={leadEvent.association ?? leadEvent.organiser}
                    featured={leadEvent.featured}
                    priorityLabel="Weekly lead"
                  />
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="country-chip">
                      <span>{getCountryFlag(leadEvent.country)}</span>
                      <span>{leadEvent.country}</span>
                    </span>
                    <span className="global-chip">{leadEvent.region}</span>
                    <span className="city-chip">{leadEvent.category}</span>
                  </div>
                  <h2 className="mt-5 font-[var(--font-serif)] text-4xl leading-[0.98] text-slate-950">{leadEvent.title}</h2>
                  <p className="mt-3 text-sm text-slate-600">{formatEventDate(leadEvent)}</p>
                  <div className="mt-4">
                    <LocationSignature city={leadEvent.city} country={leadEvent.country} region={leadEvent.region} />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={`/events/${getEventSlug(leadEvent)}`} className="btn-primary px-5 py-2.5">
                      Open event detail
                    </Link>
                    <SaveDateLinks event={leadEvent} />
                  </div>
                </article>
              ) : null}
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-6">
              <WeeklyEventFeed
                eyebrow="Newly Added Events"
                title="New event intake in the last 7 days"
                events={weekly.newlyAdded}
                emptyText="No new events have been approved in the last seven days."
              />
              <WeeklyEventFeed
                eyebrow="Upcoming Events"
                title="Approaching in the next 30 days"
                events={weekly.upcoming}
                emptyText="No upcoming events are currently scheduled in the next 30 days."
              />
            </div>

            <div className="grid gap-6">
              <article className="surface-flat relative overflow-hidden p-6 sm:p-7">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(41,211,163,0.06),transparent_24%)]" />
                <div className="relative">
                  <p className="eyebrow">Why it matters</p>
                  <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-slate-950">A faster way to scan the calendar.</h2>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    Check this page when you do not want to browse the full calendar. It is the quickest way to see fresh listings, near-term dates, and where activity is building.
                  </p>
                </div>
              </article>

              <article id="signup" className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_24px_54px_-34px_rgba(15,23,42,0.16)] sm:p-7">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,179,255,0.08),transparent_24%),radial-gradient(circle_at_80%_70%,rgba(123,124,255,0.07),transparent_22%)]" />
                <div className="relative">
                  <p className="eyebrow">Email Updates</p>
                  <h2 className="mt-4 font-[var(--font-serif)] text-3xl text-slate-950">Get the weekly update by email.</h2>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    If you would rather receive the update than check manually, subscribe here. The email focuses on new events, approaching dates, and the most useful listing to open next.
                  </p>
                  <div className="mt-6">
                    <NewsletterSignupForm />
                  </div>
                </div>
              </article>
            </div>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
