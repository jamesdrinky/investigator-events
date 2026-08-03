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

type SubjectInputs = {
  heroTitle?: string;
  heroDaysAway?: number;
  otherCount: number;
  cities: string[];
  countries: number;
  upcomingCount: number;
};

/**
 * Rotate the subject format week by week so Monday's email never reads
 * identically twice in a row. A hand-written override always wins.
 */
export function buildRotatingWeeklySubject(
  inputs: SubjectInputs,
  override?: string | null,
  now = new Date()
): string {
  if (override?.trim()) return override.trim();

  const { heroTitle, heroDaysAway, otherCount, cities, countries, upcomingCount } = inputs;
  const week = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));

  const classic = heroTitle
    ? `${heroTitle} + ${otherCount} more — Weekly Briefing`
    : `Weekly Briefing — ${upcomingCount} event${upcomingCount !== 1 ? 's' : ''} across ${countries} countries`;

  const countdown = heroTitle && heroDaysAway && heroDaysAway > 0
    ? `${heroDaysAway} days to ${heroTitle} — plus ${otherCount} more PI events`
    : classic;

  const cityLine = cities.length >= 3
    ? `${cities[0]}, ${cities[1]} & ${cities[2]} — where investigators are heading next`
    : classic;

  const rotation = [classic, countdown, cityLine];
  return rotation[week % rotation.length];
}

export function getWeeklyNewsletterAppPush(edition: WeeklyNewsletterEdition) {
  // app-launch = full hero promo; standard = a small compact strip (still
  // promotes the app, without dominating the top of every weekly email).
  return edition === 'app-launch'
    ? { size: 'hero' as const, region: 'available' as const }
    : { size: 'compact' as const, region: 'available' as const };
}
