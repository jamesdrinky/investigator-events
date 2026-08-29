// Discover each association's events page and register it as a sweep source.
// For every association_page with a website: fetch the homepage, collect links
// whose href/text smells like events, probe candidates (plus common paths),
// and insert the best hit into event_sources. No AI — just fetch + heuristics.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('/Users/jamesdrinkwater/Desktop/investigatorevents/.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const UA_BOT = 'InvestigatorEventsBot/1.0 (+https://www.investigatorevents.com)';
const UA_BROWSER =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

async function fetchPage(url) {
  const attempt = async (ua) => {
    const res = await fetch(url, {
      headers: { 'User-Agent': ua },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { html: await res.text(), finalUrl: res.url };
  };
  try {
    return await attempt(UA_BOT);
  } catch (err) {
    if (/HTTP 40[13]/.test(String(err.message))) return attempt(UA_BROWSER);
    throw err;
  }
}

const EVENT_HREF = /(event|conference|calendar|agm|seminar|training|meeting|symposium)/i;
const COMMON_PATHS = ['/events', '/events/', '/event-calendar', '/calendar', '/upcoming-events', '/conference', '/annual-conference'];

function extractCandidates(html, baseUrl) {
  const out = new Map();
  const linkRe = /<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1].trim();
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!EVENT_HREF.test(href) && !EVENT_HREF.test(text)) continue;
    if (/mailto:|tel:|\.(pdf|jpg|jpeg|png|zip|docx?)([?#]|$)/i.test(href)) continue;
    let url;
    try {
      url = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }
    // Prefer same-site or member-portal subdomain links.
    const baseHost = new URL(baseUrl).hostname.replace(/^www\./, '');
    const host = new URL(url).hostname.replace(/^www\./, '');
    const sameSite = host === baseHost || host.endsWith(`.${baseHost.split('.').slice(-2).join('.')}`);
    if (!sameSite) continue;
    // Score: prefer paths literally about events/calendar, shallow depth.
    let score = 0;
    const path = new URL(url).pathname.toLowerCase();
    if (/event/.test(path)) score += 5;
    if (/calendar/.test(path)) score += 4;
    if (/conference|agm/.test(path)) score += 3;
    if (/event|calendar|conference/i.test(text)) score += 2;
    score -= Math.max(0, path.split('/').filter(Boolean).length - 2);
    const key = url.replace(/[?#].*$/, '').replace(/\/$/, '');
    if (!out.has(key) || out.get(key) < score) out.set(key, score);
  }
  return [...out.entries()].sort((a, b) => b[1] - a[1]).map(([url]) => url);
}

async function probe(url) {
  try {
    const { html, finalUrl } = await fetchPage(url);
    // A real events page should have some substance.
    return html.length > 2000 ? finalUrl : null;
  } catch {
    return null;
  }
}

const { data: pages, error } = await supabase
  .from('association_pages')
  .select('id, slug, name, website, country')
  .not('website', 'is', null)
  .neq('website', '')
  .order('name');
if (error) throw error;

const { data: existing } = await supabase.from('event_sources').select('url, association');
const existingUrls = new Set((existing ?? []).map((s) => s.url.replace(/\/$/, '')));
const existingAssocs = new Set((existing ?? []).map((s) => (s.association ?? '').toLowerCase()));

const results = [];
for (const page of pages) {
  const label = page.name;
  if (existingAssocs.has(label.toLowerCase())) {
    results.push({ name: label, outcome: 'already-monitored' });
    continue;
  }

  let site = page.website;
  if (!/^https?:\/\//.test(site)) site = `https://${site}`;

  let homepage;
  try {
    homepage = await fetchPage(site);
  } catch (err) {
    results.push({ name: label, outcome: 'site-unreachable', detail: String(err.message) });
    continue;
  }

  const candidates = extractCandidates(homepage.html, homepage.finalUrl);
  // Also try common paths on the (possibly redirected) host.
  const origin = new URL(homepage.finalUrl).origin;
  for (const path of COMMON_PATHS) candidates.push(origin + path);

  let chosen = null;
  for (const candidate of candidates.slice(0, 8)) {
    const cleaned = candidate.replace(/\/$/, '');
    if (existingUrls.has(cleaned)) continue;
    const ok = await probe(candidate);
    if (ok) {
      chosen = ok;
      break;
    }
  }

  // Fall back to watching the homepage itself — announcements land there too.
  const url = (chosen ?? homepage.finalUrl).replace(/[?#].*$/, '');
  const isHomepage = !chosen;
  const cleaned = url.replace(/\/$/, '');
  if (existingUrls.has(cleaned)) {
    results.push({ name: label, outcome: 'duplicate-url', url });
    continue;
  }

  const { error: insertError } = await supabase.from('event_sources').insert({
    name: `${label} — ${isHomepage ? 'homepage' : 'events page'}`,
    url,
    association: label,
    country_hint: page.country || null,
  });
  existingUrls.add(cleaned);
  results.push({
    name: label,
    outcome: insertError ? `insert-failed: ${insertError.message}` : isHomepage ? 'added-homepage' : 'added-events-page',
    url,
  });
}

for (const r of results) console.log(`${r.outcome.padEnd(20)} ${r.name}${r.url ? ` -> ${r.url}` : ''}${r.detail ? ` (${r.detail})` : ''}`);
const counts = {};
for (const r of results) counts[r.outcome.split(':')[0]] = (counts[r.outcome.split(':')[0]] ?? 0) + 1;
console.log('\nSummary:', JSON.stringify(counts));
