import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventCard } from '@/components/event-card';
import { Reveal } from '@/components/motion/reveal';
import { SaveDateLinks } from '@/components/save-date-links';
import { fetchAllEvents, fetchEventBySlug } from '@/lib/data/events';
import { formatEventDate, parseDate } from '@/lib/utils/date';
import { getCountryFlag } from '@/lib/utils/location';
import { getAssociationBrandLogoSrc } from '@/lib/utils/association-branding';

export const dynamic = 'force-dynamic';

async function resolveEvent(slug: string) {
  if (!slug) return { event: null, events: [] };
  const [event, events] = await Promise.all([fetchEventBySlug(slug), fetchAllEvents()]);
  return { event, events };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { event } = await resolveEvent(params?.slug?.trim() ?? '');
  if (!event) return { title: 'Event Not Found | Investigator Events' };
  return {
    title: `${event.title} | Investigator Events`,
    description: `${event.title} in ${event.city}, ${event.country}. ${event.description || ''}`.trim(),
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug?.trim();
  if (!slug) notFound();
  const { event, events } = await resolveEvent(slug);
  if (!event) notFound();

  const category = event.category ?? 'Event';
  const region = event.region ?? 'Global';
  const country = event.country ?? 'Unknown';
  const city = event.city ?? 'TBC';
  const organiser = event.association ?? event.organiser ?? 'TBC';
  const website = event.website?.trim();
  const title = event.title ?? 'Event';
  const eventDate = event.date ? formatEventDate(event) : 'TBC';
  const logoSrc = getAssociationBrandLogoSrc(organiser);
  const imageSrc = (event.image_path && /^(\/(cities|events|images)\/|https?:\/\/)/.test(event.image_path) ? event.image_path : event.coverImage) ?? '/cities/fallback.jpg';
  // Video support — if the event has a video URL field
  const videoUrl = (event as any).videoUrl as string | undefined;

  const relatedEvents = events
    .filter((e) => e.id !== event.id && e.eventScope === 'main')
    .filter((e) => e.region === event.region || e.category === event.category || e.country === event.country)
    .sort((a, b) => Math.abs(parseDate(a.date).getTime() - parseDate(event.date ?? a.date).getTime()) - Math.abs(parseDate(b.date).getTime() - parseDate(event.date ?? b.date).getTime()))
    .slice(0, 3);

  return (
    <section className="relative overflow-hidden">
      {/* ── Hero — full-width cover image ── */}
      <div className="relative h-[28rem] w-full overflow-hidden sm:h-[36rem] lg:h-[40rem]">
        <Image src={imageSrc} alt={title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Association logo — top-left */}
        {logoSrc && (
          <div className="absolute left-4 top-20 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/90 p-2 shadow-xl sm:left-8 sm:top-24 sm:h-16 sm:w-16">
            <Image src={logoSrc} alt={organiser} width={48} height={48} className="h-auto max-h-10 w-auto max-w-10 object-contain sm:max-h-12 sm:max-w-12" />
          </div>
        )}

        {/* Hero content over image */}
        <div className="absolute inset-x-0 bottom-0 pb-8 sm:pb-12">
          <div className="container-shell">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-200">{category}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">{region}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">{getCountryFlag(country)} {country}</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-[2rem] font-bold leading-[0.95] tracking-[-0.04em] text-white sm:text-[3rem] lg:text-[4rem]">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container-shell relative py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left column — main content */}
          <div className="space-y-6">
            {/* Quick info pills */}
            <Reveal>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">Date</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">{eventDate}</p>
                </div>
                <div className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">Location</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">{city}, {country}</p>
                </div>
                <div className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">Organiser</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">{organiser}</p>
                </div>
              </div>
            </Reveal>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              {website ? (
                <a href={website} target="_blank" rel="noreferrer" className="btn-primary px-6 py-3">Official website</a>
              ) : null}
              <Link href="/calendar" className="btn-secondary px-5 py-2.5">Back to calendar</Link>
              <SaveDateLinks event={event} />
            </div>

            {/* Video section — if event has video */}
            {videoUrl && (
              <Reveal>
                <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-black shadow-lg">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    {videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video className="absolute inset-0 h-full w-full object-cover" controls preload="metadata" playsInline>
                        <source src={videoUrl} type="video/mp4" />
                      </video>
                    )}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Description */}
            <Reveal>
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950">About this event</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {event.description || 'Full event details, organiser information, and dates in one clean record.'}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right column — sidebar */}
          <div className="space-y-4">
            {/* Event details card */}
            <Reveal delay={0.04}>
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-950">Event details</h3>
                <dl className="mt-4 space-y-3">
                  {[
                    { label: 'Event type', value: category },
                    { label: 'Region', value: region },
                    { label: 'Host', value: event.organiser ?? organiser },
                    { label: 'Association', value: event.association ?? 'Not specified' },
                    { label: 'Scope', value: event.eventScope === 'main' ? 'Major event' : 'Additional listing' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <dt className="text-xs text-slate-400">{item.label}</dt>
                      <dd className="text-right text-sm font-medium text-slate-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            {/* Submit CTA */}
            <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/50 p-5">
              <p className="text-sm font-bold text-slate-950">Have an event to list?</p>
              <p className="mt-1 text-xs text-slate-500">Free to submit, reviewed within 48 hours.</p>
              <Link href="/submit-event" className="btn-primary mt-3 w-full px-4 py-2.5 text-sm">Submit an event</Link>
            </div>
          </div>
        </div>

        {/* Related events */}
        {relatedEvents.length > 0 && (
          <Reveal delay={0.08}>
            <div className="mt-12">
              <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">Related events</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedEvents.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
