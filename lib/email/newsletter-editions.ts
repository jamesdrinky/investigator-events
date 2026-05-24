export type WeeklyNewsletterEdition = 'standard' | 'app-launch';

export const APP_LAUNCH_NEWSLETTER_SUBJECT = 'Investigator Events is live on the App Store — Weekly Briefing';

export function getWeeklyNewsletterEdition(value: string | null | undefined): WeeklyNewsletterEdition {
  return value === 'standard' ? 'standard' : 'app-launch';
}

export function getWeeklyNewsletterSubject(edition: WeeklyNewsletterEdition, fallbackSubject: string) {
  if (edition === 'app-launch') return APP_LAUNCH_NEWSLETTER_SUBJECT;
  return fallbackSubject;
}

export function getWeeklyNewsletterAppPush(edition: WeeklyNewsletterEdition) {
  if (edition !== 'app-launch') return null;
  return { size: 'hero' as const, region: 'available' as const };
}
