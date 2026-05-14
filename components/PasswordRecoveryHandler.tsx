'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

/**
 * Global handler for Supabase password recovery flow.
 *
 * @supabase/ssr's createBrowserClient does NOT auto-detect session params
 * in the URL the way the older supabase-js client did. So when the user
 * clicks a password reset email link and Supabase redirects them to your
 * site, the auth params (?code= for PKCE, or #access_token+type=recovery
 * for implicit flow) just sit there unprocessed. No PASSWORD_RECOVERY
 * event ever fires, no session gets created, and the user sees the
 * homepage with weird URL params and nothing happens.
 *
 * This handler:
 * 1. On mount, checks the URL for recovery params (both ?code= and
 *    #access_token= variants — Supabase has used both over time).
 * 2. Manually exchanges them for a session via exchangeCodeForSession
 *    (PKCE) or setSession (implicit hash).
 * 3. On success, pushes to /profile/reset-password.
 * 4. Also keeps the onAuthStateChange listener as a backstop for any
 *    flow that does fire PASSWORD_RECOVERY natively.
 */
export function PasswordRecoveryHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/profile/reset-password' || pathname?.startsWith('/auth/')) return;
    if (typeof window === 'undefined') return;

    const supabase = createSupabaseBrowserClient();
    const url = new URL(window.location.href);

    const goToReset = () => {
      // Clear the URL params so a refresh doesn't re-trigger the flow.
      window.history.replaceState({}, '', window.location.pathname);
      router.push('/profile/reset-password');
    };

    // PKCE flow: ?code=... in the query string.
    const code = url.searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.session) goToReset();
      });
    }

    // Implicit flow: #access_token=...&refresh_token=...&type=recovery in the hash.
    if (window.location.hash && window.location.hash.includes('access_token=')) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      if (accessToken && refreshToken && type === 'recovery') {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
          if (!error) goToReset();
        });
      }
    }

    // Backstop: also listen for the native event in case Supabase fires it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') goToReset();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
