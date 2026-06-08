'use client';

import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UploadCloud, Film, Loader2, AlertCircle } from 'lucide-react';

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB ceiling (matches the storage bucket)
const ACCEPTED = ['video/mp4', 'video/quicktime', 'video/webm'];

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

    if (!ACCEPTED.includes(f.type)) {
      setFileError('Please choose an MP4, MOV, or WebM video.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError('That file is over 500 MB. Please trim or compress it.');
      return;
    }

    // Read the duration when we can (for display) — but never block on it.
    let secs: number | null = null;
    try {
      secs = await readDuration(f);
    } catch {
      secs = null;
    }
    if (maxSeconds != null && secs != null && secs > maxSeconds + 1) {
      setFileError(`Videos must be ${maxSeconds} seconds or less. Yours is ${Math.round(secs)}s.`);
      return;
    }

    setFile(f);
    setDuration(secs);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const uploadToStorage = async (f: File): Promise<string> => {
    const origin = window.location.origin;
    const contentType = f.type || 'video/mp4';

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
    const presign = (await presignRes.json()) as { token?: string; path?: string };
    if (!presign.token || !presign.path) {
      throw new Error('Upload could not start.');
    }

    const { error } = await supabase.storage
      .from('event-videos')
      .uploadToSignedUrl(presign.path, presign.token, f, { contentType });
    if (error) throw new Error(error.message);
    return presign.path; // private bucket: submit the object path
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

        {!previewUrl ? (
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
            <video src={previewUrl} controls playsInline className="aspect-video w-full rounded-2xl bg-black object-contain" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <Film className="h-3.5 w-3.5" /> {file?.name}
              </span>
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
        You'll get an email once it's approved. It's free to submit.
      </div>

      <button
        type="submit"
        disabled={!file || submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? 'Submitting…' : 'Submit for review'}
      </button>
      {!file && (
        <p className="text-xs text-slate-400">Choose a video, then submit — it uploads automatically.</p>
      )}
    </form>
  );
}
