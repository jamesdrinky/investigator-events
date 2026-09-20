import { Resend } from 'resend';
import { fetchAllEvents } from '@/lib/data/events';
import { getWeeklyCollections } from '@/lib/data/weekly';
import { buildWeeklyNewsletterHtml } from '@/lib/email/weekly-newsletter';
import { fetchCurrentEditorial } from '@/lib/email/weekly-editorial';
import {
  buildRotatingWeeklySubject,
  getWeeklyNewsletterAppPush,
  getWeeklyNewsletterEdition,
  getWeeklyNewsletterSubject,
} from '@/lib/email/newsletter-editions';

/** Monday 00:00 UTC of the week containing `now`. */
function weekStart(now = new Date()): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - (day === 0 ? 6 : day - 1));
  return d;
}

/**
 * Send this week's issue to someone who subscribed after it went out.
 *
 * Someone who confirms on a Tuesday would otherwise wait six days before
 * hearing anything, having just been told they would get a weekly briefing.
 *
 * Only fires when an issue has actually been sent since Monday 00:00 UTC.
 * Confirm before the Monday cron and this does nothing, because the normal
 * send is hours away and two copies is worse than waiting.
 *
 * Errors are swallowed: this is a courtesy send hanging off confirmation,
 * and it must never be the reason a subscription fails to confirm.
 */
export async function sendCatchUpIssue(
  supabase: any,
  email: string,
  unsubscribeToken: string
): Promise<{ sent: boolean; reason?: string }> {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return { sent: false, reason: 'no api key' };

    const { data: lastSend } = await supabase
      .from('newsletter_sends')
      .select('sent_at')
      .gte('sent_at', weekStart().toISOString())
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastSend) return { sent: false, reason: 'no issue sent yet this week' };

    const events = await fetchAllEvents();
    const { upcoming, newlyAdded, featured, recentlyPast } = getWeeklyCollections(events);
    if (upcoming.length === 0 && newlyAdded.length === 0) {
      return { sent: false, reason: 'nothing to show' };
    }

    const editorial = await fetchCurrentEditorial(supabase);
    const edition = getWeeklyNewsletterEdition(null);
    const heroEvent = featured[0] ?? upcoming[0];
    const countries = new Set([...upcoming, ...newlyAdded].map((e) => e.country)).size;
    const heroDaysAway = heroEvent
      ? Math.ceil((new Date(`${heroEvent.date}T00:00:00Z`).getTime() - Date.now()) / 86400000)
      : undefined;

    const subject = getWeeklyNewsletterSubject(
      edition,
      buildRotatingWeeklySubject(
        {
          heroTitle: heroEvent?.title,
          heroDaysAway,
          otherCount: Math.max(0, upcoming.length + newlyAdded.length - 1),
          cities: [...new Set(upcoming.map((e) => e.city).filter(Boolean))] as string[],
          countries,
          upcomingCount: upcoming.length,
        },
        editorial?.subjectOverride
      )
    );

    const { data: articles } = await supabase
      .from('articles')
      .select('slug, title, dek, category, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3);

    const html = buildWeeklyNewsletterHtml({
      upcoming,
      newlyAdded,
      featured,
      recentlyPast,
      unsubscribeToken,
      articles: articles ?? [],
      appPush: getWeeklyNewsletterAppPush(edition),
      editorial: editorial as never,
      referralBlock: false,
      // Says plainly why this arrived on a Thursday, so it reads as a
      // welcome rather than a mis-timed broadcast.
      preheader: "You just subscribed, so here's this week's briefing — the next one lands Monday.",
    });

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: 'Investigator Events <weekly@investigatorevents.com>',
      to: email,
      subject: `${subject} (this week's issue)`,
      html,
    });

    return { sent: true };
  } catch (err) {
    console.error('catch_up_issue_failed', err instanceof Error ? err.message : err);
    return { sent: false, reason: 'error' };
  }
}
