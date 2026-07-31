'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import {
  CheckCircle2, MapPin, Calendar, Clock, Globe, FileText, Mail, User, Building2,
  Tag, Layers, AlertTriangle, Loader2, ChevronRight, ChevronLeft, Search, Info,
} from 'lucide-react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { trackEvent } from '@/lib/analytics';
import { getCountriesForRegion } from '@/lib/forms/event-form-options';

/* ── Date helpers ─────────────────────────────────────────────────────── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
function fmt(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
function fmtRange(start: string, end: string): string {
  if (!start) return '';
  if (!end || end === start) return fmt(start);
  const [ys, ms, ds] = start.split('-').map(Number);
  const [ye, me, de] = end.split('-').map(Number);
  if (ys === ye && ms === me) return `${ds} – ${de} ${MONTHS[ms - 1]} ${ys}`;
  if (ys === ye) return `${ds} ${MONTHS[ms - 1]} – ${de} ${MONTHS[me - 1]} ${ys}`;
  return `${fmt(start)} – ${fmt(end)}`;
}
function addDays(iso: string, days: number): string {
  const dt = new Date(iso + 'T00:00:00Z');
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()) / 86400000);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary inline-flex min-h-12 w-full items-center justify-center gap-2 px-7 py-3.5 text-[16px] font-semibold disabled:opacity-60 sm:text-[15px]"
    >
      {pending ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</> : <>Submit event<ChevronRight className="h-4 w-4" /></>}
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

const STEPS = ['Details', 'Dates', 'Review'] as const;

export function SubmitEventForm({
  action, issuedAt, formToken, categories, scopes, regions, countries, associations, isSuccess, isError,
}: SubmitEventFormProps) {
  const [step, setStep] = useState(0); // 0 Details · 1 Dates · 2 Review
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (isSuccess) trackEvent('event_submitted');
  }, [isSuccess]);

  // Controlled fields (needed for validation, clash/dup checks, and the review preview)
  const [eventName, setEventName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<string[]>([...countries]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [organiser, setOrganiser] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  /* ── Date-clash detection ───────────────────────────────────────────── */
  type ClashEvent = { id: string; title: string; slug: string; start_date: string; end_date: string | null; city: string; country: string; association: string | null; cover: string | null };
  const [clashes, setClashes] = useState<ClashEvent[]>([]);
  const [checkingClash, setCheckingClash] = useState(false);

  const checkClashes = useCallback(async (start: string, end: string) => {
    if (!start) { setClashes([]); return; }
    const effectiveEnd = end || start;
    setCheckingClash(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('approved', true)
      .lte('start_date', effectiveEnd)
      .or(`end_date.gte.${start},and(end_date.is.null,start_date.gte.${start})`)
      .order('start_date');
    const results = (data ?? [])
      .filter((e: any) => {
        const eEnd = e.end_date ?? e.start_date;
        return e.start_date <= effectiveEnd && eEnd >= start;
      })
      .map((e: any) => ({
        id: e.id, title: e.title, slug: e.slug, start_date: e.start_date, end_date: e.end_date,
        city: e.city, country: e.country, association: e.association,
        cover: e.image_path ?? e.cover_image_url ?? e.image_url ?? e.image ?? null,
      }));
    setClashes(results as ClashEvent[]);
    setCheckingClash(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => checkClashes(startDate, endDate), 300);
    return () => clearTimeout(t);
  }, [startDate, endDate, checkClashes]);

  /* ── Duplicate / similar-event detection (soft, never blocks) ───────── */
  type DupEvent = { id: string; title: string; slug: string; start_date: string | null; city: string; country: string };
  const [duplicates, setDuplicates] = useState<DupEvent[]>([]);
  const [checkingDup, setCheckingDup] = useState(false);

  const checkDuplicates = useCallback(async (name: string, site: string) => {
    const cleanName = name.replace(/[(),%*]/g, ' ').replace(/\s+/g, ' ').trim();
    let host = '';
    try {
      const withProto = /^https?:\/\//i.test(site) ? site : `https://${site}`;
      host = new URL(withProto).host.replace(/^www\./, '').replace(/[(),%*]/g, '');
    } catch { host = ''; }
    if (cleanName.length < 5 && !host) { setDuplicates([]); return; }
    const filters: string[] = [];
    if (cleanName.length >= 5) filters.push(`title.ilike.%${cleanName}%`);
    if (host) filters.push(`website.ilike.%${host}%`);
    if (filters.length === 0) { setDuplicates([]); return; }
    setCheckingDup(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('events')
      .select('id, title, slug, start_date, city, country')
      .eq('approved', true)
      .or(filters.join(','))
      .limit(5);
    setDuplicates((data ?? []) as DupEvent[]);
    setCheckingDup(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => checkDuplicates(eventName, website), 400);
    return () => clearTimeout(t);
  }, [eventName, website, checkDuplicates]);

  /* ── Suggested alternative dates (shown when there's a clash) ────────── */
  const suggestions = useMemo(() => {
    if (!startDate || clashes.length === 0) return [] as Array<{ start: string; end: string; label: string }>;
    const dur = endDate ? Math.max(0, daysBetween(startDate, endDate)) : 0;
    let latest = startDate;
    for (const c of clashes) { const e = c.end_date ?? c.start_date; if (e > latest) latest = e; }
    const base = addDays(latest, 1);
    return [0, 7, 14].map((off) => {
      const s = addDays(base, off);
      const e = dur > 0 ? addDays(s, dur) : '';
      return { start: s, end: e, label: fmtRange(s, e) };
    });
  }, [startDate, endDate, clashes]);

  /* ── Per-step validation ────────────────────────────────────────────── */
  const emailOk = /\S+@\S+\.\S+/.test(contactEmail);
  const step0Missing = [
    !eventName.trim() && 'Event name',
    !selectedRegion && 'Region',
    !country && 'Country',
    !city.trim() && 'City',
    !organiser.trim() && 'Organiser name',
    !emailOk && 'Contact email',
    !website.trim() && 'Website',
    !category && 'Category',
  ].filter(Boolean) as string[];
  const step1Missing = [!startDate && 'Start date'].filter(Boolean) as string[];
  const stepMissing = step === 0 ? step0Missing : step === 1 ? step1Missing : [];

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollToTop = () => rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const goNext = () => {
    if (stepMissing.length > 0) { setShowErrors(true); scrollToTop(); return; }
    setShowErrors(false);
    setStep((s) => Math.min(2, s + 1));
    scrollToTop();
  };
  const goBack = () => { setShowErrors(false); setStep((s) => Math.max(0, s - 1)); scrollToTop(); };

  const errRing = (bad: boolean) => (showErrors && bad ? 'ring-2 ring-rose-300' : '');

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Submission received</p>
            <p className="text-xs text-emerald-600">It’s in the review queue — most listings go live within 48 hours.</p>
          </div>
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
    );
  }

  return (
    <div className="min-w-0" ref={rootRef}>
      {/* Header + stepper */}
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-950 sm:text-2xl">Publish your event</h2>
        <div className="mt-4 flex items-center">
          {STEPS.map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-2 ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${
                    done ? 'bg-blue-600 text-white' : current ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={`text-xs font-semibold sm:text-sm ${current || done ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
                </button>
                {i < STEPS.length - 1 && <span className={`mx-2 h-px flex-1 sm:mx-3 ${i < step ? 'bg-blue-500' : 'bg-slate-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {isError && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          Submission failed. Please check the required fields and try again.
        </div>
      )}

      <form action={action}>
        {/* Honeypot + signed state (always present) */}
        <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <input type="hidden" name="issuedAt" value={issuedAt} />
        <input type="hidden" name="formToken" value={formToken} />

        {/* Missing-fields notice — makes a blocked "Continue" obvious */}
        {showErrors && stepMissing.length > 0 && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
            <p className="text-sm text-rose-700"><span className="font-semibold">Still needed:</span> {stepMissing.join(', ')}.</p>
          </div>
        )}

        {/* ══ STEP 1 — DETAILS ══ */}
        <div className={step === 0 ? 'space-y-4' : 'hidden'}>
          <p className="text-[11px] text-slate-400">All fields required unless marked optional.</p>

          {/* Event name */}
          <div>
            <textarea
              name="eventName" required maxLength={140} rows={1} placeholder="Event name" value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className={`w-full resize-none rounded-2xl border border-transparent bg-transparent px-1 text-[1.65rem] font-bold leading-tight tracking-[-0.04em] text-slate-950 placeholder:text-slate-300 focus:outline-none sm:text-[2.25rem] ${errRing(!eventName.trim())}`}
              style={{ fontFamily: 'var(--font-serif), serif' }}
            />
            {/* Similar-event warning */}
            {duplicates.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-amber-300/70 bg-amber-50">
                <div className="flex items-center gap-2.5 border-b border-amber-200/70 px-4 py-2.5">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100"><Search className="h-3.5 w-3.5 text-amber-600" /></div>
                  <p className="min-w-0 text-sm font-bold text-amber-800">This may already be listed — {duplicates.length} similar {duplicates.length === 1 ? 'event' : 'events'}</p>
                  {checkingDup && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-amber-500" />}
                </div>
                <div className="space-y-0.5 p-2">
                  {duplicates.map((d) => (
                    <Link key={d.id} href={`/events/${d.slug}`} target="_blank" className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 transition hover:bg-amber-100/60">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{d.title}</p>
                        <p className="truncate text-[11px] text-slate-500">{d.city}, {d.country}{d.start_date ? ` · ${d.start_date}` : ''}</p>
                      </div>
                      <span className="flex-shrink-0 text-[11px] font-medium text-amber-600">View</span>
                    </Link>
                  ))}
                </div>
                <p className="px-4 pb-3 pt-1 text-[11px] leading-relaxed text-amber-700/80">If your event is different (or these are old), carry on — you can still submit.</p>
              </div>
            )}
          </div>

          {/* Location */}
          <Field icon={<MapPin className="h-4 w-4" />} label="Location">
            <div className="grid gap-2 sm:grid-cols-3">
              <select name="region" value={selectedRegion}
                onChange={(e) => { const r = e.target.value; setSelectedRegion(r); setFilteredCountries(getCountriesForRegion(r)); setCountry(''); }}
                className={`min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] text-slate-900 focus:border-blue-400 focus:outline-none sm:text-sm ${errRing(!selectedRegion)}`}>
                <option value="" disabled>Region</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select name="country" value={country} disabled={!selectedRegion} onChange={(e) => setCountry(e.target.value)}
                className={`min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] text-slate-900 focus:border-blue-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-300 sm:text-sm ${errRing(!country)}`}>
                <option value="" disabled>Country</option>
                {filteredCountries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input name="city" maxLength={120} placeholder="City" value={city} disabled={!selectedRegion} onChange={(e) => setCity(e.target.value)}
                className={`min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none disabled:bg-slate-50 sm:text-sm ${errRing(!city.trim())}`} />
            </div>
          </Field>

          {/* Organiser + contact */}
          <Field icon={<User className="h-4 w-4" />} label="Organiser">
            <div className="grid gap-2 sm:grid-cols-2">
              <input name="organiser" maxLength={140} placeholder="Organiser name" value={organiser} onChange={(e) => setOrganiser(e.target.value)}
                className={`min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none sm:text-sm ${errRing(!organiser.trim())}`} />
              <input type="email" name="contactEmail" maxLength={160} placeholder="Contact email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                className={`min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none sm:text-sm ${errRing(!emailOk)}`} />
            </div>
          </Field>

          {/* Website */}
          <Field icon={<Globe className="h-4 w-4" />} label="Website">
            <input type="text" name="website" inputMode="url" placeholder="example.com" value={website} onChange={(e) => setWebsite(e.target.value)}
              className={`min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none sm:text-sm ${errRing(!website.trim())}`} />
          </Field>

          {/* Category + listing type */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field icon={<Tag className="h-4 w-4" />} label="Category">
              <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}
                className={`min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] font-medium text-slate-900 focus:border-blue-400 focus:outline-none sm:text-sm ${errRing(!category)}`}>
                <option value="" disabled>Select</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field icon={<Layers className="h-4 w-4" />} label="Listing type">
              <select name="eventScope" defaultValue="main" className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] font-medium text-slate-900 focus:border-blue-400 focus:outline-none sm:text-sm">
                {scopes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Association (optional) */}
          <Field icon={<Building2 className="h-4 w-4" />} label="Association (optional)">
            <div className="grid gap-2 sm:grid-cols-2">
              <select name="association" defaultValue="" className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] text-slate-900 focus:border-blue-400 focus:outline-none sm:text-sm">
                <option value="">Association</option>
                {associations.map((a) => <option key={a} value={a}>{a}</option>)}
                <option value="other">Other (specify in notes)</option>
              </select>
              <select name="co_association" defaultValue="" className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] text-slate-900 focus:border-blue-400 focus:outline-none sm:text-sm">
                <option value="">Co-host</option>
                {associations.map((a) => <option key={a} value={a}>{a}</option>)}
                <option value="other">Other (specify in notes)</option>
              </select>
            </div>
          </Field>

          {/* Video (optional) */}
          <Field icon={<Globe className="h-4 w-4" />} label="Video URL (optional)">
            <input type="text" name="videoUrl" inputMode="url" maxLength={500} placeholder="YouTube or direct link"
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-[16px] text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none sm:text-sm" />
          </Field>

          {/* Notes */}
          <Field icon={<FileText className="h-4 w-4" />} label="Notes (optional)" alignTop>
            <textarea name="notes" rows={3} maxLength={2000} placeholder="Anything the review team should know"
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[16px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none sm:text-sm" />
          </Field>
        </div>

        {/* ══ STEP 2 — DATES ══ */}
        <div className={step === 1 ? 'space-y-4' : 'hidden'}>
          <p className="text-sm font-semibold text-slate-900">Select dates</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`rounded-2xl border px-4 py-3 transition-colors ${clashes.length > 0 ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><Calendar className="h-3.5 w-3.5" />Start</span>
              <input type="date" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className={`mt-1 min-h-9 w-full rounded-md bg-transparent text-[16px] font-medium text-slate-900 focus:outline-none sm:text-sm ${errRing(!startDate)}`} />
            </div>
            <div className={`rounded-2xl border px-4 py-3 transition-colors ${clashes.length > 0 ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><Clock className="h-3.5 w-3.5" />End <span className="normal-case text-slate-300">(optional)</span></span>
              <input type="date" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 min-h-9 w-full rounded-md bg-transparent text-[16px] font-medium text-slate-900 focus:outline-none sm:text-sm" />
            </div>
          </div>

          {checkingClash && !clashes.length && (
            <p className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" />Checking for clashes…</p>
          )}

          {/* No-clash reassurance */}
          {startDate && !checkingClash && clashes.length === 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">No date clashes</p>
                <p className="text-xs text-emerald-600">Your dates don’t overlap with any existing events.</p>
              </div>
            </div>
          )}

          {/* Clash warning with thumbnails */}
          {clashes.length > 0 && (
            <div className="overflow-hidden rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50">
              <div className="flex items-center gap-2.5 border-b border-red-200/70 bg-red-100/40 px-4 py-2.5">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
                <p className="min-w-0 text-sm font-bold text-red-700">Date clash — {clashes.length} existing {clashes.length === 1 ? 'event overlaps' : 'events overlap'}</p>
              </div>
              <div className="space-y-1 p-2">
                {clashes.slice(0, 5).map((c) => (
                  <Link key={c.id} href={`/events/${c.slug}`} target="_blank" className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-red-100/50">
                    <Thumb src={c.cover} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{c.title}</p>
                      <p className="truncate text-[11px] text-slate-500">{c.city}, {c.country} · {c.start_date}{c.end_date ? ` – ${c.end_date}` : ''}</p>
                    </div>
                    {c.association && <span className="flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">{c.association}</span>}
                  </Link>
                ))}
                {clashes.length > 5 && <p className="px-3 py-1 text-xs text-red-500">+{clashes.length - 5} more overlapping events</p>}
              </div>
            </div>
          )}

          {/* Suggested alternative dates */}
          {suggestions.length > 0 && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-blue-700"><Calendar className="h-4 w-4" />Suggested alternative dates</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s.start} type="button" onClick={() => { setStartDate(s.start); if (s.end) setEndDate(s.end); }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{s.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-blue-600/70">Tap a range to avoid the clash.</p>
            </div>
          )}
        </div>

        {/* ══ STEP 3 — REVIEW ══ */}
        <div className={step === 2 ? 'space-y-4' : 'hidden'}>
          {/* Clash summary */}
          {clashes.length > 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <div><p className="text-sm font-semibold text-red-700">{clashes.length} date clash{clashes.length === 1 ? '' : 'es'}</p><p className="text-xs text-red-500">Overlaps an existing event — you can still submit.</p></div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
              <div><p className="text-sm font-semibold text-emerald-800">No date clashes</p><p className="text-xs text-emerald-600">Your event dates don’t overlap with any existing events.</p></div>
            </div>
          )}
          {/* Similar summary */}
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3">
            {duplicates.length > 0 ? <Search className="h-5 w-5 flex-shrink-0 text-amber-500" /> : <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-amber-500" />}
            <div>
              <p className="text-sm font-semibold text-amber-800">{duplicates.length > 0 ? `${duplicates.length} similar event${duplicates.length === 1 ? '' : 's'}` : 'No similar events'}</p>
              <p className="text-xs text-amber-600">{duplicates.length > 0 ? 'We found events with matching names or hosts.' : 'No matching names, hosts or topics found.'}</p>
            </div>
          </div>

          {/* Your event preview */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
            <div className="flex gap-4 p-4">
              <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1668ff_0%,#6c3aff_100%)]">
                <span className="absolute left-2 top-2 rounded-md bg-black/25 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">Your event</span>
                <MapPin className="h-8 w-8 text-white/70" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-slate-950">{eventName || 'Your event'}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5 flex-shrink-0" /><span className="truncate">{[city, country].filter(Boolean).join(', ') || '—'}</span></p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500"><Calendar className="h-3.5 w-3.5 flex-shrink-0" />{fmtRange(startDate, endDate) || '—'}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${clashes.length > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                    <CheckCircle2 className="h-3 w-3" />{clashes.length > 0 ? `${clashes.length} clash${clashes.length === 1 ? '' : 'es'}` : 'No clashes'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                    <Search className="h-3 w-3" />{duplicates.length > 0 ? `${duplicates.length} similar` : 'No similar events'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Why this matters */}
          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-semibold text-blue-700">Why this matters</p>
              <p className="text-xs leading-relaxed text-blue-600/80">Accurate listings help investigators find, connect, and attend the right events worldwide. Every submission is reviewed before it goes live.</p>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">By submitting you agree it’ll be reviewed before going live. See our <a href="/privacy" className="underline underline-offset-2 hover:text-slate-600">privacy policy</a>.</p>
        </div>

        {/* ══ NAV ══ */}
        <div className="mt-6 flex items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={goBack} className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />Back
            </button>
          )}
          {step < 2 ? (
            <button type="button" onClick={goNext} className="btn-primary inline-flex min-h-12 flex-1 items-center justify-center gap-2 px-7 text-[16px] font-semibold sm:text-[15px]">
              Continue to {STEPS[step + 1].toLowerCase()}<ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex-1"><SubmitButton /></div>
          )}
        </div>
      </form>
    </div>
  );
}

/* ── Small building blocks ────────────────────────────────────────────── */
function Field({ icon, label, children, alignTop }: { icon: React.ReactNode; label: string; children: React.ReactNode; alignTop?: boolean }) {
  return (
    <div className={`flex gap-3 ${alignTop ? 'items-start' : 'items-start'}`}>
      <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
        {children}
      </div>
    </div>
  );
}

function Thumb({ src }: { src: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />;
  }
  return (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-300">
      <Calendar className="h-5 w-5 text-slate-400" />
    </div>
  );
}
