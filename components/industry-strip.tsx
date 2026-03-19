import { Reveal } from '@/components/motion/reveal';

const categories = ['Conferences', 'Training', 'Seminars', 'Associations', 'Industry Suppliers'];

export function IndustryStrip() {
  return (
    <section className="relative overflow-hidden pb-14 pt-2 sm:pb-16">
      <div className="container-shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(54,168,255,0.14),transparent_24%),radial-gradient(circle_at_80%_64%,rgba(255,104,203,0.08),transparent_22%),radial-gradient(circle_at_62%_50%,rgba(29,214,202,0.08),transparent_26%)]" />
            <div className="relative flex flex-wrap items-center gap-2.5 sm:gap-3">
              <p className="mr-2 text-xs uppercase tracking-[0.24em] text-slate-300">Platform Coverage</p>
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] px-3 py-1.5 text-xs font-medium text-slate-100"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
