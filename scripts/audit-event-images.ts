/** Which upcoming events are missing a real cover image? */
import { readFile } from 'fs/promises';
import path from 'path';
async function main() {
  const c = await readFile(path.join(process.cwd(), '.env.local'), 'utf8');
  for (const l of c.split('\n')) { const t=l.trim(); if(!t||t.startsWith('#'))continue; const s=t.indexOf('='); if(s<0)continue; const k=t.slice(0,s).trim(); let v=t.slice(s+1).trim(); if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1); if(!process.env[k])process.env[k]=v; }
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const { mapEventRowToItem } = await import('@/lib/data/events');
  const sb = createSupabaseAdminServerClient();
  const today = '2026-08-24';
  const { data } = await (sb.from('events' as never).select('*').gte('start_date', today).order('start_date',{ascending:true}) as any);
  const ev = (data??[]).filter((e:any)=>e.approved !== false);

  // Judge what actually renders: image_path wins, then the slug map, then the
  // city map. Auditing image_path alone understates coverage badly.
  const none: any[] = [], viaMap: any[] = [], generic: any[] = [], real: any[] = [];
  for (const row of ev) {
    const item: any = mapEventRowToItem(row);
    const cover = item?.coverImage ?? null;
    const e = { ...row, cover, viaFallback: !row.image_path && !!cover };
    if (!cover) none.push(e);
    else if (!row.image_path) viaMap.push(e);
    else if (String(row.image_path).startsWith('/cities/')) generic.push(e);
    else real.push(e);
  }
  console.log(`Upcoming approved events: ${ev.length}`);
  console.log(`  bespoke cover uploaded      : ${real.length}`);
  console.log(`  generic /cities/ on the row : ${generic.length}`);
  console.log(`  resolved by city/slug map   : ${viaMap.length}`);
  console.log(`  NOTHING RENDERS            : ${none.length}`);

  const show = (label:string, list:any[]) => {
    if (!list.length) return;
    console.log(`\n=== ${label} ===`);
    list.forEach((e:any)=>console.log(` ${e.start_date}  ${e.title} — ${e.city}, ${e.country}\n            row: ${e.image_path ?? '(null)'}\n            renders: ${e.cover ?? '(NOTHING)'}`));
  };
  show('NOTHING RENDERS — highest priority', none);
  show('COVERED BY THE CITY/SLUG MAP — no action needed', viaMap);
}
main().catch(e=>{console.error(e);process.exit(1)});
