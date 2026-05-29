/**
 * Email normalization + bot-pattern heuristics specific to the attack
 * waves we've seen on the newsletter endpoint.
 *
 * Gmail dot-trick:
 *   Gmail explicitly ignores dots in the local part — `m.a.rcus@gmail.com`
 *   and `marcus@gmail.com` both deliver to the same inbox. Spammers use
 *   this to bypass per-email rate limits: each randomly-dotted variant
 *   looks like a "new" email to us. We normalize by stripping all dots
 *   from gmail.com / googlemail.com local parts before duplicate checks.
 *
 * Plus-addressing:
 *   Gmail treats `marcus+anything@gmail.com` as `marcus@gmail.com`. Same
 *   inbox. We strip the `+suffix` for both Gmail and most other providers
 *   that respect it.
 *
 * Gmail dot-bombing detector:
 *   Gmail's own signup form does NOT allow consecutive dots (`..`) or
 *   more than around 3 dots in a username. So any address with `..` OR
 *   with 4+ dots in the local part is virtually guaranteed to be a bot
 *   injecting random dots on top of a real victim's address (classic
 *   subscription-bombing technique).
 */

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

export function normalizeEmail(rawEmail: string): string {
  const email = rawEmail.trim().toLowerCase();
  const atIndex = email.lastIndexOf('@');
  if (atIndex < 1) return email;

  let local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  // Strip everything after the first plus sign (subaddressing)
  const plusIndex = local.indexOf('+');
  if (plusIndex >= 0) {
    local = local.slice(0, plusIndex);
  }

  // Gmail-specific: dots are meaningless, collapse to a canonical form
  if (GMAIL_DOMAINS.has(domain)) {
    local = local.replace(/\./g, '');
    // Both googlemail.com and gmail.com share the same inbox space —
    // canonicalize to gmail.com for duplicate detection.
    return `${local}@gmail.com`;
  }

  return `${local}@${domain}`;
}

/**
 * Returns true if the Gmail address shows a dot pattern Gmail itself
 * does not allow at signup — meaning a bot has injected dots into a
 * real victim's address to bypass rate-limits / duplicate checks.
 *
 * Triggers on:
 *   - any consecutive dots (`..`) — Gmail rejects these at registration
 *   - leading or trailing dots — also Gmail-invalid
 *   - 4 or more dots in the local part — extremely rare in real signups
 *
 * Non-Gmail addresses pass through this check (return false).
 */
export function looksLikeGmailDotTrick(rawEmail: string): boolean {
  const email = rawEmail.trim().toLowerCase();
  const atIndex = email.lastIndexOf('@');
  if (atIndex < 1) return false;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (!GMAIL_DOMAINS.has(domain)) return false;

  if (local.includes('..')) return true;
  if (local.startsWith('.') || local.endsWith('.')) return true;
  const dotCount = (local.match(/\./g) ?? []).length;
  if (dotCount >= 4) return true;

  return false;
}
