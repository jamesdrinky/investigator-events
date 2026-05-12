'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export interface CurrentUserInfo {
  id: string | null;
  avatarUrl: string | null;
  fullName: string | null;
}

// Module-level cache. The first card / consumer that mounts kicks off
// the fetch; every other consumer reads the cached value synchronously
// on subsequent renders. Avoids the calendar firing the same
// auth.getUser + profile fetch ~45 times on page load.
let cached: CurrentUserInfo | null = null;
let inflight: Promise<CurrentUserInfo> | null = null;

async function fetchCurrentUser(): Promise<CurrentUserInfo> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: auth } = await supabase.auth.getUser();
    const id = auth?.user?.id ?? null;
    let avatarUrl: string | null = null;
    let fullName: string | null = null;
    if (id) {
      const { data: p } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', id)
        .single();
      avatarUrl = p?.avatar_url ?? null;
      fullName = p?.full_name ?? null;
    }
    cached = { id, avatarUrl, fullName };
    return cached;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function useCurrentUser(): CurrentUserInfo {
  const [user, setUser] = useState<CurrentUserInfo>(cached ?? { id: null, avatarUrl: null, fullName: null });

  useEffect(() => {
    if (cached) {
      setUser(cached);
      return;
    }
    let mounted = true;
    fetchCurrentUser().then((info) => {
      if (mounted) setUser(info);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return user;
}
