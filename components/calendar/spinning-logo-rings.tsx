'use client';

import Image from 'next/image';

const RING_1 = [
  '/associations/abi.png', '/associations/wad.png', '/associations/cii.png',
  '/associations/ikd.png', '/associations/federpol.png', '/associations/intellenet.png',
  '/associations/eurodet.png', '/associations/budeg.png',
];
const RING_2 = [
  '/associations/snarp.png', '/associations/hda.png', '/associations/cali.png',
  '/associations/fali.png', '/associations/nfes.png', '/associations/psld.png',
  '/associations/lideppe.png', '/associations/andr.png', '/associations/nciss.png',
  '/associations/tali.png',
];
const RING_3 = [
  '/associations/oedv.png', '/associations/ckds.png', '/associations/fdde.png',
  '/associations/daf.png', '/associations/syl.png', '/associations/ibpi.png',
  '/associations/pdpr.png', '/associations/ard.png', '/associations/sad.png',
  '/associations/dzrs.png', '/associations/ncapi.png', '/associations/fewa.png',
];

function Ring({ logos, size, duration, reverse = false }: { logos: string[]; size: number; duration: string; reverse?: boolean }) {
  const r = size / 2;
  const step = 360 / logos.length;

  return (
    <div
      className="absolute rounded-full border border-slate-200/30"
      style={{
        width: size,
        height: size,
        left: '50%',
        top: '50%',
        animation: `${reverse ? 'spin-ring-reverse' : 'spin-ring'} ${duration} linear infinite`,
      }}
    >
      {logos.map((src, i) => {
        const angle = (step * i * Math.PI) / 180;
        const x = r + Math.cos(angle) * (r - 22) - 20;
        const y = r + Math.sin(angle) * (r - 22) - 20;

        return (
          <div
            key={src}
            className="absolute flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/40 bg-white/80 p-1.5 shadow-sm"
            style={{
              left: x,
              top: y,
              animation: `${reverse ? 'counter-spin' : 'counter-spin-reverse'} ${duration} linear infinite`,
            }}
          >
            <Image src={src} alt="" width={32} height={32} className="h-auto max-h-6 w-auto max-w-6 object-contain opacity-50" />
          </div>
        );
      })}
    </div>
  );
}

export function SpinningLogoRings() {
  return (
    <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[55%] overflow-hidden lg:block">
      {/* Position the center of rings at center-right, clipped by overflow */}
      <div className="relative h-full w-full">
        <div className="absolute -right-[10%] top-[10%]" style={{ width: 520, height: 520 }}>
          <Ring logos={RING_1} size={220} duration="50s" />
          <Ring logos={RING_2} size={360} duration="65s" reverse />
          <Ring logos={RING_3} size={500} duration="80s" />

          {/* Center dot */}
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/30" />
        </div>
      </div>

      {/* Fade into the gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,transparent_30%,#f0f4ff_65%)]" />
    </div>
  );
}
