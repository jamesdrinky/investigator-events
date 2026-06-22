export type WeeklyNewsletterEdition = 'standard' | 'app-launch';

export const APP_LAUNCH_NEWSLETTER_SUBJECT = 'Investigator Events is live on the App Store — Weekly Briefing';

export function getWeeklyNewsletterEdition(value: string | null | undefined): WeeklyNewsletterEdition {
  // Default to the standard weekly edition — the app-launch promo has run its
  // course (same subject + hero banner for weeks). Pass ?edition=app-launch to
  // explicitly re-run the launch promo.
  return value === 'app-launch' ? 'app-launch' : 'standard';
}

export function getWeeklyNewsletterSubject(edition: WeeklyNewsletterEdition, fallbackSubject: string) {
  if (edition === 'app-launch') return APP_LAUNCH_NEWSLETTER_SUBJECT;
  // Standard editions use the content-driven subject built from the week's events.
  return fallbackSubject;
}

export function getWeeklyNewsletterAppPush(edition: WeeklyNewsletterEdition) {
  // app-launch = full hero promo; standard = a small compact strip (still
  // promotes the app, without dominating the top of every weekly email).
  return edition === 'app-launch'
    ? { size: 'hero' as const, region: 'available' as const }
    : { size: 'compact' as const, region: 'available' as const };
}
