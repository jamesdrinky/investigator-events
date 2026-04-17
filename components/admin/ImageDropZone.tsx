'use client';

import { useState, useRef, useCallback } from 'react';
import { ImageIcon, Upload, X, Loader2 } from 'lucide-react';

export function ImageDropZone({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue ?? '');
  const [preview, setPreview] = useState(defaultValue ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setError('');
    setUploading(true);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload-event-image', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setUrl(data.url);
      setPreview(data.url);
    } catch (err: any) {
      setError(err.message ?? 'Upload failed');
      setPreview('');
      setUrl('');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { setError('Only JPEG, PNG, and WebP'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Max 5MB'); return; }
    upload(file);
  }, [upload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const clear = () => {
    setUrl('');
    setPreview('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {/* Hidden input carries the URL value for form submission */}
      <input type="hidden" name={name} value={url} />

      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200">
          <img src={preview} alt="Cover" className="h-40 w-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition ${
            dragOver
              ? 'border-blue-400 bg-blue-50/50'
              : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          ) : (
            <>
              <Upload className="h-5 w-5 text-slate-400" />
              <p className="text-xs font-medium text-slate-500">Drop image here or click to browse</p>
              <p className="text-[10px] text-slate-400">JPEG, PNG, WebP up to 5MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
