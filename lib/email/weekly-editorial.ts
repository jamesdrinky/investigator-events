import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Hand-written weekly newsletter content — the part a generated email can't
 * fake. One row per issue week in newsletter_editorial; when no row exists for
 * the current week the email quietly falls back to the fully generated layout,
 * so a missed week never blocks the send.
 */
export type WeeklyEditorial = {
  weekOf: string;
  introByline: string | null;
  introText: string | null;
  spotlightKicker: string | null;
  spotlightTitle: string | null;
  spotlightBody: string | null;
  spotlightCtaLabel: string | null;
  spotlightCtaUrl: string | null;
  spotlightImageUrl: string | null;
  subjectOverride: string | null;
};

/** Newest row dated within the last 7 days — stale editorial never re-runs. */
export async function fetchCurrentEditorial(
  supabase: SupabaseClient
): Promise<WeeklyEditorial | null> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data, error } = await supabase
    .from('newsletter_editorial' as never)
    .select('*')
    .gte('week_of', weekAgo)
    .lte('week_of', new Date().toISOString().slice(0, 10))
    .order('week_of', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, string | null>;
  return {
    weekOf: row.week_of ?? '',
    introByline: row.intro_byline,
    introText: row.intro_text,
    spotlightKicker: row.spotlight_kicker,
    spotlightTitle: row.spotlight_title,
    spotlightBody: row.spotlight_body,
    spotlightCtaLabel: row.spotlight_cta_label,
    spotlightCtaUrl: row.spotlight_cta_url,
    spotlightImageUrl: row.spotlight_image_url,
    subjectOverride: row.subject_override,
  };
}
