'use client';

import { useEffect } from 'react';
import { isNativeApp } from '@/lib/capacitor';

/**
 * Global haptic feedback — fires a light tap on every interactive element press.
 * Mounted once in the root layout. No-ops on web.
 */
export function GlobalHaptics() {
  useEffect(() => {
    if (!isNativeApp) return;

    let Haptics: any = null;
    let ImpactStyle: any = null;

    // Pre-load the haptics module so there's no delay on first tap
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
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  return null;
}
