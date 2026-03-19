import { Reveal } from '@/components/motion/reveal';

const steps = [
  {
    title: 'Events are curated and published',
    text: 'Event information is structured, quality-checked, and presented in a clear global format.'
  },
  {
    title: 'Investigators discover events globally',
    text: 'Professionals quickly identify relevant conferences, seminars, and training opportunities by region and category.'
  },
  {
    title: 'Sponsors and partners reach the industry',
    text: 'Commercial partners gain focused visibility with a specialist audience of investigation professionals.'
  }
];

export function HomeHowItWorks() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="container-shell">
        <Reveal className="mb-10 max-w-3xl">
          <p className="eyebrow">How It Works</p>
          <h2 className="section-title">A Practical Workflow for a Global Niche Industry</h2>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <article className="lux-panel relative h-full overflow-hidden p-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(139,169,255,0.08),transparent_28%)]" />
                <p className="text-xs uppercase tracking-[0.22em] text-accent2">Step {index + 1}</p>
                <h3 className="relative mt-4 font-[var(--font-serif)] text-2xl text-white">{step.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-slate-300">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
