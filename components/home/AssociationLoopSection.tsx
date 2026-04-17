import { Reveal } from '@/components/motion/reveal';

const ROW_1 = [
  { src: '/associations/cii.png', name: 'CII' },
  { src: '/associations/wad.png', name: 'WAD' },
  { src: '/associations/budeg.png', name: 'BuDEG' },
  { src: '/associations/cali.png', name: 'CALI' },
  { src: '/associations/fali.png', name: 'FALI' },
  { src: '/associations/federpol.png', name: 'Federpol' },
  { src: '/associations/intellenet.png', name: 'Intellenet' },
  { src: '/associations/ikd.png', name: 'IKD' },
  { src: '/associations/nciss.png', name: 'NCISS' },
  { src: '/associations/tali.png', name: 'TALI' },
];

const ROW_2 = [
  { src: '/associations/eurodet.png', name: 'Eurodet' },
  { src: '/associations/snarp.png', name: 'SNARP' },
  { src: '/associations/hda.png', name: 'HDA' },
  { src: '/associations/nfes.png', name: 'NFES' },
  { src: '/associations/psld.png', name: 'PSLD' },
  { src: '/associations/lideppe.png', name: 'LIDEPPE' },
  { src: '/associations/andr.png', name: 'ANDR' },
  { src: '/associations/ncapi.png', name: 'NCAPI' },
  { src: '/associations/fewa.png', name: 'FEWA' },
  { src: '/associations/oedv.png', name: 'ODV' },
  { src: '/associations/nali.webp', name: 'NALI' },
  { src: '/associations/aldonys.png', name: 'ALDONYS' },
  { src: '/associations/wapi.webp', name: 'WAPI' },
];

const INVERT_LOGOS = new Set(['ABI']);

function LogoChip({ src, name }: { src: string; name: string }) {
  return (
    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white p-2.5 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.12),0_0_0_1px_rgba(226,232,240,0.7)]">
      <img src={src} alt={name} className={`h-full w-full object-contain ${INVERT_LOGOS.has(name) ? 'brightness-0' : ''}`} loading="lazy" />
    </div>
  );
}

function LoopRow({ logos, direction }: { logos: typeof ROW_1; direction: 'left' | 'right' }) {
  const cls = direction === 'left' ? 'animate-loop-left' : 'animate-loop-right';
  // Triple the logos so the loop is seamless across any screen width
  const tripled = [...logos, ...logos, ...logos];
  return (
    <div className="relative overflow-hidden">
      <div className={`flex w-max gap-6 ${cls}`}>
        {tripled.map((logo, i) => (
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
            Associations on the calendar
          </p>
        </Reveal>
      </div>

      <div
        className="relative mt-8 w-screen left-1/2 -translate-x-1/2 sm:mt-10"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
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
