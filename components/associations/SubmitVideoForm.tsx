'use client';

import { useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UploadCloud, Film, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB ceiling (matches the storage bucket)
const ACCEPTED = ['video/mp4', 'video/quicktime', 'video/webm'];

// Shared between association member clips (short) and event showcase videos
// (longer). `action` is the server action to submit to; `maxSeconds` is the
// length cap shown + enforced client-side.
export function SubmitVideoForm({
  slug,
  targetName,
  action,
  maxSeconds = 45,
}: {
  slug: string;
  targetName: string;
  action: (formData: FormData) => void;
  maxSeconds?: number;
}) {
  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const readDuration = (f: File) =>
    new Promise<number>((resolve, reject) => {
      const url = URL.createObjectURL(f);
      const el = document.createElement('video');
      el.preload = 'metadata';
      el.onloadedmetadata = () => {
        resolve(el.duration);
      };
      el.onerror = () => reject(new Error('Could not read video'));
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
      setFileError('That file is over 200 MB. Please trim or compress it.');
      return;
    }

    let secs: number | null = null;
    try {
      secs = await readDuration(f);
    } catch {
      // Some browsers can't read metadata for certain codecs — let the server
      // cap stand and proceed without a client-side number.
      secs = null;
    }
    if (secs !== null && secs > maxSeconds + 1) {
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
    const presign = (await presignRes.json()) as {
      token?: string; path?: string;
    };
    if (!presign.token || !presign.path) {
      throw new Error('Upload could not start.');
    }

    const { error } = await supabase.storage
      .from('event-videos')
      .uploadToSignedUrl(presign.path, presign.token, f, { contentType });
    if (error) {
      throw new Error(error.message);
    }
    // Private bucket: submit the object path, not a public URL.
    return presign.path;
  };

  const onUpload = async () => {
    if (!file) return;
    setUploading(true);
    setFileError(null);
    try {
      const url = await uploadToStorage(file);
      setUploadedUrl(url);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      action={action}
      onSubmit={() => setSubmitting(true)}
      className="space-y-6"
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="videoUrl" value={uploadedUrl ?? ''} />
      <input type="hidden" name="durationSeconds" value={duration ?? ''} />

      {/* Step 1 — choose + upload the file */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Your video (max {maxSeconds >= 60 ? `${Math.round(maxSeconds / 60)} min` : `${maxSeconds}s`})
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
            <span className="text-xs text-slate-400">MP4, MOV or WebM · up to 200 MB</span>
          </button>
        ) : (
          <div className="mt-2 space-y-3">
            <video
              src={previewUrl}
              controls
              playsInline
              className="aspect-video w-full rounded-2xl bg-black object-contain"
            />
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

            {!uploadedUrl ? (
              <button
                type="button"
                onClick={onUpload}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {uploading ? 'Uploading…' : 'Upload video'}
              </button>
            ) : (
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Uploaded
              </p>
            )}
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
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={120}
          placeholder={`e.g. Why I joined ${targetName}`}
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
        disabled={!uploadedUrl || submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? 'Submitting…' : 'Submit for review'}
      </button>
      {!uploadedUrl && (
        <p className="text-xs text-slate-400">Upload your video first to enable submission.</p>
      )}
    </form>
  );
}
