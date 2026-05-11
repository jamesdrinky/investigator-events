'use client';

import { type ReactNode, useRef, useEffect, useState } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
}

export function Reveal({ children, className, delay = 0, y = 24, x = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // On mobile, drop the y-translate — the slide-up animation makes
  // scrolling feel like the page is 'pulling upwards' as each section
  // crosses the IntersectionObserver threshold. Keep the opacity fade
  // for a gentle reveal that doesn't move pixels around.
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const restingTransform = isMobile ? 'none' : `translate3d(${x}px, ${y}px, 0)`;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : restingTransform,
        transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
        willChange: isVisible ? 'auto' : 'opacity',
      }}
    >
      {children}
    </div>
  );
}
