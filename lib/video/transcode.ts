import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ffmpegStatic from 'ffmpeg-static';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

const run = promisify(execFile);
const BUCKET = 'event-videos';

// Auto-convert up to this size; bigger ones go to the manual queue (serverless
// time/disk limits make huge transcodes unreliable).
const MAX_AUTO_BYTES = 200 * 1024 * 1024;
const FFMPEG_TIMEOUT_MS = 240_000;

function ffmpegBin(): string {
  const p = ffmpegStatic as unknown as string | null;
  if (p && fs.existsSync(p)) return p;
  return path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg');
}

async function setStatus(admin: any, id: string, status: string, videoUrl?: string) {
  const patch: Record<string, unknown> = { transcode_status: status };
  if (videoUrl) patch.video_url = videoUrl;
  await admin.from('association_videos').update(patch).eq('id', id);
}

async function cleanup(...files: string[]) {
  for (const f of files) { try { await fsp.unlink(f); } catch {} }
}

type Row = { id: string; video_url: string };

async function processOne(admin: any, row: Row) {
  const { id } = row;
  const srcPath = row.video_url;
  try {
    // External URLs (phase-2 Blob etc.) — nothing to transcode.
    if (/^https?:\/\//i.test(srcPath)) { await setStatus(admin, id, 'ready'); return { id, action: 'external' }; }

    const ext = (srcPath.split('.').pop() || '').toLowerCase();
    // .mp4 is already web-friendly (assume H.264) — leave it.
    if (ext === 'mp4') { await setStatus(admin, id, 'ready'); return { id, action: 'already-mp4' }; }

    // Check size before downloading — too big → manual.
    const slash = srcPath.lastIndexOf('/');
    const dir = slash >= 0 ? srcPath.slice(0, slash) : '';
    const base = slash >= 0 ? srcPath.slice(slash + 1) : srcPath;
    const { data: listed } = await admin.storage.from(BUCKET).list(dir, { search: base, limit: 1 });
    const size = Number(listed?.[0]?.metadata?.size ?? 0);
    if (size > MAX_AUTO_BYTES) { await setStatus(admin, id, 'needs_manual'); return { id, action: 'too-big', size }; }

    // Download → transcode → upload.
    const { data: blob, error: dlErr } = await admin.storage.from(BUCKET).download(srcPath);
    if (dlErr || !blob) { await setStatus(admin, id, 'needs_manual'); return { id, action: 'download-failed' }; }
    const inBuf = Buffer.from(await blob.arrayBuffer());

    const tmpIn = path.join(os.tmpdir(), `in-${id}.${ext || 'mov'}`);
    const tmpOut = path.join(os.tmpdir(), `out-${id}.mp4`);
    await fsp.writeFile(tmpIn, inBuf);

    try {
      await run(ffmpegBin(), [
        '-i', tmpIn,
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
        '-vf', "scale='min(1280,iw)':-2",
        '-c:a', 'aac', '-b:a', '128k',
        '-movflags', '+faststart', '-pix_fmt', 'yuv420p',
        '-y', tmpOut,
      ], { timeout: FFMPEG_TIMEOUT_MS, maxBuffer: 1024 * 1024 * 16 });
    } catch (e) {
      await cleanup(tmpIn, tmpOut);
      await setStatus(admin, id, 'needs_manual');
      return { id, action: 'transcode-failed', error: String(e).slice(0, 200) };
    }

    const outBuf = await fsp.readFile(tmpOut);
    const newPath = `${srcPath.replace(/\.[^.]+$/, '')}-h264.mp4`;
    const { error: upErr } = await admin.storage.from(BUCKET).upload(newPath, outBuf, { contentType: 'video/mp4', upsert: true });
    await cleanup(tmpIn, tmpOut);
    if (upErr) { await setStatus(admin, id, 'needs_manual'); return { id, action: 'upload-failed', error: upErr.message }; }

    await setStatus(admin, id, 'ready', newPath);
    await admin.storage.from(BUCKET).remove([srcPath]); // drop the original
    return { id, action: 'transcoded', to: newPath, outBytes: outBuf.length };
  } catch (err) {
    await setStatus(admin, id, 'needs_manual');
    return { id, action: 'error', error: err instanceof Error ? err.message : String(err) };
  }
}

/** Process up to `limit` pending videos. Returns a per-video result list. */
export async function processPendingVideos(limit = 1) {
  const admin: any = createSupabaseAdminServerClient();

  // Recover anything stuck 'processing' for too long (a prior run died mid-job).
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  await admin.from('association_videos')
    .update({ transcode_status: 'pending' })
    .eq('transcode_status', 'processing')
    .lt('created_at', cutoff);

  const { data: rows } = await admin
    .from('association_videos')
    .select('id, video_url')
    .eq('transcode_status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);

  const out = [];
  for (const row of (rows ?? []) as Row[]) {
    // Atomically claim the row so an overlapping cron run can't grab it too.
    const { data: claimed } = await admin
      .from('association_videos')
      .update({ transcode_status: 'processing' })
      .eq('id', row.id)
      .eq('transcode_status', 'pending')
      .select('id');
    if (!claimed || claimed.length === 0) continue; // already taken by another run
    out.push(await processOne(admin, row));
  }
  return out;
}
