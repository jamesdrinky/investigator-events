'use client';

import { useEffect, useRef, useState } from 'react';
import * as tus from 'tus-js-client';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UploadCloud, Film, Link2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseVideoUrl } from '@/lib/utils/video-embed';

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB ceiling (matches the storage bucket)
const ACCEPTED = ['video/mp4', 'video/quicktime', 'video/webm'];

// Above this we never hand the file to a <video> element — not for the inline
// preview, not to read its duration. Decoding a several-hundred-MB local file
// exhausts the per-tab media memory on iOS Safari, which kills the tab with NO
// error event: the page simply reloads mid-upload and the user sees the form
// "just stop". Big files get a plain file card instead.
const PREVIEW_MAX_BYTES = 40 * 1024 * 1024;

// Upload breadcrumbs. If the browser kills the tab mid-upload (iOS does this
// silently under memory pressure) nothing can report the failure — but
// localStorage survives the reload, so the next page load can tell us exactly
// which step was reached. Cleared on success.
const DIAG_KEY = 'ie-upload-diag';

function diag(step: string) {
  try {
    const prev = JSON.parse(localStorage.getItem(DIAG_KEY) || '[]') as string[];
    const line = `${new Date().toISOString().slice(11, 19)} ${step}`;
    localStorage.setItem(DIAG_KEY, JSON.stringify([...prev, line].slice(-12)));
  } catch {
    /* private mode / storage full — diagnostics are best-effort */
  }
}

function clearDiag() {
  try {
    localStorage.removeItem(DIAG_KEY);
  } catch {
    /* ignore */
  }
}

