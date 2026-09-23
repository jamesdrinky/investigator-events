/**
 * Draft one tailored email per association, segmented by what they have
 * actually listed and how well Mike knows them.
 *
 *   A — listed with us before, nothing upcoming  → "anything else coming up?"
 *   B — listed before and something ahead        → the video ask
 *   C — never listed anything                    → introduction
 *
 * Tone follows Mike's relationship form: close / known / cold. A cold body
 * introduces the platform; a close one does not, because being introduced to
 * something you already know reads badly.
 *
 * Writes markdown for review. Sends nothing.
 *
 *   npx tsx scripts/draft-association-campaign.ts
 */
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const TODAY = new Date().toISOString().slice(0, 10);
const SITE = 'https://www.investigatorevents.com';

async function loadEnv() {
  const c = await readFile(path.join(ROOT, '.env.local'), 'utf8');
  for (const l of c.split('\n')) {
    const t = l.trim(); if (!t || t.startsWith('#')) continue;
    const s = t.indexOf('='); if (s < 0) continue;
    const k = t.slice(0, s).trim(); let v = t.slice(s + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

type Row = {
  code: string; name: string; level: 'close' | 'known' | 'cold';
  email: string | null; slug: string | null;
  past: string[]; upcoming: { title: string; date: string }[]; hasVideo: boolean;
};

/** Cold contacts need to be told what this is; close ones do not. */
function opener(r: Row) {
  if (r.level === 'close') return `I hope you're keeping well.`;
  if (r.level === 'known') return `I hope this finds you well.`;
  return `I hope you don't mind the note. I'm Mike LaCorte, founder of Investigator Events — a free global calendar for the investigations profession, used by investigators in around twenty countries.`;
}

function pageLine(r: Row) {
  if (!r.slug) return '';
  return ` ${r.name} has a page of its own at ${SITE}/associations/${r.slug}, which gathers your events in one place, and your members can add ${r.code} to their profile so they see them wherever they are on the site.`;
}

/** The video ask, only where it is the second thing we are saying, not the first. */
function videoAsk(r: Row) {
  if (r.hasVideo) {
    return `\n\nYour video is live on the event page and we share it across the site, the Monday briefing and LinkedIn. If you'd like one for any of your other events, just say and I'll send the link.`;
  }
  return `\n\nOne thing that has worked well for other associations: a short video introducing the event, recorded on a phone, which sits on the event page and goes out across the site, the Monday briefing and LinkedIn. TALI and the CII have both done it. If you'd like to do the same, reply and I'll send you the link — there's no cost.`;
}

function draftA(r: Row) {
  const last = r.past[0] ?? 'your event';
  return `Dear ${r.code} team,

${opener(r)}

We listed ${last} on Investigator Events earlier this year.${pageLine(r)}

I wanted to ask whether you have anything else coming up. If you do, we'll add it to the calendar, include it in the Monday briefing that goes to investigators worldwide, and post it on LinkedIn — all free, and it takes us a couple of minutes at our end.

Just reply with the dates and a link and I'll take care of the rest.`;
}

function draftB(r: Row) {
  const next = r.upcoming[0];
  return `Dear ${r.code} team,

${opener(r)}

${next.title} is live on Investigator Events, and will be included in the Monday briefing to investigators worldwide.${pageLine(r)}${videoAsk(r)}

If there's anything else in your diary for the year ahead, send it over and we'll get it listed.`;
}

function draftC(r: Row) {
  return `Dear ${r.code} team,

${opener(r)}

${r.name} is listed on our associations directory, but we don't yet have any of your events on the calendar — and I'd like to change that.

If you have a conference, AGM or training day coming up, it takes about two minutes to add at ${SITE}/submit-event, or you can simply reply with the dates and a link and we'll do it for you. Listing is free and always will be.

Once it's up, the event appears on the calendar, goes into the Monday briefing that reaches investigators worldwide, and gets posted on LinkedIn. Your members can also follow ${r.code} on the site so they're told when you announce something new.`;
}

async function main() {
  await loadEnv();
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const { findAssociationRecordByLabel } = await import('@/lib/data/associations');
  const sb = createSupabaseAdminServerClient();

  const { data: rels } = await (sb.from('association_relationships' as never).select('association_code,association_name,level,contact_email') as never) as any;
  const { data: links } = await (sb.from('event_associations' as never).select('label,event_id') as never) as any;
  const { data: events } = await (sb.from('events' as never).select('id,title,start_date,end_date').neq('approved', false) as never) as any;
  const { data: vids } = await (sb.from('association_videos' as never).select('event_id').eq('status', 'approved') as never) as any;

  const evById = new Map((events ?? []).map((e: any) => [e.id, e]));
  const vidEv = new Set((vids ?? []).map((v: any) => v.event_id).filter(Boolean));

  const seen = new Set<string>();
  const groups: Record<string, Row[]> = { A: [], B: [], C: [] };

  for (const r of (rels ?? []) as any[]) {
    const code = r.association_code === 'Association of British Investigators (ABI)' ? 'ABI' : r.association_code;
    if (seen.has(code)) continue;
    seen.add(code);
    const ids = [...new Set((links ?? []).filter((l: any) => String(l.label).toLowerCase() === code.toLowerCase()).map((l: any) => l.event_id))];
    const evs = ids.map((id: any) => evById.get(id)).filter(Boolean) as any[];
    const up = evs.filter((e) => (e.end_date ?? e.start_date) >= TODAY).sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));
    const past = evs.filter((e) => (e.end_date ?? e.start_date) < TODAY).sort((a, b) => String(b.start_date).localeCompare(String(a.start_date)));
    const row: Row = {
      code, name: r.association_name, level: r.level, email: r.contact_email,
      slug: findAssociationRecordByLabel(code)?.slug ?? null,
      past: past.map((e) => e.title),
      upcoming: up.map((e) => ({ title: e.title, date: e.start_date })),
      hasVideo: evs.some((e) => vidEv.has(e.id)),
    };
    if (evs.length === 0) groups.C.push(row);
    else if (up.length > 0) groups.B.push(row);
    else groups.A.push(row);
  }

  const order = (l: string) => ({ close: 0, known: 1, cold: 2 } as any)[l] ?? 3;
  const subjects = {
    A: (r: Row) => `Anything else coming up for ${r.code}?`,
    B: (r: Row) => `${r.upcoming[0].title} is live on Investigator Events`,
    C: (r: Row) => `Adding ${r.code} events to the global investigator calendar`,
  } as any;
  const bodies = { A: draftA, B: draftB, C: draftC } as any;

  let md = `# Association campaign — drafts\n\nGenerated ${TODAY}. Nothing sent.\n\n`;
  md += `| Group | What | Count |\n|---|---|---|\n`;
  md += `| A | Listed before, nothing upcoming | ${groups.A.length} |\n`;
  md += `| B | Listed before, something ahead | ${groups.B.length} |\n`;
  md += `| C | Never listed anything | ${groups.C.length} |\n`;

  for (const k of ['A', 'B', 'C']) {
    groups[k].sort((a, b) => order(a.level) - order(b.level) || a.code.localeCompare(b.code));
    md += `\n---\n\n## Group ${k} (${groups[k].length})\n`;
    for (const r of groups[k]) {
      md += `\n### ${r.code} — ${r.name}\n`;
      md += `**${r.level}** · ${r.email ?? '**NO EMAIL ON FILE**'}${r.hasVideo ? ' · has a video' : ''}\n\n`;
      md += `*Subject:* ${subjects[k](r)}\n\n`;
      md += '```\n' + bodies[k](r) + '\n```\n';
    }
  }
  await writeFile(path.join(ROOT, 'association-campaign-drafts.md'), md, 'utf8');
  const noEmail = [...groups.A, ...groups.B, ...groups.C].filter((r) => !r.email);
  console.log(`A ${groups.A.length}  B ${groups.B.length}  C ${groups.C.length}   total ${groups.A.length + groups.B.length + groups.C.length}`);
  console.log(`no email on file: ${noEmail.length} — ${noEmail.map((r) => r.code).join(', ')}`);
  console.log('-> association-campaign-drafts.md');
}

main().catch((e) => { console.error(e); process.exit(1); });
