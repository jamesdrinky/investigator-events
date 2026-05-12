'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2, MapPin, Calendar, Clock, Globe, FileText, Mail, User, Building2, Tag, Layers, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { getCountriesForRegion } from '@/lib/forms/event-form-options';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary min-h-12 w-full px-7 py-3 text-[16px] sm:w-auto sm:text-[15px] disabled:opacity-60">
      {pending ? <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Submitting...</> : 'Create Event'}
    </button>
  );
}

interface SubmitEventFormProps {
  action: (formData: FormData) => void;
  issuedAt: string;
  formToken: string;
  categories: string[];
  scopes: Array<{ value: string; label: string }>;
  regions: readonly string[];
  countries: readonly string[];
  associations: readonly string[];
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
  associations,
  isSuccess,
  isError,
}: SubmitEventFormProps) {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<string[]>([...countries]);

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

  return (
    <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)]">
      {/* ── Left: Submission guidance ── */}
      <aside className="rounded-[1.25rem] border border-slate-200/80 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 sm:rounded-[1.6rem] sm:p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_4px_20px_-6px_rgba(37,99,235,0.24)]">
          <Building2 className="h-5 w-5 text-blue-500" />
        </div>
        <h2 className="mt-4 text-base font-bold text-slate-950">What helps approval</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          Add the public event page, confirmed date, organiser details, and any extra context in the notes field.
        </p>
        <div className="mt-4 space-y-2.5">
          {['Confirmed dates', 'Official website', 'Organiser contact', 'Association context'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Right: Form fields ── */}
      <div>
        {isSuccess && (
          <div className="mb-5 space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              Submission received. It has been added to the review queue.
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href="/weekly" className="rounded-xl border border-blue-100 bg-blue-50 p-4 transition hover:shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Subscribe to the newsletter</p>
                <p className="mt-0.5 text-xs text-slate-500">Get notified when your event goes live, plus weekly updates.</p>
              </a>
              <a href="/why-join-an-association" className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 transition hover:shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Why join an association?</p>
                <p className="mt-0.5 text-xs text-slate-500">Discover the benefits of professional membership.</p>
              </a>
            </div>
          </div>
        )}
        {isError && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            Submission failed. Please check the required fields and try again.
          </div>
        )}

        <form action={action} className="space-y-4 sm:space-y-5">
          <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <input type="hidden" name="issuedAt" value={issuedAt} />
          <input type="hidden" name="formToken" value={formToken} />

          <p className="text-[11px] text-slate-400">All fields required unless marked optional.</p>

          {/* Event name — big, lu.ma style */}
          <div>
            <textarea
              name="eventName"
              required
              maxLength={140}
              rows={1}
              placeholder="Event Name"
              className="w-full resize-none border-0 bg-transparent text-[1.65rem] font-bold leading-tight tracking-[-0.04em] text-slate-950 placeholder:text-slate-300 focus:outline-none sm:text-[2.5rem]"
              style={{ fontFamily: 'var(--font-serif), serif' }}
            />
          </div>

          {/* Date/time row */}
          <div className="space-y-2">
            <div className={`flex flex-col items-start gap-2 rounded-[1.2rem] px-4 py-3 transition-all duration-500 sm:flex-row sm:items-center sm:gap-3 ${
              clashes.length > 0
                ? 'bg-red-50 ring-2 ring-red-400/60 shadow-[0_0_20px_-4px_rgba(239,68,68,0.3)]'
                : 'bg-slate-50/80'
            }`}>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className={`h-4 w-4 ${clashes.length > 0 ? 'text-red-500' : ''}`} />
                <span className={`text-xs font-medium w-12 ${clashes.length > 0 ? 'text-red-600' : 'text-slate-500'}`}>Start</span>
              </div>
              <input type="date" name="startDate" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="min-h-10 w-full flex-1 border-0 bg-transparent text-[16px] font-medium text-slate-900 focus:outline-none sm:text-sm" />
            </div>
            <div className={`relative flex flex-col items-start gap-2 rounded-[1.2rem] px-4 py-3 transition-all duration-500 sm:flex-row sm:items-center sm:gap-3 ${
              clashes.length > 0
                ? 'bg-red-50 ring-2 ring-red-400/60 shadow-[0_0_20px_-4px_rgba(239,68,68,0.3)]'
                : 'bg-slate-50/80'
            }`}>
              <div className={`absolute -top-2 left-[1.65rem] h-2 w-px ${clashes.length > 0 ? 'bg-red-300' : 'bg-slate-200'}`} />
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className={`h-4 w-4 ${clashes.length > 0 ? 'text-red-500' : ''}`} />
                <span className={`text-xs font-medium w-12 ${clashes.length > 0 ? 'text-red-600' : 'text-slate-500'}`}>End</span>
              </div>
              <input type="date" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="min-h-10 w-full flex-1 border-0 bg-transparent text-[16px] font-medium text-slate-900 focus:outline-none sm:text-sm" />
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
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-3">
              <select
                name="region"
                required
                value={selectedRegion}
                onChange={(e) => {
                  const region = e.target.value;
                  setSelectedRegion(region);
                  setFilteredCountries(getCountriesForRegion(region));
                }}
                className="min-h-10 w-full border-0 bg-transparent text-[16px] text-slate-900 focus:outline-none sm:text-sm"
              >
                <option value="" disabled>1. Region</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                name="country"
                required
                defaultValue=""
                disabled={!selectedRegion}
                className="min-h-10 w-full border-0 bg-transparent text-[16px] text-slate-900 focus:outline-none disabled:text-slate-300 sm:text-sm"
              >
                <option value="" disabled>2. Country</option>
                {filteredCountries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input name="city" required maxLength={120} placeholder="3. City" disabled={!selectedRegion} className="min-h-10 w-full border-0 bg-transparent text-[16px] text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:text-slate-300 disabled:placeholder:text-slate-300 sm:text-sm" />
            </div>
          </div>

          {/* Association (optional) */}
          <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <Building2 className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              <select name="association" defaultValue="" className="min-h-10 w-full border-0 bg-transparent text-[16px] text-slate-900 focus:outline-none sm:text-sm">
                <option value="">Association (optional)</option>
                {associations.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
                <option value="other">Other (specify in notes)</option>
              </select>
              <select name="co_association" defaultValue="" className="min-h-10 w-full border-0 bg-transparent text-[16px] text-slate-900 focus:outline-none sm:text-sm">
                <option value="">Co-host (optional)</option>
                {associations.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
                <option value="other">Other (specify in notes)</option>
              </select>
            </div>
          </div>

          {/* Organiser + Contact */}
          <div className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
              <input name="organiser" required maxLength={140} placeholder="Organiser name" className="min-h-10 w-full border-0 bg-transparent text-[16px] text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm" />
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
                <input type="email" name="contactEmail" required maxLength={160} placeholder="Contact email" className="min-h-10 min-w-0 flex-1 border-0 bg-transparent text-[16px] text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm" />
              </div>
            </div>
          </div>

          {/* Website */}
          <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <Globe className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <input type="text" name="website" inputMode="url" placeholder="Event website (optional, e.g. example.com)" className="min-h-10 min-w-0 flex-1 border-0 bg-transparent text-[16px] text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm" />
          </div>

          {/* Video URL (optional) */}
          <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <svg className="h-4 w-4 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
            <input type="text" name="videoUrl" inputMode="url" maxLength={500} placeholder="Video URL — YouTube or direct link (optional)" className="min-h-10 min-w-0 flex-1 border-0 bg-transparent text-[16px] text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm" />
          </div>

          {/* Description / Notes */}
          <div className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200/60 bg-white px-4 py-3 transition-colors hover:border-slate-300">
            <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <textarea name="notes" rows={4} maxLength={2000} placeholder="Description or notes for the review team" className="min-w-0 flex-1 resize-none border-0 bg-transparent text-[16px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm" />
          </div>

          {/* Event options (lu.ma style settings rows) */}
          <div className="overflow-hidden rounded-[1.2rem] border border-slate-200/60 bg-white">
            <p className="border-b border-slate-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Event Options
            </p>

            {/* Category */}
            <div className="flex flex-col items-start gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
              <Tag className="h-4 w-4 text-slate-400" />
              <span className="w-24 text-xs font-medium text-slate-500">Category</span>
              <select name="category" required defaultValue="" className="min-h-10 w-full flex-1 border-0 bg-transparent text-[16px] font-medium text-slate-900 focus:outline-none sm:text-sm">
                <option value="" disabled>Select</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Scope */}
            <div className="flex flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
              <Layers className="h-4 w-4 text-slate-400" />
              <span className="w-24 text-xs font-medium text-slate-500">Listing type</span>
              <select name="eventScope" defaultValue="main" className="min-h-10 w-full flex-1 border-0 bg-transparent text-[16px] font-medium text-slate-900 focus:outline-none sm:text-sm">
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
            <SubmitButton />
          </div>
        </form>

      </div>
    </div>
  );
}
