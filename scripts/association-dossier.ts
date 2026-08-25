/** Everything we know about every association — for Mike's relationship checklist. */
import { readFile, writeFile } from 'fs/promises'; import path from 'path';
async function main(){
 const c=await readFile(path.join(process.cwd(),'.env.local'),'utf8');
 for(const l of c.split('\n')){const t=l.trim();if(!t||t.startsWith('#'))continue;const s=t.indexOf('=');if(s<0)continue;const k=t.slice(0,s).trim();let v=t.slice(s+1).trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);if(!process.env[k])process.env[k]=v;}
 const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
 const sb = createSupabaseAdminServerClient();
 const today=new Date().toISOString().slice(0,10);

 const { data: pages } = await (sb.from('association_pages' as never).select('name, slug, contact_email, country') as any);
 const { data: events } = await (sb.from('events' as never).select('association, title, organiser, start_date, city, country, slug').eq('approved',true).gte('start_date',today).order('start_date') as any);
 const { data: memberships } = await (sb.from('user_associations' as never).select('association_name, role, user_id') as any);
 const { data: profs } = await (sb.from('profiles' as never).select('id, full_name, is_verified') as any);
 const { data: sends } = await (sb.from('outreach_sends' as never).select('association, subject, sent_at, status') as any);
 const { data: vids } = await (sb.from('association_videos' as never).select('event_slug, status, title') as any);

 const pmap=new Map<string, any>((profs??[]).map((p:any)=>[p.id,p]));
 const norm=(s:string)=>(s??'').toUpperCase().replace(/[^A-Z0-9]/g,'');
 const SENIOR=/presid|chair|board|director|secretar|treasur|vice|governing|exec|sergeant/i;

 // index by every alias we can derive
 const rows = new Map<string, any>();
 const put=(key:string, patch:any)=>{ const k=norm(key); if(!k) return; rows.set(k, {...(rows.get(k)??{aliases:new Set()}), ...patch}); rows.get(k).aliases.add(key); };

 for (const p of (pages??[])) {
   put(p.slug, { name:p.name, slug:p.slug, email:p.contact_email??null, country:p.country??null });
   const paren=p.name.match(/\(([^)]+)\)/)?.[1];
   if (paren) { const k=norm(paren); if(!rows.has(k)) rows.set(k, rows.get(norm(p.slug))); }
 }
 for (const e of (events??[])) {
   const k=norm(e.association); if(!k) continue;
   const cur=rows.get(k) ?? { name:e.association, slug:null, email:null, aliases:new Set() };
   cur.events=[...(cur.events??[]), { title:e.title, date:e.start_date, city:e.city, organiser:e.organiser, slug:e.slug }];
   cur.code=e.association;
   rows.set(k,cur);
 }
 for (const m of (memberships??[])) {
   const k=norm(m.association_name); if(!k) continue;
   const cur=rows.get(k); if(!cur) continue;
   const p=pmap.get(m.user_id); if(!p) continue;
   cur.members=[...(cur.members??[]), { name:p.full_name, role:m.role??null, verified:!!p.is_verified, senior:SENIOR.test(m.role??'') }];
 }
 for (const s of (sends??[])) {
   const k=norm(s.association); const cur=rows.get(k); if(!cur) continue;
   cur.contacted=[...(cur.contacted??[]), { subject:s.subject, at:String(s.sent_at).slice(0,10), status:s.status }];
 }
 const videoSlugs=new Set((vids??[]).filter((v:any)=>v.status==='approved').map((v:any)=>v.event_slug).filter(Boolean));

 const out=[...rows.values()].map((r:any)=>({
   name: r.name ?? r.code, code: r.code ?? null, slug: r.slug ?? null,
   country: r.country ?? null,
   email: r.email ?? null,
   events: r.events ?? [],
   organisers: [...new Set((r.events??[]).map((e:any)=>e.organiser).filter((o:string)=>o && !/^[A-Z\s]+$/.test(o)))],
   seniorMembers: (r.members??[]).filter((m:any)=>m.senior),
   memberCount: (r.members??[]).length,
   contacted: r.contacted ?? [],
   hasVideo: (r.events??[]).some((e:any)=>videoSlugs.has(e.slug)),
 })).filter((r:any)=>r.name)
   .sort((a:any,b:any)=> (b.events.length - a.events.length) || String(a.name).localeCompare(String(b.name)));

 await writeFile('association-dossier.json', JSON.stringify(out,null,1));
 console.log(`${out.length} associations`);
 console.log(`  with an upcoming event : ${out.filter((r:any)=>r.events.length).length}`);
 console.log(`  with a contact email   : ${out.filter((r:any)=>r.email).length}`);
 console.log(`  with a named organiser : ${out.filter((r:any)=>r.organisers.length).length}`);
 console.log(`  with a senior member   : ${out.filter((r:any)=>r.seniorMembers.length).length}`);
 console.log(`  already contacted      : ${out.filter((r:any)=>r.contacted.length).length}`);
}
main().catch(e=>{console.error(e);process.exit(1)});
