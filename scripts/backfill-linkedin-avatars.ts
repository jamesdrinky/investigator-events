import { readFile } from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

const ROOT = process.cwd();
const ENV_FILES = ['.env.local', '.env'];

function parseEnvFile(contents: string) {
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const sep = line.indexOf('=');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function loadLocalEnv() {
  for (const envFile of ENV_FILES) {
    try {
      const contents = await readFile(path.join(ROOT, envFile), 'utf8');
      parseEnvFile(contents);
    } catch {}
  }
}

async function main() {
  await loadLocalEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const admin = createClient<Database>(url, key);

  const { data: targets, error } = await admin
    .from('profiles')
    .select('id, full_name, avatar_url')
    .like('avatar_url', '%media.licdn.com%');

  if (error) {
    console.error('Query failed:', error.message);
    process.exit(1);
  }

  console.log(`Found ${targets?.length ?? 0} profiles with media.licdn.com avatars`);

  let rehosted = 0;
  let cleared = 0;
  let untouched = 0;

  for (const profile of targets ?? []) {
    const src = profile.avatar_url!;
    process.stdout.write(`- ${profile.full_name ?? profile.id}: `);

    let buffer: Buffer | null = null;
    try {
      const res = await fetch(src, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InvestigatorEvents/1.0)' },
      });
      if (res.ok) {
        const ab = await res.arrayBuffer();
        buffer = Buffer.from(ab);
      } else {
        console.log(`fetch ${res.status} — clearing`);
      }
    } catch (e: any) {
      console.log(`fetch error ${e?.message ?? 'unknown'} — clearing`);
    }

    if (!buffer) {
      const { error: updErr } = await admin.from('profiles').update({ avatar_url: null } as any).eq('id', profile.id);
      if (updErr) {
        console.log(`  update fail: ${updErr.message}`);
        untouched += 1;
      } else {
        cleared += 1;
      }
      continue;
    }

    const filePath = `${profile.id}/avatar.jpg`;
    const { error: upErr } = await admin.storage
      .from('avatars')
      .upload(filePath, buffer, { upsert: true, contentType: 'image/jpeg' });
    if (upErr) {
      console.log(`upload fail ${upErr.message} — clearing`);
      await admin.from('profiles').update({ avatar_url: null } as any).eq('id', profile.id);
      cleared += 1;
      continue;
    }

    const { data: urlData } = admin.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;
    const { error: updErr } = await admin.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
    if (updErr) {
      console.log(`profile update fail ${updErr.message}`);
      untouched += 1;
      continue;
    }
    rehosted += 1;
    console.log(`re-hosted (${buffer.length} bytes)`);
  }

  console.log(`\nDone. Re-hosted: ${rehosted}, Cleared (will fall back to initials): ${cleared}, Untouched: ${untouched}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
