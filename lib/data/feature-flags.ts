import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

export const VIDEO_SUBMISSIONS_FLAG = 'video_submissions';

/**
 * Read a feature flag. Reads go through the service-role admin client (the
 * feature_flags table has no public RLS policies). Defaults to `defaultValue`
 * (true) if the row is missing or the read errors, so a transient DB hiccup
 * never silently locks a feature that was meant to be open.
 */
export async function isFeatureEnabled(key: string, defaultValue = true): Promise<boolean> {
  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await supabase
    .from('feature_flags' as any)
    .select('enabled')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error(`isFeatureEnabled(${key}) failed:`, error.message);
    return defaultValue;
  }
  if (!data) return defaultValue;
  return Boolean((data as any).enabled);
}

/** Set a feature flag (admin only — callers must gate on the admin session). */
export async function setFeatureFlag(key: string, enabled: boolean): Promise<void> {
  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase
    .from('feature_flags' as any)
    .upsert({ key, enabled, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) {
    console.error(`setFeatureFlag(${key}) failed:`, error.message);
    throw new Error('Failed to update feature flag');
  }
}
