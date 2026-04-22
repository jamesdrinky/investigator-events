import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';
import { getEnvVar } from '@/lib/supabase/env';

export function createSupabasePublicServerClient() {
  return createClient<Database>(getEnvVar('NEXT_PUBLIC_SUPABASE_URL'), getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    auth: {
      persistSession: false
    },
    global: {
      fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' })
    }
  });
}
