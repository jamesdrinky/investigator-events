/**
 * Detects the random-alphanumeric name pattern used by signup bots.
 *
 * The current attacker pattern: a single token of 14-22 mixed-case
 * alphanumeric chars (e.g. "JfffYTpiCGumdNhfsTAw", "mFspKZhOxcwdnyXwZi").
 * Goal: trigger our welcome email to victim inboxes (subscription bomb).
 *
 * Real users almost always include a space — "John Smith", "James O'Brien",
 * "山田駿" (passes — not alphanumeric), "Mary-Anne" (passes — has hyphen).
 * The threshold of 14 chars + no space + alphanumeric-only is the tightest
 * heuristic that catches every observed bot without false-positiving on
 * realistic full names typed without spaces (rare but possible).
 */
export function looksLikeRandomSignupName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 14) return false;
  // Must be a single token with no whitespace anywhere
  if (/\s/.test(trimmed)) return false;
  // Must be purely [A-Za-z0-9] — bots don't use hyphens, apostrophes, unicode
  return /^[A-Za-z0-9]+$/.test(trimmed);
}
