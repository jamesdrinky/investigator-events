import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Sanitise a display name into a URL-safe username slug.
 * Returns null only when the input is completely empty / non-alphanumeric.
 */
export function slugifyUsername(name: string | null | undefined): string | null {
  if (!name) return null;
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')      // trim leading/trailing hyphens
    .replace(/-{2,}/g, '-');       // collapse double hyphens
  return slug || null;
}

/**
 * Generate a unique username for a new user.
 *
 * Tries the base slug first, then appends -2, -3, … until it finds one that
 * doesn't exist in the profiles table.  If the name is completely unusable,
 * falls back to "user-<short-id>".
 *
 * @param supabase  An admin or service-role Supabase client (needs to read profiles)
 * @param name      The user's display name
 * @param userId    The user's auth id (used for fallback and to exclude self)
 */
export async function generateUniqueUsername(
  supabase: SupabaseClient,
  name: string | null | undefined,
  userId: string,
): Promise<string> {
  let base = slugifyUsername(name);

  // Fallback if the name produced nothing usable
  if (!base) {
    base = `user-${userId.slice(0, 8)}`;
  }

  // Check if the base username is free (excluding the user's own row)
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', base)
    .neq('id', userId)
    .maybeSingle();

  if (!existing) return base;

  // Collision — try base-2, base-3, … up to base-99
  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`;
    const { data: taken } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', candidate)
      .neq('id', userId)
      .maybeSingle();
    if (!taken) return candidate;
  }

  // Extremely unlikely fallback
  return `${base}-${userId.slice(0, 8)}`;
}
