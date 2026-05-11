'use client';

import { useEffect, useState, type ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger fade-in on mount
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div
      className="flex min-h-full flex-1 flex-col"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {children}
    </div>
  );
}
