'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { isNativeApp } from '@/lib/capacitor';

const THRESHOLD = 80;

export function PullToRefresh() {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    // Only enable on native app or mobile
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 1024;
    if (!isMobile && !isNativeApp) return;
    const scrollTarget = document.querySelector<HTMLElement>('[data-app-content]');
    const getScrollTop = () => scrollTarget ? scrollTarget.scrollTop : window.scrollY;

    const handleTouchStart = (e: TouchEvent) => {
      if (getScrollTop() > 5) return; // Only when at top
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || getScrollTop() > 5) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff < 0) return;

      const distance = Math.min(diff * 0.4, 120); // Dampen the pull
      setPullDistance(distance);
      setPulling(distance > 10);
    };

    const handleTouchEnd = () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      if (pullDistance >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(THRESHOLD);
        // Reload after brief delay for visual feedback
        setTimeout(() => window.location.reload(), 400);
      } else {
        setPulling(false);
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance]);

  if (!pulling && !refreshing) return null;

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const ready = progress >= 1;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-center transition-transform"
      style={{ transform: `translateY(${pullDistance - 40}px)` }}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 transition-all ${
        ready ? 'scale-110' : ''
      }`}>
        <RefreshCw
          className={`h-5 w-5 text-blue-600 transition-transform ${refreshing ? 'animate-spin' : ''}`}
          style={{ transform: refreshing ? undefined : `rotate(${progress * 360}deg)` }}
        />
      </div>
    </div>
  );
}
