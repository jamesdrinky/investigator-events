'use client';

import { useEffect } from 'react';
import { isNativeApp } from '@/lib/capacitor';

/**
 * Global haptic feedback + keyboard dismiss.
 * Mounted once in the root layout. No-ops on web.
 */
export function GlobalHaptics() {
  useEffect(() => {
    // Keyboard dismiss — tap anywhere non-interactive to blur active input
    const dismissHandler = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable]')) return;
      const active = document.activeElement as HTMLElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
        active.blur();
      }
    };
    document.addEventListener('touchstart', dismissHandler, { passive: true });

    if (!isNativeApp) {
      return () => document.removeEventListener('touchstart', dismissHandler);
    }

    let Haptics: any = null;
    let ImpactStyle: any = null;

    import('@capacitor/haptics').then((mod) => {
      Haptics = mod.Haptics;
      ImpactStyle = mod.ImpactStyle;
    }).catch(() => {});

    // Use click (not pointerdown) so haptics only fire on actual taps, not scroll starts
    const handler = () => {
      if (!Haptics) return;
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    };
    const wiredElements = new WeakSet<Element>();

    // Only attach to buttons and links — not inputs/selects (those have their own feedback)
    const addListeners = () => {
      document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
        if (wiredElements.has(el)) return;
        wiredElements.add(el);
        el.addEventListener('click', handler, { passive: true });
      });
    };

    // Initial attach + re-attach on DOM changes (new content loaded)
    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.removeEventListener('touchstart', dismissHandler);
    };
  }, []);

  return null;
}
