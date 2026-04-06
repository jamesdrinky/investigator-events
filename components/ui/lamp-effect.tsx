'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function LampSection({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-md bg-[#06091a] ${className}`}
    >
      {/* ── Lamp cone effect ── */}
      <div className="relative flex w-full scale-y-125 items-center justify-center isolate z-0" style={{ height: '18rem' }}>
        {/* Left cone */}
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          whileInView={{ opacity: 1, width: '30rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          viewport={{ once: true }}
          style={{
            backgroundImage: 'conic-gradient(from 70deg at center top, var(--tw-gradient-stops))',
          }}
          className="absolute inset-auto right-1/2 h-56 w-[30rem] overflow-visible bg-gradient-conic from-blue-500 via-transparent to-transparent text-white"
        >
          <div className="absolute w-full left-0 bg-[#06091a] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-full left-0 bg-[#06091a] bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        {/* Right cone */}
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          whileInView={{ opacity: 1, width: '30rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          viewport={{ once: true }}
          style={{
            backgroundImage: 'conic-gradient(from 290deg at center top, var(--tw-gradient-stops))',
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] overflow-visible bg-gradient-conic from-transparent via-transparent to-blue-500 text-white"
        >
          <div className="absolute w-40 h-full right-0 bg-[#06091a] bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-full right-0 bg-[#06091a] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* Blur layer */}
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-[#06091a] blur-2xl" />
        <div className="absolute top-1/2 z-10 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />

        {/* Glow orb */}
        <div className="absolute inset-auto z-10 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-blue-500 opacity-50 blur-3xl" />

        {/* Animated inner glow */}
        <motion.div
          initial={{ width: '8rem' }}
          whileInView={{ width: '16rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          viewport={{ once: true }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-cyan-400 blur-2xl"
        />

        {/* Bright line */}
        <motion.div
          initial={{ width: '15rem' }}
          whileInView={{ width: '30rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          viewport={{ once: true }}
          className="absolute inset-auto z-10 h-0.5 w-[30rem] -translate-y-[7rem] bg-cyan-400"
        />

        {/* Top mask */}
        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-[#06091a]" />
      </div>

      {/* ── Content area ── */}
      <div className="relative z-10 -mt-44 flex w-full flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
}
