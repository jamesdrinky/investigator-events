'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Keeps the native app off stale code.
 *
 * The iOS/Android shells load the live site once and then navigate
 * client-side, so the JavaScript downloaded at launch keeps running until the
 * user force-quits — meaning shipped fixes silently never reach app users
 * (this is exactly how a fixed upload bug kept "failing" on a real device).
 *
 * Whenever the app returns to the foreground (or a browser tab becomes
 * visible again) we ask the server which build is current. If it differs from
 * the build we booted with, we reload — unless something important is in
 * flight, which uploads flag via window.__ieBusy.
 */
export function AppUpdater() {
  const reloading = useRef(false);

  const check = useCallback(async () => {
    if (reloading.current) return;
    if (typeof window !== 'undefined' && (window as { __ieBusy?: boolean }).__ieBusy) return;

    const booted = process.env.NEXT_PUBLIC_BUILD_SHA;
    if (!booted || booted === 'dev') return;

    try {
      const res = await fetch('/api/build-id', { cache: 'no-store' });
      if (!res.ok) return;
      const { sha } = (await res.json()) as { sha?: string };
      if (sha && sha !== 'dev' && sha !== booted) {
        reloading.current = true;
        // Full document load (not router refresh) so new chunks are fetched.
        window.location.reload();
      }
    } catch {
      /* offline or blocked — try again next time we're foregrounded */
    }
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    // Also check once shortly after boot, so a long-open app that was
    // backgrounded for days still self-heals on the first interaction.
    const initial = setTimeout(() => void check(), 4000);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      clearTimeout(initial);
    };
  }, [check]);

  return null;
}
