import { Reveal } from '@/components/motion/reveal';

const audiences = [
  {
    title: 'Organisers',
    text: 'Publish events with greater visibility, avoid unnecessary date overlap, and align with global industry timelines.'
  },
  {
    title: 'Investigators',
    text: 'Find credible conferences, specialist seminars, and training opportunities relevant to your practice and region.'
  },
  {
    title: 'Sponsors / Industry Partners',
    text: 'Place your brand in front of decision-makers across agencies, legal teams, and investigative service providers.'
  }
];

export function HomeWhoItsFor() {
  return (
    <section className="section-pad relative overflow-hidden pt-0">
      <div className="container-shell">
        <Reveal className="mb-10 max-w-3xl">
          <p className="eyebrow">Who It&apos;s For</p>
          <h2 className="section-title">Built for the Entire Investigator Events Ecosystem</h2>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {audiences.map((audience, index) => (
            <Reveal key={audience.title} delay={index * 0.08}>
              <article className="lux-panel relative h-full overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/45">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(127,228,199,0.07),transparent_24%)]" />
                <h3 className="relative font-[var(--font-serif)] text-2xl text-white">{audience.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-slate-300">{audience.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
