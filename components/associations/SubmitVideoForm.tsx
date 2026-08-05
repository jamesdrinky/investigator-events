'use client';

import { useEffect, useRef, useState } from 'react';
import * as tus from 'tus-js-client';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UploadCloud, Film, Loader2, AlertCircle } from 'lucide-react';

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB ceiling (matches the storage bucket)
const ACCEPTED = ['video/mp4', 'video/quicktime', 'video/webm'];

// Above this we never hand the file to a <video> element — not for the inline
// preview, not to read its duration. Decoding a several-hundred-MB local file
// exhausts the per-tab media memory on iOS Safari, which kills the tab with NO
// error event: the page simply reloads mid-upload and the user sees the form
// "just stop". Big files get a plain file card instead.
const PREVIEW_MAX_BYTES = 40 * 1024 * 1024;

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
      throw new Error(body?.error || `Upload could not start (${presignRes.status})`);
    }
    const presign = (await presignRes.json()) as { path?: string };
    if (!presign.path) {
      throw new Error('Upload could not start.');
    }
    const path = presign.path;

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) throw new Error('Please sign in again to upload.');

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
          setUploadPct(Math.round((sent / total) * 100));
        },
        onError: (err) => {
          // Surface the server's own words when there are any — a silent
          // failure is the one outcome we can't debug from a user's phone.
          const res = (err as { originalResponse?: { getStatus: () => number; getBody: () => string } })
            .originalResponse;
          const detail = res ? `${res.getStatus()} ${String(res.getBody()).slice(0, 120)}` : err.message;
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
      try {
        await wakeLock?.release();
      } catch {
        /* nothing to do */
      }
    }

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
    uploadToStorage(file)
      .then((path) => {
        setUploadedUrl(path);
        setPendingSubmit(true);
      })
      .catch((err) => {
        setFileError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        setSubmitting(false);
      });
  };

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="videoUrl" value={uploadedUrl ?? ''} />
      <input type="hidden" name="durationSeconds" value={duration ?? ''} />
      {/* Step 1 — choose the file */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {maxSeconds != null
            ? `Your video (max ${maxSeconds >= 60 ? `${Math.round(maxSeconds / 60)} min` : `${maxSeconds}s`})`
            : 'Your video'}
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />

        {!file ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
          >
            <UploadCloud className="h-8 w-8 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Tap to choose a video</span>
            <span className="text-xs text-slate-400">MP4, MOV or WebM · up to 500 MB</span>
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
        disabled={!file || submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting
          ? uploadPct !== null
            ? `Uploading ${uploadPct}%…`
            : 'Submitting…'
          : 'Submit for review'}
      </button>
      {!file && (
        <p className="text-xs text-slate-400">Choose a video, then submit — it uploads automatically.</p>
      )}
    </form>
  );
}
