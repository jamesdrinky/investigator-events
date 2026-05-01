'use client';

import { useEffect, useState } from 'react';

export function TopLoadingBar() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Intercept link clicks to show loading bar
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) return;
      if (anchor.target === '_blank') return;

      // Same page — skip
      if (href === window.location.pathname) return;

      // Start loading animation
      setLoading(true);
      setProgress(0);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Animate progress
  useEffect(() => {
    if (!loading) return;

    // Fast start, slow middle, complete on page load
    const steps = [30, 50, 65, 75, 82, 88];
    let step = 0;
    const interval = setInterval(() => {
      if (step < steps.length) {
        setProgress(steps[step]);
        step++;
      }
    }, 200);

    // Complete when page actually loads
    const complete = () => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    };

    // Listen for the page to finish loading
    window.addEventListener('load', complete);

    // Fallback: complete after 3s regardless
    const timeout = setTimeout(complete, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener('load', complete);
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] h-[2px]">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        style={{
          width: `${progress}%`,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}
