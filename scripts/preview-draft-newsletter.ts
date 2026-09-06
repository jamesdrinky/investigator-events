/**
 * Renders the weekly email exactly as the cron would, but with the editorial
 * taken from newsletter-draft-<week>.md instead of the database. Nothing is
 * written and nothing is sent — this is the approval preview.
 *
 * Pass --apply to upsert the parsed editorial into newsletter_editorial, so the
 * approved draft and the row the cron reads can never drift apart.
 */
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();

/** The Monday on or before today, in YYYY-MM-DD. Issues are keyed by week. */
function currentMonday(): string {
  const d = new Date();
  const day = d.getUTCDay(); // 0 = Sunday
  const back = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0, 10);
}

async function loadLocalEnv() {
  const c = await readFile(path.join(ROOT, '.env.local'), 'utf8');
  for (const l of c.split('\n')) {
    const t = l.trim(); if (!t || t.startsWith('#')) continue;
    const s = t.indexOf('='); if (s < 0) continue;
    const k = t.slice(0, s).trim(); let v = t.slice(s + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

function section(md: string, name: string): string {
  const re = new RegExp(`--- ${name} ---\\n([\\s\\S]*?)(?=\\n--- |$)`);
  return (md.match(re)?.[1] ?? '').trim();
}
/** Draft files hard-wrap for readability; the email wants real paragraphs. */
function unwrap(block: string): string {
  return block.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).join('\n\n');
}
function field(block: string, key: string): string | null {
  const lines = block.split('\n');
  const i = lines.findIndex((l) => l.trim().startsWith(`${key}:`));
  if (i === -1) return null;
  const parts = [lines[i].slice(lines[i].indexOf(':') + 1).trim()];
  for (let j = i + 1; j < lines.length; j++) {
    if (/^\s{2,}\S/.test(lines[j]) && !/^\s*[a-z_]+:/.test(lines[j])) parts.push(lines[j].trim());
    else break;
  }
  return parts.join(' ').trim() || null;
}

async function main() {
  await loadLocalEnv();
  // Default to the Monday of the current week. This used to be a hardcoded
  // date, which meant running the script bare silently previewed — and with
  // --apply, WROTE — a stale editorial from a previous week.
  // Skip flags: `--apply` as argv[2] was being read as the week, which sent the
  // script looking for newsletter-draft---apply.md.
  const weekArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
  const weekOf = weekArg ?? currentMonday();
  // Drafts are written the night before, when currentMonday() is still LAST
  // Monday and "recently past" has not yet swallowed the weekend's events —
  // so the preview showed a review section the real send would not have.
  // --as-of=<iso> renders the email as of the moment the cron will fire.
  const asOfArg = process.argv.slice(2).find((a) => a.startsWith('--as-of='))?.slice('--as-of='.length);
  const asOf = asOfArg ? new Date(asOfArg) : new Date(`${weekOf}T08:00:00Z`);
  if (Number.isNaN(asOf.getTime())) throw new Error(`--as-of is not a date: ${asOfArg}`);
  console.log(`week ${weekOf} · rendering as of ${asOf.toISOString()}`);
  const md = await readFile(path.join(ROOT, `newsletter-draft-${weekOf}.md`), 'utf8');

  const subject = section(md, 'SUBJECT \\(recommended\\)').split('\n')[0].trim();
  const introText = unwrap(section(md, 'INTRO'));
  const spot = section(md, 'SPOTLIGHT');
  const byline = md.match(/intro_byline:\s*(.+)/)?.[1]?.trim() ?? null;

  const editorial = {
    weekOf,
    introByline: byline,
    introText,
    spotlightKicker: field(spot, 'kicker'),
    spotlightTitle: field(spot, 'title'),
    spotlightBody: field(spot, 'body'),
    spotlightCtaLabel: field(spot, 'cta_label'),
    spotlightCtaUrl: field(spot, 'cta_url'),
    spotlightImageUrl: field(spot, 'image_url'),
    subjectOverride: subject,
  };

  const { mapEventRowToItem } = await import('@/lib/data/events');
  const { getWeeklyCollections } = await import('@/lib/data/weekly');
  const { buildWeeklyNewsletterHtml } = await import('@/lib/email/weekly-newsletter');
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const { getWeeklyNewsletterAppPush, getWeeklyNewsletterEdition } = await import('@/lib/email/newsletter-editions');

  // Same resolution the cron does, so the preview cannot drift from the send.
  const edition = getWeeklyNewsletterEdition(null, asOf);

  const sb = createSupabaseAdminServerClient();
  const { data: rows } = await (sb.from('events' as never).select('*').order('start_date', { ascending: true }) as any);
  const events = ((rows ?? []) as any[]).filter((r) => r.approved !== false).map(mapEventRowToItem).filter((e: any) => e !== null) as any[];
  const { upcoming, newlyAdded, featured, recentlyPast } = getWeeklyCollections(events, asOf);

  console.log('SUBJECT:', subject);
  console.log('\nBYLINE :', byline);
  console.log('\nINTRO  :\n' + introText.split('\n\n').map((p) => '  ' + p).join('\n\n'));
  console.log('\nSPOTLIGHT:');
  Object.entries(editorial).filter(([k]) => k.startsWith('spotlight')).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log(`\nedition: ${edition}  appPush: ${JSON.stringify(getWeeklyNewsletterAppPush(edition))}`);
  console.log(`\ncounts — upcoming ${upcoming.length}, newlyAdded ${newlyAdded.length}, featured ${featured.length}, recentlyPast ${recentlyPast.length}`);

  const { data: briefRows } = await (sb.from('articles' as never)
    .select('slug, title, dek, category, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3) as any);
  const briefArticles = (briefRows ?? []) as any[];

  const html = buildWeeklyNewsletterHtml({
    upcoming, newlyAdded, featured, recentlyPast,
    unsubscribeToken: 'preview-token',
    articles: briefArticles,
    appPush: getWeeklyNewsletterAppPush(edition),
    editorial: editorial as any,
    referralBlock: false,
  });
  const out = path.join(ROOT, `newsletter-preview-${weekOf}.html`);
  await writeFile(out, html, 'utf8');
  console.log(`\n📄 ${html.length} bytes -> ${out}`);

  if (!process.argv.includes('--apply')) {
    console.log('\n(preview only — pass --apply to write this to newsletter_editorial)');
    return;
  }

  const { data: written, error: writeErr } = await (sb.from('newsletter_editorial' as never).upsert({
    week_of: weekOf,
    intro_byline: editorial.introByline,
    intro_text: editorial.introText,
    spotlight_kicker: editorial.spotlightKicker,
    spotlight_title: editorial.spotlightTitle,
    spotlight_body: editorial.spotlightBody,
    spotlight_cta_label: editorial.spotlightCtaLabel,
    spotlight_cta_url: editorial.spotlightCtaUrl,
    spotlight_image_url: editorial.spotlightImageUrl,
    subject_override: editorial.subjectOverride,
  } as never, { onConflict: 'week_of' } as never).select('week_of') as any);

  if (writeErr) { console.error('\n❌ WRITE FAILED:', writeErr.message); process.exit(1); }
  if (!written || written.length === 0) { console.error('\n❌ WRITE AFFECTED 0 ROWS'); process.exit(1); }
  console.log(`\n✅ newsletter_editorial upserted for week_of=${weekOf}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
