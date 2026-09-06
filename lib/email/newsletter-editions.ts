export type WeeklyNewsletterEdition = 'standard' | 'app-launch' | 'android-launch';

export const APP_LAUNCH_NEWSLETTER_SUBJECT = 'Investigator Events is live on the App Store — Weekly Briefing';
export const ANDROID_LAUNCH_NEWSLETTER_SUBJECT = 'Investigator Events is now on Android — Weekly Briefing';

/**
 * The single Monday that carries the Android launch card. Vercel's cron hits
 * the route with no query string, so the edition has to come from the date —
 * and it has to expire on its own, or every week after this one keeps
 * announcing a launch that already happened.
 */
export const ANDROID_LAUNCH_WEEK_OF = '2026-09-07';

/** The Monday on or before `now`, in YYYY-MM-DD. Issues are keyed by week. */
function mondayOf(now: Date): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - (day === 0 ? 6 : day - 1));
  return d.toISOString().slice(0, 10);
}

export function getWeeklyNewsletterEdition(
  value: string | null | undefined,
  now = new Date()
): WeeklyNewsletterEdition {
  // An explicit ?edition= always wins, including ?edition=standard to opt out.
  if (value === 'app-launch') return 'app-launch';
  if (value === 'android-launch') return 'android-launch';
  if (value === 'standard') return 'standard';
  // Android launched on Google Play on 6 Sep 2026; this is the Monday after.
  if (mondayOf(now) === ANDROID_LAUNCH_WEEK_OF) return 'android-launch';
  // Otherwise the standard weekly. The iOS app-launch promo has run its course
  // (same subject + hero banner for weeks); pass ?edition=app-launch to re-run.
  return 'standard';
}

export function getWeeklyNewsletterSubject(edition: WeeklyNewsletterEdition, fallbackSubject: string) {
  if (edition === 'app-launch') return APP_LAUNCH_NEWSLETTER_SUBJECT;
  // The Android edition still lets a hand-written subject win, because the
  // week's events are usually the better hook — see the draft's SUBJECT block.
  if (edition === 'android-launch') return fallbackSubject || ANDROID_LAUNCH_NEWSLETTER_SUBJECT;
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
    ? heroDaysAway === 1
      ? `Tomorrow: ${heroTitle} — plus ${otherCount} more PI events`
      : `${heroDaysAway} days to ${heroTitle} — plus ${otherCount} more PI events`
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
  if (edition === 'app-launch') return { size: 'hero' as const, region: 'available' as const };
  if (edition === 'android-launch') return { size: 'android-launch' as const, region: 'available' as const };
  return { size: 'compact' as const, region: 'available' as const };
}
