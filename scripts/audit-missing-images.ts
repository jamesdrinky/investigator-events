/**
 * What imagery is actually missing?
 *   A. Events that render the generic fallback (no cover resolves at all)
 *   B. Cities present in the events table with no entry in the city map
 *   C. Events whose explicit image_path names a different city than the event
 *   D. City-map entries standing in another city's photo
 */
import { readFile } from 'fs/promises';
import path from 'path';

async function main() {
  const c = await readFile(path.join(process.cwd(), '.env.local'), 'utf8');
  for (const l of c.split('\n')) { const t=l.trim(); if(!t||t.startsWith('#'))continue; const s=t.indexOf('='); if(s<0)continue; const k=t.slice(0,s).trim(); let v=t.slice(s+1).trim(); if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1); if(!process.env[k])process.env[k]=v; }
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const { mapEventRowToItem } = await import('@/lib/data/events');
  const { getCityHeroImageUrl } = await import('@/lib/utils/city-media');
  const sb = createSupabaseAdminServerClient();

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await (sb.from('events' as never).select('*').order('start_date', { ascending: true }) as any);
  const ev = (data ?? []).filter((e: any) => e.approved !== false);
  const upcoming = (e: any) => e.start_date >= today;

  const norm = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const stem = (p: string) => path.basename(p).replace(/\.(jpg|jpeg|png|avif|webp)$/i, '');

  // A — nothing resolves
  const noCover = ev.filter((e: any) => !(mapEventRowToItem(e) as any)?.coverImage);

  // B — city not in the map at all
  const unmappedCities = new Map<string, any[]>();
  for (const e of ev) {
    if (!getCityHeroImageUrl(e.city)) {
      if (!unmappedCities.has(e.city)) unmappedCities.set(e.city, []);
      unmappedCities.get(e.city)!.push(e);
    }
  }

  // C — explicit image_path naming a different place than the event's city
  const mismatched = ev.filter((e: any) => {
    if (!e.image_path || !e.image_path.startsWith('/cities/')) return false;
    const f = norm(stem(e.image_path));
    const city = norm(e.city);
    if (!f || f === 'fallback') return false;
    return !city.includes(f) && !f.includes(city);
  });

  const line = (e: any) => ` ${e.start_date}  ${e.title}\n            city: ${e.city}, ${e.country}\n            image_path: ${e.image_path ?? '(null)'}  →  renders: ${(mapEventRowToItem(e) as any)?.coverImage ?? 'FALLBACK (\"Online Meeting\")'}`;

  console.log(`Approved events: ${ev.length}  (upcoming: ${ev.filter(upcoming).length})\n`);

  console.log(`=== A. RENDERS THE "ONLINE MEETING" FALLBACK — ${noCover.length} ===`);
  noCover.forEach((e: any) => console.log(line(e) + (upcoming(e) ? '   [UPCOMING]' : '')));

  console.log(`\n=== B. CITIES WITH NO MAP ENTRY — ${unmappedCities.size} ===`);
  console.log('(any future event in these cities falls straight to the fallback)');
  [...unmappedCities.entries()].sort((a,b)=>b[1].length-a[1].length).forEach(([city, list]) => {
    const up = list.filter(upcoming).length;
    console.log(` ${city}  — ${list.length} event${list.length>1?'s':''}${up?`, ${up} upcoming`:''}`);
    list.filter(upcoming).forEach((e:any)=>console.log(`      ${e.start_date} ${e.title}  [image_path: ${e.image_path ?? 'null'}]`));
  });

  // D — unmapped cities that ALREADY have a matching file sitting in /public/cities/
  const { readdir } = await import('fs/promises');
  const files = await readdir(path.join(process.cwd(), 'public/cities'));
  console.log(`\n=== D. UNMAPPED CITIES THAT ALREADY HAVE A FILE ON DISK ===`);
  console.log('(image exists, just never wired into cityImageMap)');
  let wired = 0, needed: string[] = [];
  for (const [city] of unmappedCities) {
    const key = norm(city.split(',')[0]);
    const hit = files.find((f) => { const st = norm(stem(f)); return st === key || (st.length > 3 && key.includes(st)) || (key.length > 3 && st.includes(key)); });
    if (hit) { console.log(`  ${city.padEnd(22)} → public/cities/${hit}   ON DISK, UNUSED`); wired++; }
    else needed.push(city);
  }
  console.log(`\n=== E. GENUINELY MISSING — no file anywhere (${needed.length}) ===`);
  needed.forEach((c) => console.log(`  ${c}`));
  console.log(`\nsummary: ${wired} cities already have art that is not wired up; ${needed.length} need a new image`);

  console.log(`\n=== C. IMAGE_PATH NAMES A DIFFERENT PLACE — ${mismatched.length} ===`);
  mismatched.forEach((e: any) => console.log(line(e) + (upcoming(e) ? '   [UPCOMING]' : '')));
}
main().catch((e) => { console.error(e); process.exit(1); });
