import { readFile } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const ENV_FILES = ['.env.local', '.env'];

function parseEnvFile(contents: string) {
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const sep = line.indexOf('=');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function loadLocalEnv() {
  for (const envFile of ENV_FILES) {
    try {
      const contents = await readFile(path.join(ROOT, envFile), 'utf8');
      parseEnvFile(contents);
    } catch {}
  }
}

async function main() {
  await loadLocalEnv();

  const recipient = process.argv[2] ?? 'james@drinky.com';

  const { Resend } = await import('resend');
  const { mapEventRowToItem } = await import('@/lib/data/events');
  const { getWeeklyCollections } = await import('@/lib/data/weekly');
  const { buildWeeklyNewsletterHtml } = await import('@/lib/email/weekly-newsletter');
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error('RESEND_API_KEY not set in .env.local');

  const resend = new Resend(resendKey);
  const supabase = createSupabaseAdminServerClient();

  // Bypass fetchAllEvents — uses Next's unstable_cache which doesn't run outside Next.
  // Replicate fetchVisibleEvents inline: query raw rows + filter unapproved + map.
  const { data: rawRows, error: eventsErr } = await (supabase
    .from('events' as never)
    .select('*')
    .order('start_date', { ascending: true }) as any);
  if (eventsErr) throw eventsErr;
  const events = ((rawRows ?? []) as any[])
    .filter((row) => row.approved !== false)
    .map(mapEventRowToItem)
    .filter((event): event is NonNullable<ReturnType<typeof mapEventRowToItem>> => event !== null);
  const { upcoming, newlyAdded, featured, recentlyPast } = getWeeklyCollections(events);
  const heroEvent = featured[0] ?? upcoming[0];
  const countries = new Set([...upcoming, ...newlyAdded].map((e) => e.country)).size;

  console.log(`📊 Live data: ${upcoming.length} upcoming, ${newlyAdded.length} newly added, ${featured.length} featured, ${recentlyPast.length} recently past`);
  if (heroEvent) console.log(`🎯 Hero: ${heroEvent.title}`);

  // Use the recipient's real unsubscribe token if they're a subscriber
  const { data: row } = await (supabase
    .from('newsletter_subscribers' as never)
    .select('unsubscribe_token')
    .ilike('email', recipient)
    .maybeSingle() as any);
  const unsubscribeToken = (row?.unsubscribe_token as string | undefined) ?? 'preview-no-token';

  const subject = heroEvent
    ? `${heroEvent.title} + ${Math.max(0, upcoming.length + newlyAdded.length - 1)} more — Weekly Briefing`
    : `Weekly Briefing — ${upcoming.length} event${upcoming.length !== 1 ? 's' : ''} across ${countries} countries`;

  const html = buildWeeklyNewsletterHtml({
    upcoming,
    newlyAdded,
    featured,
    recentlyPast,
    unsubscribeToken,
    globalLaunchBanner: true,
  });

  const { data, error } = await resend.emails.send({
    from: 'Investigator Events <weekly@investigatorevents.com>',
    to: recipient,
    subject,
    html,
  });

  if (error) {
    console.error('❌ Send failed:', error);
    process.exit(1);
  }

  console.log(`✅ Sent to ${recipient} — Resend id: ${data?.id}`);
  console.log(`📧 Subject: ${subject}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
