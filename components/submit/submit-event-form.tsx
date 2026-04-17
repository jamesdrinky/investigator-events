'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, MapPin, Calendar, Clock, Globe, FileText, Mail, User, Building2, Tag, Layers, ImageIcon, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { getCountriesForRegion } from '@/lib/forms/event-form-options';

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
  const [selectedRegion, setSelectedRegion] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<string[]>([...countries]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Clash detection
  type ClashEvent = { id: string; title: string; slug: string; start_date: string; end_date: string | null; city: string; country: string; association: string | null };
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clashes, setClashes] = useState<ClashEvent[]>([]);
  const [checkingClash, setCheckingClash] = useState(false);

  const checkClashes = useCallback(async (start: string, end: string) => {
    if (!start) { setClashes([]); return; }
    const effectiveEnd = end || start;
    setCheckingClash(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('events')
      .select('id, title, slug, start_date, end_date, city, country, association')
      .eq('approved', true)
      .lte('start_date', effectiveEnd)
      .or(`end_date.gte.${start},and(end_date.is.null,start_date.gte.${start})`)
      .order('start_date');
    const results = (data ?? []).filter((e: any) => {
      const eEnd = e.end_date ?? e.start_date;
      return e.start_date <= effectiveEnd && eEnd >= start;
    });
    setClashes(results as ClashEvent[]);
    setCheckingClash(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => checkClashes(startDate, endDate), 300);
    return () => clearTimeout(timeout);
  }, [startDate, endDate, checkClashes]);

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
            <div className={`flex items-center gap-3 rounded-[1.2rem] px-4 py-3 transition-all duration-500 ${
              clashes.length > 0
                ? 'bg-red-50 ring-2 ring-red-400/60 shadow-[0_0_20px_-4px_rgba(239,68,68,0.3)]'
                : 'bg-slate-50/80'
            }`}>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className={`h-4 w-4 ${clashes.length > 0 ? 'text-red-500' : ''}`} />
                <span className={`text-xs font-medium w-12 ${clashes.length > 0 ? 'text-red-600' : 'text-slate-500'}`}>Start</span>
              </div>
              <input type="date" name="startDate" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 border-0 bg-transparent text-sm font-medium text-slate-900 focus:outline-none" />
            </div>
            <div className={`relative flex items-center gap-3 rounded-[1.2rem] px-4 py-3 transition-all duration-500 ${
              clashes.length > 0
                ? 'bg-red-50 ring-2 ring-red-400/60 shadow-[0_0_20px_-4px_rgba(239,68,68,0.3)]'
                : 'bg-slate-50/80'
            }`}>
              <div className={`absolute -top-2 left-[1.65rem] h-2 w-px ${clashes.length > 0 ? 'bg-red-300' : 'bg-slate-200'}`} />
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className={`h-4 w-4 ${clashes.length > 0 ? 'text-red-500' : ''}`} />
                <span className={`text-xs font-medium w-12 ${clashes.length > 0 ? 'text-red-600' : 'text-slate-500'}`}>End</span>
              </div>
              <input type="date" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 border-0 bg-transparent text-sm font-medium text-slate-900 focus:outline-none" />
            </div>

            {/* Clash warning */}
            {clashes.length > 0 && (
              <div className="overflow-hidden rounded-[1.2rem] border-2 border-red-400/50 bg-gradient-to-r from-red-50 to-orange-50 shadow-[0_0_24px_-6px_rgba(239,68,68,0.25)]" style={{ animation: 'pulse-border 2s ease-in-out infinite' }}>
                <div className="flex items-center gap-2.5 border-b border-red-200/60 bg-red-100/50 px-4 py-2.5">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                  <p className="text-sm font-bold text-red-700">
                    Date clash — {clashes.length} existing {clashes.length === 1 ? 'event overlaps' : 'events overlap'}
                  </p>
                </div>
                <div className="space-y-1 p-2">
                  {clashes.slice(0, 5).map((c) => (
                    <Link
                      key={c.id}
                      href={`/events/${c.slug}`}
                      target="_blank"
                      className="flex items-center justify-between rounded-xl px-3 py-2 transition hover:bg-red-100/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{c.title}</p>
                        <p className="text-[11px] text-slate-500">{c.city}, {c.country} &middot; {c.start_date}{c.end_date ? ` – ${c.end_date}` : ''}</p>
                      </div>
                      {c.association && <span className="ml-2 flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">{c.association}</span>}
                    </Link>
                  ))}
                  {clashes.length > 5 && (
                    <p className="px-3 py-1 text-xs text-red-500">+{clashes.length - 5} more overlapping events</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Location — cascading: Region → Country → City */}
          <div className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <div className="flex-1 grid gap-2 sm:grid-cols-3">
              <select
                name="region"
                required
                value={selectedRegion}
                onChange={(e) => {
                  const region = e.target.value;
                  setSelectedRegion(region);
                  setFilteredCountries(getCountriesForRegion(region));
                }}
                className="border-0 bg-transparent text-sm text-slate-900 focus:outline-none"
              >
                <option value="" disabled>1. Region</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                name="country"
                required
                defaultValue=""
                disabled={!selectedRegion}
                className="border-0 bg-transparent text-sm text-slate-900 focus:outline-none disabled:text-slate-300"
              >
                <option value="" disabled>2. Country</option>
                {filteredCountries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input name="city" required maxLength={120} placeholder="3. City" disabled={!selectedRegion} className="border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:text-slate-300 disabled:placeholder:text-slate-300" />
            </div>
          </div>

          {/* Association (optional) */}
          <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <Building2 className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <select name="association" defaultValue="" className="flex-1 border-0 bg-transparent text-sm text-slate-900 focus:outline-none">
              <option value="">Association (optional)</option>
              {['ABI','WAD','IKD','CII','Intellenet','FEDERPOL','BuDEG','SNARP','EURODET','NCAPI','NCISS','FALI','CALI','TALI','FEWA','NFES','PSLD','LIDEPPE','ANDR','HDA','IBPI','DAF','SYL','FDDE','CKDS','FAPI','FSPD','SFPP','APDPE','APDU','IAIACE','DeZRS','SAD','ARD','PDPR','ALDONYS','NALI','ODV'].sort().map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
              <option value="other">Other (specify in notes)</option>
            </select>
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

          {/* Video URL (optional) */}
          <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <svg className="h-4 w-4 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
            <input type="text" name="videoUrl" inputMode="url" maxLength={500} placeholder="Video URL — YouTube or direct link (optional)" className="flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
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

      </div>
    </div>
  );
}
