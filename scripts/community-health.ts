/** Where does the community actually stand — and what still depends on James? */
import { readFile } from 'fs/promises';
import path from 'path';
async function main() {
  const c = await readFile(path.join(process.cwd(), '.env.local'), 'utf8');
  for (const l of c.split('\n')) { const t=l.trim(); if(!t||t.startsWith('#'))continue; const s=t.indexOf('='); if(s<0)continue; const k=t.slice(0,s).trim(); let v=t.slice(s+1).trim(); if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1); if(!process.env[k])process.env[k]=v; }
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const sb = createSupabaseAdminServerClient();

  const N = async (t: string, filt?: (q:any)=>any) => {
    let q:any = sb.from(t as never).select('*', { count:'exact', head:true });
    if (filt) q = filt(q);
    const { count, error } = await q as any;
    return error ? `ERR(${error.message.slice(0,40)})` : (count ?? 0);
  };
  const since = (d:number)=> new Date(Date.now()-d*864e5).toISOString();

  const tables = ['profiles','users','forum_posts','forum_threads','posts','threads','reviews','event_reviews',
    'messages','connections','user_associations','event_submissions','notifications','articles',
    'newsletter_subscribers','association_pages','association_managers','events','device_tokens'];
  console.log('=== TABLE SIZES ===');
  for (const t of tables) {
    const n = await N(t);
    if (typeof n === 'number') console.log(`  ${t.padEnd(24)} ${n}`);
  }
  console.log('\n=== ACTIVITY IN LAST 30 DAYS ===');
  for (const [t, col] of [['event_submissions','created_at'],['articles','published_at'],['newsletter_subscribers','created_at'],['notifications','created_at']] as const) {
    const n = await N(t, (q:any)=>q.gte(col, since(30)));
    console.log(`  ${t.padEnd(24)} ${n}`);
  }
}
main().catch(e=>{console.error(e);process.exit(1)});
