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

    const handler = (e: PointerEvent) => {
      if (!Haptics) return;
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [role="button"], input[type="checkbox"], input[type="radio"], select, [data-haptic]');
      if (interactive) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
    };

    document.addEventListener('pointerdown', handler, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', handler);
      document.removeEventListener('touchstart', dismissHandler);
    };
  }, []);

  return null;
}
