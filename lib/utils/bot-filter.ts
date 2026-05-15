/**
 * Heuristic to detect bot-signup accounts.
 *
 * Pattern: bots that get past the email signup form usually arrive with a
 * randomly-generated string as their full_name — no spaces, all lowercase
 * (or all alphanumeric), 9+ characters. Like "hukhqaxynhbs" or "qwerty1234".
 * Real human names always contain a space ("John Smith") or are short.
 *
 * This is a coarse filter — meant to be applied to public listings (forum,
 * discover, association members) so junk accounts don't pollute the UX.
 * The accounts still exist in the database; admins can review them in the
 * moderation panel.
 */
export function looksLikeBotProfile(profile: { full_name?: string | null; avatar_url?: string | null; specialisation?: string | null; headline?: string | null; country?: string | null }): boolean {
  const name = profile.full_name?.trim() ?? '';
  if (!name) return true;

  // Random-string heuristic: single token of 9+ alphanumeric chars, no spaces.
  // Catches "hukhqaxynhbs", "qwerty1234", etc.
  if (!name.includes(' ') && name.length >= 9 && /^[a-z0-9]+$/i.test(name)) return true;

  // Profile is so empty it's almost certainly not a real user. Real PIs add at
  // least one of: avatar, headline, specialisation, country during onboarding.
  // Empty bot profiles only have a name and nothing else.
  const hasAnySignal = !!(profile.avatar_url || profile.headline || profile.specialisation || profile.country);
  if (!hasAnySignal) return true;

  return false;
}
