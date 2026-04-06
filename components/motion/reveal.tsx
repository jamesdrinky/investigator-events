'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode, useState, useEffect } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
}

export function Reveal({ children, className, delay = 0, y = 18, x = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  // Mobile: simpler animation (no blur, no scale — just fade + translate)
  if (isMobile) {
    return (
      <motion.div
        className={className}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: y * 0.6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, delay: Math.min(delay, 0.1), ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    );
  }

  // Desktop: full animation with scale (but no blur — still expensive on some GPUs)
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y, x, scale: 0.985 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.72, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
