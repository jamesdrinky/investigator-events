// Worksheet for Mike: every association we track, with everything we already
// know pre-filled, so the only column he has to complete is the relationship.
//
//   npx tsx scripts/association-relationship-gaps.ts            # summary + gap list
//   npx tsx scripts/association-relationship-gaps.ts --csv f.csv # fillable sheet
//
// Read-only. Sends nothing, writes nothing to the database.
import { config } from 'dotenv';
config({ path: '.env.local' });
import { writeFileSync } from 'fs';
import { fetchAssociationDossiers } from '../lib/data/association-relationships';

const csvIndex = process.argv.indexOf('--csv');
const CSV_PATH = csvIndex !== -1 ? process.argv[csvIndex + 1] : null;

function csvCell(value: string | number | null | undefined) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  const dossiers = await fetchAssociationDossiers();

  // Priority = where a wrong guess costs the most. Upcoming events first
  // (there's a live reason to talk to them), then reach, then whether we have
  // already cold-emailed them without knowing the relationship.
  const scored = dossiers
    .map((d) => ({
      d,
      score: d.events.length * 100 + d.memberCount * 10 + d.timesContacted,
      known: !!d.relationship?.level,
    }))
    .sort((a, b) => b.score - a.score);

  const missing = scored.filter((s) => !s.known);
  const done = scored.filter((s) => s.known);

  console.log(`associations tracked: ${dossiers.length}`);
  console.log(`  relationship recorded: ${done.length}`);
  console.log(`  still blank:           ${missing.length}`);
  console.log(`  already cold-emailed while blank: ${missing.filter((m) => m.d.timesContacted > 0).length}`);

  console.log('\nTop gaps (most consequential first):');
  for (const { d } of missing.slice(0, 15)) {
    const bits = [
      d.events.length ? `${d.events.length} upcoming` : null,
      d.memberCount ? `${d.memberCount} members` : null,
      d.timesContacted ? `contacted ${d.timesContacted}x` : 'never contacted',
      d.hasVideo ? 'has video' : null,
    ].filter(Boolean);
    console.log(`  ${d.name.padEnd(46)} ${bits.join(' · ')}`);
  }

  if (CSV_PATH) {
    const header = [
      'association', 'code', 'country', 'upcoming_events', 'members',
      'times_contacted', 'has_video', 'email_we_have', 'named_organisers',
      'senior_members', 'RELATIONSHIP_close_known_cold_skip', 'BEST_CONTACT_NAME',
      'BEST_CONTACT_EMAIL', 'NOTES',
    ];
    const rows = scored.map(({ d }) => [
      d.name, d.code, d.country ?? '', d.events.length, d.memberCount,
      d.timesContacted, d.hasVideo ? 'yes' : '', d.pageEmail ?? '',
      d.organisers.join('; '),
      d.seniorMembers.map((m) => `${m.name}${m.role ? ` (${m.role})` : ''}`).join('; '),
      d.relationship?.level ?? '', d.relationship?.contactName ?? '',
      d.relationship?.contactEmail ?? '', d.relationship?.note ?? '',
    ]);
    writeFileSync(CSV_PATH, [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n'));
    console.log(`\nworksheet: ${CSV_PATH}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
