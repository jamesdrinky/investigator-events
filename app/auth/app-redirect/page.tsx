'use client';

import { useEffect } from 'react';
import { closeInAppBrowser } from '@/lib/capacitor';

/**
 * This page is hit after OAuth callback when running inside the native app.
 * It closes the in-app browser (SFSafariViewController) so the user
 * returns to the main webview, which will pick up the auth session.
 */
export default function AppRedirectPage() {
  useEffect(() => {
    // Close the in-app browser — the main webview will reload with the session
    closeInAppBrowser();

    // Fallback: if browser doesn't close (e.g. on web), redirect to profile
    const timeout = setTimeout(() => {
      window.location.href = '/profile';
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-500">Signing you in...</p>
      </div>
    </div>
  );
}
