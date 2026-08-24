/** Who can we send the video invite to? Associations with an upcoming event on IE. */
import { readFile } from 'fs/promises';
import path from 'path';
async function main() {
  const c = await readFile(path.join(process.cwd(), '.env.local'), 'utf8');
  for (const l of c.split('\n')) { const t=l.trim(); if(!t||t.startsWith('#'))continue; const s=t.indexOf('='); if(s<0)continue; const k=t.slice(0,s).trim(); let v=t.slice(s+1).trim(); if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1); if(!process.env[k])process.env[k]=v; }
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const sb = createSupabaseAdminServerClient();
  const today = new Date().toISOString().slice(0,10);

  const { data: pages } = await (sb.from('association_pages' as never).select('name, slug, contact_email') as any);
  const { data: events } = await (sb.from('events' as never).select('association, title, start_date').eq('approved',true).gte('start_date',today).order('start_date') as any);
  const { data: sends } = await (sb.from('outreach_sends' as never).select('association, subject, sent_at, status, recipient_email').order('sent_at',{ascending:false}) as any);

  const norm = (s:string)=>(s??'').toLowerCase().replace(/[^a-z0-9]/g,'');
  // association_pages keys off BOTH name and slug — events store short codes.
  const contact = new Map<string,{email:string|null;name:string}>();
  for (const p of (pages??[])) {
    for (const key of [norm(p.name), norm(p.slug)]) if (key) contact.set(key, { email: p.contact_email, name: p.name });
    const paren = p.name.match(/\(([^)]+)\)/)?.[1];       // "… (ABI)" -> ABI
    if (paren) contact.set(norm(paren), { email: p.contact_email, name: p.name });
  }
  const videoInvited = new Set((sends??[]).filter((s:any)=>/video|promotional spot/i.test(s.subject??'')).map((s:any)=>norm(s.association)));

  const byAssoc = new Map<string, any[]>();
  for (const e of (events??[])) { const k = norm(e.association); if (!k) continue; if(!byAssoc.has(k)) byAssoc.set(k,[]); byAssoc.get(k)!.push(e); }

  const ready:any[]=[], invited:any[]=[], noEmail:any[]=[];
  for (const [k, evs] of [...byAssoc.entries()].sort((a,b)=>a[1][0].start_date.localeCompare(b[1][0].start_date))) {
    const info = contact.get(k);
    const row = { code:(evs[0].association as string), next:evs[0], n:evs.length, email:info?.email??null, page:info?.name??null };
    if (videoInvited.has(k)) invited.push(row);
    else if (info?.email) ready.push(row);
    else noEmail.push(row);
  }
  const fmt=(r:any)=>`  ${r.code.padEnd(12)} ${String(r.n).padStart(2)} ev  ${r.next.start_date}  ${r.next.title.slice(0,42)}\n       ${r.email ?? (r.page ? 'page exists, no email' : 'NO association_pages entry')}`;
  console.log(`=== READY TO SEND — ${ready.length} ===`); ready.forEach(r=>console.log(fmt(r)));
  console.log(`\n=== ALREADY HAD A VIDEO INVITE — ${invited.length} ===`); invited.forEach(r=>console.log(fmt(r)));
  console.log(`\n=== BLOCKED, NO EMAIL — ${noEmail.length} ===`); noEmail.forEach(r=>console.log(fmt(r)));
  console.log(`\n--- past video-invite sends ---`);
  (sends??[]).filter((s:any)=>/video|promotional spot/i.test(s.subject??'')).forEach((s:any)=>console.log(`  ${String(s.sent_at).slice(0,10)}  ${s.association}  ${s.status}  ${s.recipient_email}\n       "${s.subject}"`));
}
main().catch(e=>{console.error(e);process.exit(1)});
