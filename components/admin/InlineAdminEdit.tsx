'use client';

import { useState } from 'react';
import { Pencil, X, Save, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

interface InlineAdminEditProps {
  eventId: string;
  initialData: {
    title: string;
    date: string;
    endDate?: string;
    city: string;
    country: string;
    region: string;
    organiser: string;
    association?: string;
    category: string;
    description: string;
    website: string;
    featured: boolean;
    image_path?: string;
  };
}

export function InlineAdminEdit({ eventId, initialData }: InlineAdminEditProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState(initialData);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('events').update({
      title: data.title,
      start_date: data.date,
      end_date: data.endDate || null,
      city: data.city,
      country: data.country,
      region: data.region,
      organiser: data.organiser,
      association: data.association || null,
      category: data.category,
      description: data.description,
      website: data.website,
      featured: data.featured,
      image_path: data.image_path || null,
    }).eq('id', eventId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); window.location.reload(); }, 800);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-xl sm:bottom-8 sm:right-8 sm:h-14 sm:w-14"
        title="Edit event (admin)"
      >
        <Pencil className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Edit Event</h2>
          <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Title" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date" value={data.date} onChange={(v) => setData({ ...data, date: v })} type="date" />
            <Field label="End date" value={data.endDate ?? ''} onChange={(v) => setData({ ...data, endDate: v })} type="date" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" value={data.city} onChange={(v) => setData({ ...data, city: v })} />
            <Field label="Country" value={data.country} onChange={(v) => setData({ ...data, country: v })} />
            <Field label="Region" value={data.region} onChange={(v) => setData({ ...data, region: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Organiser" value={data.organiser} onChange={(v) => setData({ ...data, organiser: v })} />
            <Field label="Association" value={data.association ?? ''} onChange={(v) => setData({ ...data, association: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" value={data.category} onChange={(v) => setData({ ...data, category: v })} />
            <Field label="Website" value={data.website} onChange={(v) => setData({ ...data, website: v })} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Description</label>
            <textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-300 focus:bg-white"
            />
          </div>
          <Field label="Image path (e.g. /cities/london.jpg or full URL)" value={data.image_path ?? ''} onChange={(v) => setData({ ...data, image_path: v })} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.featured}
              onChange={(e) => setData({ ...data, featured: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            <span className="text-sm font-medium text-slate-700">Featured event</span>
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? '✓ Saved' : <><Save className="h-4 w-4" /> Save changes</>}
          </button>
          <button onClick={() => setOpen(false)} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-300 focus:bg-white"
      />
    </div>
  );
}
