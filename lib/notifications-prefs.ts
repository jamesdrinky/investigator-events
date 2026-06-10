/**
 * Per-user email notification preferences.
 *
 * Governs ONLY the daily activity digest (app/api/cron/daily/route.ts).
 * Does NOT affect transactional/critical mail (password reset, security) or the
 * weekly newsletter — those are deliberately out of scope.
 *
 * Stored as profiles.email_prefs (jsonb). Missing/null is treated as all-on, so
 * existing users keep receiving everything until they opt out.
 */

export type NotificationCategory = 'requests' | 'events' | 'messages' | 'social';

export interface EmailPrefs {
  all: boolean;        // master switch — false pauses every activity email
  requests: boolean;   // connection requests, accepts, follows
  events: boolean;     // event approvals, association events
  messages: boolean;   // direct messages
  social: boolean;     // post likes & comments
}

export const DEFAULT_EMAIL_PREFS: EmailPrefs = {
  all: true,
  requests: true,
  events: true,
  messages: true,
  social: true,
};

/** Map a raw notification `type` to the category that gates its email. */
export function categoryForType(type: string): NotificationCategory | null {
  switch (type) {
    case 'connection_request':
    case 'connection_accepted':
    case 'follow':
      return 'requests';
    case 'event_approved':
    case 'association_event':
      return 'events';
    case 'message':
      return 'messages';
    case 'post_like':
    case 'post_comment':
      return 'social';
    default:
      return null; // uncategorised types are never suppressed
  }
}

/** Coerce whatever is in the jsonb column into a complete, safe EmailPrefs. */
export function normalizeEmailPrefs(raw: unknown): EmailPrefs {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_EMAIL_PREFS };
  const r = raw as Record<string, unknown>;
  const b = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
  return {
    all: b(r.all, true),
    requests: b(r.requests, true),
    events: b(r.events, true),
    messages: b(r.messages, true),
    social: b(r.social, true),
  };
}

/** Should a notification of this type be emailed, given the user's prefs? */
export function emailAllowed(prefs: EmailPrefs, type: string): boolean {
  if (!prefs.all) return false;
  const cat = categoryForType(type);
  if (!cat) return true;
  return prefs[cat] !== false;
}
