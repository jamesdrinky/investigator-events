/** Which upcoming events are missing a real cover image? */
import { readFile } from 'fs/promises';
import path from 'path';
async function main() {
  const c = await readFile(path.join(process.cwd(), '.env.local'), 'utf8');
  for (const l of c.split('\n')) { const t=l.trim(); if(!t||t.startsWith('#'))continue; const s=t.indexOf('='); if(s<0)continue; const k=t.slice(0,s).trim(); let v=t.slice(s+1).trim(); if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1); if(!process.env[k])process.env[k]=v; }
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const sb = createSupabaseAdminServerClient();
  const today = '2026-08-24';
  const { data } = await (sb.from('events' as never).select('*').gte('start_date', today).order('start_date',{ascending:true}) as any);
  const ev = (data??[]).filter((e:any)=>e.approved !== false);

  const none: any[] = [], generic: any[] = [], real: any[] = [];
  for (const e of ev) {
    const p = e.image_path;
    if (!p) none.push(e);
    else if (p.startsWith('/cities/')) generic.push(e);
    else real.push(e);
  }
  console.log(`Upcoming approved events: ${ev.length}`);
  console.log(`  bespoke cover uploaded : ${real.length}`);
  console.log(`  generic /cities/ stock : ${generic.length}`);
  console.log(`  NO image at all        : ${none.length}`);

  const show = (label:string, list:any[]) => {
    if (!list.length) return;
    console.log(`\n=== ${label} ===`);
    list.forEach((e:any)=>console.log(` ${e.start_date}  ${e.title} — ${e.city}, ${e.country}\n            ${e.image_path ?? '(none)'}\n            ${e.website}`));
  };
  show('NO IMAGE — highest priority', none);
  show('GENERIC CITY STOCK — worth replacing', generic);
}
main().catch(e=>{console.error(e);process.exit(1)});
