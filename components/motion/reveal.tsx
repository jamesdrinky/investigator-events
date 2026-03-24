'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
}

export function Reveal({ children, className, delay = 0, y = 18, x = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y, x, scale: 0.985, filter: 'blur(10px)' }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduceMotion ? 0.3 : 0.72, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
