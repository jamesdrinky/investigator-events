import { track } from '@vercel/analytics';

/**
 * Funnel events for the relaunch. One narrow vocabulary so the Vercel
 * Analytics dashboard reads as a funnel: visit (automatic page views) →
 * signup_completed → event_rsvp / newsletter_subscribed / event_submitted.
 * Never throws — analytics must not break product flows.
 */
export type FunnelEvent =
  | 'signup_completed'
  | 'event_rsvp'
  | 'newsletter_subscribed'
  | 'event_submitted'
  | 'event_shared'
  | 'widget_snippet_copied'
  | 'partner_request_submitted';

export function trackEvent(name: FunnelEvent, props?: Record<string, string | number | boolean>) {
  try {
    track(name, props);
  } catch {
    /* analytics unavailable (native shell offline, blockers) — ignore */
  }
}
