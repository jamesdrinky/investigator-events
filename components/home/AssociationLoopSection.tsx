import { Reveal } from '@/components/motion/reveal';

const ROW_1 = [
  { src: '/associations/abi.png', name: 'ABI' },
  { src: '/associations/cii.png', name: 'CII' },
  { src: '/associations/wad.png', name: 'WAD' },
  { src: '/associations/budeg.png', name: 'BUDEG' },
  { src: '/associations/cali.png', name: 'CALI' },
  { src: '/associations/fali.png', name: 'FALI' },
  { src: '/associations/federpol.png', name: 'Federpol' },
  { src: '/associations/intellenet.png', name: 'Intellenet' },
];

const ROW_2 = [
  { src: '/associations/eurodet.png', name: 'Eurodet' },
  { src: '/associations/snarp.png', name: 'SNARP' },
  { src: '/associations/hda.png', name: 'HDA' },
  { src: '/associations/nfes.png', name: 'NFES' },
  { src: '/associations/psld.png', name: 'PSLD' },
  { src: '/associations/lideppe.png', name: 'LIDEPPE' },
  { src: '/associations/andr.png', name: 'ANDR' },
];

function LogoChip({ src, name }: { src: string; name: string }) {
  return (
    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white p-2.5 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.12),0_0_0_1px_rgba(226,232,240,0.7)]">
      <img src={src} alt={name} className="h-full w-full object-contain" loading="lazy" />
    </div>
  );
}

function LoopRow({ logos, direction }: { logos: typeof ROW_1; direction: 'left' | 'right' }) {
  const cls = direction === 'left' ? 'animate-loop-left' : 'animate-loop-right';
  return (
    <div className="relative overflow-hidden">
      <div className={`flex w-max gap-6 ${cls}`}>
        {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
          <LogoChip key={`${logo.name}-${i}`} src={logo.src} name={logo.name} />
        ))}
      </div>
    </div>
  );
}

export function AssociationLoopSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="container-shell relative">
        <Reveal>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 sm:text-base">
            Trusted by associations worldwide
          </p>
        </Reveal>
      </div>

      <div
        className="relative mt-8 sm:mt-10"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        }}
      >
        <div className="flex flex-col gap-5">
          <LoopRow logos={ROW_1} direction="left" />
          <LoopRow logos={ROW_2} direction="right" />
        </div>
      </div>
    </section>
  );
}
