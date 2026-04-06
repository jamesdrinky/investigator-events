'use client';

import { useRef, useState } from 'react';
import { Camera, MapPin, Calendar, Clock, Globe, FileText, Mail, User, Building2, Tag, Layers, ImageIcon } from 'lucide-react';

interface SubmitEventFormProps {
  action: (formData: FormData) => void;
  issuedAt: string;
  formToken: string;
  categories: string[];
  scopes: Array<{ value: string; label: string }>;
  regions: readonly string[];
  countries: readonly string[];
  isSuccess?: boolean;
  isError?: boolean;
}

export function SubmitEventForm({
  action,
  issuedAt,
  formToken,
  categories,
  scopes,
  regions,
  countries,
  isSuccess,
  isError,
}: SubmitEventFormProps) {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)]">
      {/* ── Left: Cover image + Logo ── */}
      <div className="space-y-4">
        {/* Cover image upload */}
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="group relative aspect-square w-full overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 transition-all duration-300 hover:border-blue-300 hover:shadow-[0_12px_40px_-12px_rgba(99,102,241,0.2)]"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_4px_20px_-6px_rgba(99,102,241,0.2)]">
                <ImageIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Upload Cover Image</p>
                <p className="mt-0.5 text-xs text-slate-400">Click to choose a photo</p>
              </div>
            </div>
          )}
          {/* Hover overlay on existing image */}
          {coverPreview && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
                <Camera className="h-5 w-5 text-slate-700" />
              </div>
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleImageChange(e, setCoverPreview)}
          />
        </button>

        {/* Logo upload (smaller, bottom-right overlap like lu.ma) */}
        <div className="-mt-10 ml-4 relative z-10">
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="group flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-white bg-gradient-to-br from-blue-50 to-indigo-50 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.12)] transition-all duration-200 hover:shadow-[0_8px_24px_-6px_rgba(99,102,241,0.25)]"
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-6 w-6 text-blue-400 transition-colors group-hover:text-blue-600" />
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => handleImageChange(e, setLogoPreview)}
            />
          </button>
          <p className="mt-1.5 text-[10px] text-slate-400">Organiser logo</p>
        </div>
      </div>

      {/* ── Right: Form fields ── */}
      <div>
        {isSuccess && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            Submission received. It has been added to the review queue.
          </div>
        )}
        {isError && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            Submission failed. Please check the required fields and try again.
          </div>
        )}

        <form action={action} className="space-y-5">
          <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <input type="hidden" name="issuedAt" value={issuedAt} />
          <input type="hidden" name="formToken" value={formToken} />

          {/* Event name — big, lu.ma style */}
          <div>
            <textarea
              name="eventName"
              required
              maxLength={140}
              rows={1}
              placeholder="Event Name"
              className="w-full resize-none border-0 bg-transparent text-[2rem] font-bold leading-tight tracking-[-0.04em] text-slate-950 placeholder:text-slate-300 focus:outline-none sm:text-[2.5rem]"
              style={{ fontFamily: 'var(--font-serif), serif' }}
            />
          </div>

          {/* Date/time row */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-[1.2rem] bg-slate-50/80 px-4 py-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium text-slate-500 w-12">Start</span>
              </div>
              <input type="date" name="startDate" required className="flex-1 border-0 bg-transparent text-sm font-medium text-slate-900 focus:outline-none" />
            </div>
            <div className="relative flex items-center gap-3 rounded-[1.2rem] bg-slate-50/80 px-4 py-3">
              {/* Timeline connector */}
              <div className="absolute -top-2 left-[1.65rem] h-2 w-px bg-slate-200" />
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium text-slate-500 w-12">End</span>
              </div>
              <input type="date" name="endDate" className="flex-1 border-0 bg-transparent text-sm font-medium text-slate-900 focus:outline-none" />
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <div className="flex-1 grid gap-2 sm:grid-cols-3">
              <input name="city" required maxLength={120} placeholder="City" className="border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
              <input name="country" list="submit-event-country-options" required maxLength={120} placeholder="Country" className="border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
              <select name="region" required defaultValue="" className="border-0 bg-transparent text-sm text-slate-900 focus:outline-none">
                <option value="" disabled>Region</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Organiser + Contact */}
          <div className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <div className="flex-1 grid gap-2 sm:grid-cols-2">
              <input name="organiser" required maxLength={140} placeholder="Organiser name" className="border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
                <input type="email" name="contactEmail" required maxLength={160} placeholder="Contact email" className="flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Website */}
          <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <Globe className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <input type="text" name="website" required inputMode="url" placeholder="Event website (e.g. example.com)" className="flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
          </div>

          {/* Description / Notes */}
          <div className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <textarea name="notes" rows={3} maxLength={2000} placeholder="Description or notes for the review team" className="flex-1 resize-none border-0 bg-transparent text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none" />
          </div>

          {/* Event options (lu.ma style settings rows) */}
          <div className="overflow-hidden rounded-[1.2rem] border border-slate-200/60 bg-white">
            <p className="border-b border-slate-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Event Options
            </p>

            {/* Category */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <Tag className="h-4 w-4 text-slate-400" />
              <span className="w-24 text-xs font-medium text-slate-500">Category</span>
              <select name="category" required defaultValue="" className="flex-1 border-0 bg-transparent text-sm font-medium text-slate-900 focus:outline-none">
                <option value="" disabled>Select</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Scope */}
            <div className="flex items-center gap-3 px-4 py-3">
              <Layers className="h-4 w-4 text-slate-400" />
              <span className="w-24 text-xs font-medium text-slate-500">Listing type</span>
              <select name="eventScope" defaultValue="main" className="flex-1 border-0 bg-transparent text-sm font-medium text-slate-900 focus:outline-none">
                {scopes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs leading-relaxed text-slate-400">
                Submissions are reviewed before going live. See our{' '}
                <a href="/privacy" className="underline underline-offset-2 hover:text-slate-600">privacy policy</a>.
              </p>
            </div>
            <button type="submit" className="btn-primary w-full px-7 py-3 text-[15px] sm:w-auto">
              Create Event
            </button>
          </div>
        </form>

        <datalist id="submit-event-country-options">
          {countries.map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>
    </div>
  );
}
