import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import ffmpegStatic from 'ffmpeg-static';

// TEMPORARY feasibility check: can ffmpeg run + transcode on Vercel? Delete after.
export const runtime = 'nodejs';
export const maxDuration = 60;

const run = promisify(execFile);

function resolveFfmpegPath(): string {
  const fromPkg = ffmpegStatic as unknown as string | null;
  if (fromPkg && fs.existsSync(fromPkg)) return fromPkg;
  return path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg');
}

export async function GET() {
  const ffmpegPath = resolveFfmpegPath();
  const result: Record<string, unknown> = { ffmpegPath, pkgPath: ffmpegStatic, exists: fs.existsSync(ffmpegPath) };

  try {
    // Ensure the bundled binary is executable (Vercel can strip the bit).
    try { fs.chmodSync(ffmpegPath, 0o755); } catch (e) { result.chmodNote = String(e); }

    const { stdout } = await run(ffmpegPath, ['-version']);
    result.version = stdout.split('\n')[0];

    // Real transcode test: generate a 1s clip → encode to H.264 MP4.
    const out = '/tmp/zz-ffmpeg-test.mp4';
    await run(ffmpegPath, [
      '-f', 'lavfi', '-i', 'color=c=blue:s=320x240:d=1',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-y', out,
    ]);
    const stat = fs.statSync(out);
    result.transcodeOk = stat.size > 0;
    result.outputBytes = stat.size;
    try { fs.unlinkSync(out); } catch {}

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, ...result, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
