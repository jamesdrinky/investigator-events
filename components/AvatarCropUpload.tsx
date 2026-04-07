'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Camera, ZoomIn, ZoomOut, Check, X, Upload } from 'lucide-react';

async function getCroppedBlob(imageSrc: string, crop: Area): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  await new Promise((resolve) => { image.onload = resolve; image.src = imageSrc; });

  const canvas = document.createElement('canvas');
  const size = 400; // Output 400x400
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
  });
}

type Props = {
  currentAvatar: string | null;
  fallbackInitial: string;
  accentColor: string;
  onUploaded: (url: string) => void;
  userId: string;
};

export function AvatarCropUpload({ currentAvatar, fallbackInitial, accentColor, onUploaded, userId }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const [error, setError] = useState<string | null>(null);

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    setError(null);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append('file', blob, 'avatar.jpg');

      const res = await fetch('/api/upload-avatar', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Upload failed');
      } else {
        onUploaded(json.url);
        setImageSrc(null);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload failed:', err);
    }
    setSaving(false);
  };

  // Crop modal
  if (imageSrc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-900">Adjust photo</h3>
            <button type="button" onClick={() => setImageSrc(null)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Crop area */}
          <div className="relative h-72 bg-slate-900">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 px-5 py-4">
            <ZoomOut className="h-4 w-4 text-slate-400" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-blue-600"
            />
            <ZoomIn className="h-4 w-4 text-slate-400" />
          </div>

          {/* Error */}
          {error && <p className="px-5 text-xs text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 border-t border-slate-100 px-5 py-4">
            <button type="button" onClick={() => setImageSrc(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" onClick={handleSaveCrop} disabled={saving} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
              <Check className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Upload zone
  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div
          className={`h-20 w-20 cursor-pointer overflow-hidden rounded-full border-[3px] transition-all sm:h-24 sm:w-24 ${dragging ? 'scale-105 border-blue-500' : ''}`}
          style={{ borderColor: dragging ? '#3b82f6' : accentColor }}
          onClick={() => document.getElementById('avatar-file-input')?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {currentAvatar ? (
            <img src={currentAvatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
              <Upload className="h-5 w-5 opacity-60" />
              <span className="mt-0.5 text-[9px] font-medium opacity-60">Upload</span>
            </div>
          )}
        </div>
        <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white shadow-md ring-2 ring-slate-200 transition hover:bg-slate-50">
          <Camera className="h-4 w-4 text-slate-600" />
          <input id="avatar-file-input" type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
        </label>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">Profile photo</p>
        <p className="text-xs text-slate-400">Click or drag to upload, then crop</p>
      </div>
    </div>
  );
}