// Shared between association member clips and event showcase videos. `action`
// is the server action to submit to. `maxSeconds` is an optional length cap
// (client-side soft check + label); pass null for no length limit (size only).
export function SubmitVideoForm({
  slug,
  targetName,
  action,
  maxSeconds = 45,
}: {
  slug: string;
  targetName: string;
  action: (formData: FormData) => void;
  maxSeconds?: number | null;
}) {
  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<string[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [mode, setMode] = useState<'upload' | 'link'>('upload');
  const [linkValue, setLinkValue] = useState('');
  const linkEmbed = linkValue.trim() ? parseVideoUrl(linkValue) : null;

  useEffect(() => {
    // iOS exports the chosen asset out of Photos before the page can see it,
    // and that export fails on long/high-bitrate clips regardless of file size
    // — so phones start on the link tab, which always works. Desktop keeps
    // upload as the default, where 500MB is fine.
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
    if (ios) setMode('link');
  }, []);

  // Surface an interrupted previous attempt (tab killed, phone locked, etc.).
  useEffect(() => {
    try {
      const prev = JSON.parse(localStorage.getItem(DIAG_KEY) || 'null') as string[] | null;
      if (prev && prev.length) setLastAttempt(prev);
    } catch {
      /* ignore */
    }
  }, []);

  const readDuration = (f: File) =>
    new Promise<number>((resolve, reject) => {
      const url = URL.createObjectURL(f);
      const el = document.createElement('video');
      el.preload = 'metadata';
      // Some files (e.g. iPhone HEVC) never fire loadedmetadata OR error in
      // some browsers — without this timeout the picker would hang forever and
      // the video would never appear in the form. Give up after 4s and proceed.
      const timer = setTimeout(() => { try { URL.revokeObjectURL(url); } catch {} reject(new Error('timeout')); }, 4000);
      el.onloadedmetadata = () => { clearTimeout(timer); resolve(el.duration); };
      el.onerror = () => { clearTimeout(timer); reject(new Error('Could not read video')); };
      el.src = url;
    });

  const onPick = async (f: File | null) => {
    setFileError(null);
    setUploadedUrl(null);
    setFile(null);
    setDuration(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    if (!f) return;

    // Some iOS exports arrive with an empty or odd MIME type; fall back to the
    // extension rather than rejecting a perfectly good video.
    const extOk = /\.(mp4|mov|m4v|webm)$/i.test(f.name);
    if (!ACCEPTED.includes(f.type) && !extOk) {
      setFileError('Please choose an MP4, MOV, or WebM video.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError('That file is over 500 MB. Please trim or compress it.');
      return;
    }

    // Only touch a <video> element for small files (see PREVIEW_MAX_BYTES).
    let secs: number | null = null;
    if (f.size <= PREVIEW_MAX_BYTES) {
      try {
        secs = await readDuration(f);
      } catch {
        secs = null;
      }
    }
    if (maxSeconds != null && secs != null && secs > maxSeconds + 1) {
      setFileError(`Videos must be ${maxSeconds} seconds or less. Yours is ${Math.round(secs)}s.`);
      return;
    }

    setFile(f);
    setDuration(secs);
    setPreviewUrl(f.size <= PREVIEW_MAX_BYTES ? URL.createObjectURL(f) : null);
  };

  // Resumable TUS upload in 6 MB chunks. A single PUT dies at ~100 MB at the
  // storage edge (Cloudflare request cap), so anything "up to 500 MB" MUST be
  // chunked. Bonus: retries survive flaky wifi, and we get real progress.
  const uploadToStorage = async (f: File): Promise<string> => {
    const origin = window.location.origin;
    const contentType = f.type || 'video/mp4';
    diag(`start ${(f.size / 1048576).toFixed(0)}MB type=${f.type || 'none'}`);
    setStatus('Preparing upload…');
    // Tell AppUpdater not to reload the page out from under an upload.
    (window as { __ieBusy?: boolean }).__ieBusy = true;

    // The presign route still gates the upload (auth, feature flag, rate
    // limit) and mints the object path; the transfer itself authenticates as
    // the signed-in user (RLS: insert-only into their own folder).
    const presignRes = await fetch(`${origin}/api/upload-video/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType }),
      credentials: 'include',
    });
    if (!presignRes.ok) {
      const body = await presignRes.json().catch(() => null);
      diag(`presign FAILED ${presignRes.status}`);
      throw new Error(body?.error || `Upload could not start (${presignRes.status})`);
    }
    const presign = (await presignRes.json()) as { path?: string };
    if (!presign.path) {
      diag('presign returned no path');
      throw new Error('Upload could not start.');
    }
    const path = presign.path;
    diag('presign ok');

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      diag('no session token');
      throw new Error('Please sign in again to upload.');
    }
    diag('session ok');
    setStatus('Uploading…');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    // Phones lock the screen mid-upload and suspend the transfer. Hold a wake
    // lock for the duration where the browser supports it (iOS 16.4+).
    let wakeLock: { release: () => Promise<void> } | null = null;
    try {
      wakeLock = await (navigator as Navigator & {
        wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> };
      }).wakeLock?.request('screen') ?? null;
    } catch {
      /* unsupported or denied — upload still works, screen may sleep */
    }

    try {
      await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(f, {
        endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        chunkSize: 6 * 1024 * 1024, // Supabase requires exactly 6 MB chunks
        headers: {
          authorization: `Bearer ${accessToken}`,
          'x-upsert': 'false',
        },
        metadata: {
          bucketName: 'event-videos',
          objectName: path,
          contentType,
          cacheControl: '3600',
        },
        onProgress: (sent, total) => {
          const pct = Math.round((sent / total) * 100);
          setUploadPct(pct);
          // Breadcrumb every 10% — enough to locate a silent death.
          if (pct % 10 === 0) diag(`progress ${pct}%`);
        },
        onError: (err) => {
          // Surface the server's own words when there are any — a silent
          // failure is the one outcome we can't debug from a user's phone.
          const res = (err as { originalResponse?: { getStatus: () => number; getBody: () => string } })
            .originalResponse;
          const detail = res ? `${res.getStatus()} ${String(res.getBody()).slice(0, 120)}` : err.message;
          diag(`tus error: ${String(detail).slice(0, 80)}`);
          reject(new Error(`Upload failed: ${detail || 'connection lost'}`));
        },
        onSuccess: () => resolve(),
      });

        // Resume a previous attempt of the same file if one exists.
        void upload.findPreviousUploads().then((previous) => {
          if (previous.length > 0) upload.resumeFromPreviousUpload(previous[0]);
          upload.start();
        });
      });
    } finally {
      (window as { __ieBusy?: boolean }).__ieBusy = false;
      try {
        await wakeLock?.release();
      } catch {
        /* nothing to do */
      }
    }

    diag('upload complete');
    setStatus('Finishing…');
    setUploadPct(null);
    return path; // private bucket: submit the object path
  };

  // One button: if the file isn't uploaded yet, upload it, then re-submit the
  // form natively so the server action (and its redirect) run the normal way.
  useEffect(() => {
    if (pendingSubmit && uploadedUrl) {
      setPendingSubmit(false);
      formRef.current?.requestSubmit();
    }
  }, [pendingSubmit, uploadedUrl]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Link mode: nothing to upload, the URL itself is the value.
    if (mode === 'link') {
      if (!linkEmbed) {
        e.preventDefault();
        setFileError('Paste a YouTube, Vimeo, or direct video link.');
        return;
      }
      setSubmitting(true);
      return;
    }
    if (uploadedUrl) {
      // Already uploaded — let the native form action submit.
      setSubmitting(true);
      return;
    }
    e.preventDefault();
    if (!file) {
      setFileError('Please choose a video first.');
      return;
    }
    setSubmitting(true);
    setFileError(null);
    setLastAttempt(null);
    clearDiag();
    uploadToStorage(file)
      .then((path) => {
        clearDiag();
        setUploadedUrl(path);
        setPendingSubmit(true);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
        diag(`caught: ${msg.slice(0, 80)}`);
        setFileError(msg);
        setStatus(null);
        setSubmitting(false);
      });
  };

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />
      <input
        type="hidden"
        name="videoUrl"
        value={mode === 'link' ? linkValue.trim() : uploadedUrl ?? ''}
      />
      <input type="hidden" name="durationSeconds" value={duration ?? ''} />
      {/* Step 1 — choose the file */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {maxSeconds != null
            ? `Your video (max ${maxSeconds >= 60 ? `${Math.round(maxSeconds / 60)} min` : `${maxSeconds}s`})`
            : 'Your video'}
        </label>

        {/* Upload vs link. A link is the reliable route for big clips — iOS
            won't release large videos from Photos to a web upload. */}
        <div className="mt-2 flex gap-2">
          {([
            { key: 'upload' as const, label: 'Upload a file', Icon: UploadCloud },
            { key: 'link' as const, label: 'Paste a link', Icon: Link2 },
          ]).map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key);
                setFileError(null);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                mode === key
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          // MUST stay the generic wildcard. Listing concrete types makes iOS
          // transcode the clip out of Photos before handing it over, which for
          // a large 4K/HEVC video spins in the picker and then silently
          // cancels — the file never reaches the page at all. `video/*` lets
          // iOS pass the original straight through.
          accept="video/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />

        {mode === 'link' ? (
          <div className="mt-3 space-y-2">
            <input
              type="url"
              inputMode="url"
              value={linkValue}
              onChange={(e) => {
                setLinkValue(e.target.value);
                setFileError(null);
              }}
              placeholder="https://youtube.com/watch?v=…"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {linkEmbed ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {linkEmbed.kind === 'youtube'
                  ? 'YouTube video recognised'
                  : linkEmbed.kind === 'vimeo'
                    ? 'Vimeo video recognised'
                    : 'Video link recognised'}
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-slate-500">
                {isIOS
                  ? 'Paste a YouTube, Vimeo, Dropbox or direct video link — the easiest way to send a video from a phone, with no size or length limit. Prefer to upload the file itself? Short clips work well; long ones are best from a computer.'
                  : 'Paste a YouTube, Vimeo, Dropbox or direct video link. No size limit, works from any device — ideal for long or high-resolution conference footage.'}
              </p>
            )}
          </div>
        ) : !file ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
          >
            <UploadCloud className="h-8 w-8 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Tap to choose a video</span>
            <span className="text-xs text-slate-400">MP4, MOV or WebM · up to 500 MB</span>
            {isIOS && (
              <span className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-400">
                Long or high-resolution clips can fail to leave an iPhone&apos;s camera roll — if this
                stalls, use &ldquo;Paste a link&rdquo; instead.
              </span>
            )}
          </button>
        ) : (
          <div className="mt-2 space-y-3">
            {previewUrl ? (
              <video src={previewUrl} controls playsInline className="aspect-video w-full rounded-2xl bg-black object-contain" />
            ) : (
              // Large file: deliberately no <video> element (memory).
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Film className="h-5 w-5 text-blue-600" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(0)} MB · ready to upload
                  </p>
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              {previewUrl && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <Film className="h-3.5 w-3.5" /> {file.name}
                </span>
              )}
              {duration !== null && <span>{Math.round(duration)}s</span>}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 underline-offset-2 hover:underline"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {fileError && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" /> {fileError}
          </p>
        )}
      </div>

      {/* Step 2 — details */}
      <div>
        <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Title <span className="font-normal normal-case text-slate-400">(optional)</span>
        </label>
        <input
          id="title"
          name="title"
          maxLength={120}
          placeholder={`e.g. ${targetName}`}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Description <span className="font-normal normal-case text-slate-400">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={600}
          placeholder="A short line about what your video shows."
          className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="rounded-xl bg-blue-50/70 px-4 py-3 text-xs leading-relaxed text-slate-600">
        Every video is reviewed by our team before it appears on the {targetName} page.
        You’ll get an email once it’s approved. It’s free to submit.
      </div>

      {lastAttempt && !submitting && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-bold text-amber-900">
            Your last upload didn&apos;t finish — here&apos;s how far it got:
          </p>
          <pre className="mt-1.5 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-amber-800">
            {lastAttempt.join('\n')}
          </pre>
          <button
            type="button"
            onClick={() => {
              clearDiag();
              setLastAttempt(null);
            }}
            className="mt-2 text-[11px] font-semibold text-amber-900 underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {status && uploadPct === null && (
        <p className="text-xs font-semibold text-slate-600">{status}</p>
      )}

      {uploadPct !== null && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Uploading your video…</span>
            <span>{uploadPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-[width] duration-300"
              style={{ width: `${uploadPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Large files can take a few minutes — if your connection drops, we pick up where it left off.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || (mode === 'link' ? !linkEmbed : !file)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting
          ? uploadPct !== null
            ? `Uploading ${uploadPct}%…`
            : 'Submitting…'
          : 'Submit for review'}
      </button>
      {mode === 'upload' && !file && (
        <p className="text-xs text-slate-400">Choose a video, then submit — it uploads automatically.</p>
      )}
    </form>
  );
}
