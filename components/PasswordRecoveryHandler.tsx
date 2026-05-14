'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

/**
 * Global listener for Supabase PASSWORD_RECOVERY auth events.
 *
 * Problem: even when redirectTo on resetPasswordForEmail points to
 * /auth/callback?next=/profile/reset-password, Supabase sometimes falls
 * back to the Site URL (the bare homepage) because the allow-list
 * matching is fussy about wildcards and query strings. So the user
 * clicks the email link, Supabase verifies the token, and lands them at
 * https://investigatorevents.com/?code=... with no handler.
 *
 * Solution: the Supabase JS client (with detectSessionInUrl: true, the
 * default) automatically exchanges the ?code= for a session on any page
 * load and fires PASSWORD_RECOVERY when the code is from a recovery
 * flow. We just listen globally and route to /profile/reset-password
 * regardless of where the user landed.
 */
export function PasswordRecoveryHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Avoid an infinite loop if the user is already on the reset page.
        if (pathname !== '/profile/reset-password') {
          router.push('/profile/reset-password');
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
