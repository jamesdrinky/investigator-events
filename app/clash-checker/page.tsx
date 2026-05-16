'use client';

import { useState } from 'react';
import { Calendar, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const REGIONS = ['Europe', 'North America', 'Asia-Pacific', 'Middle East', 'Latin America', 'Africa'];

type ClashEvent = { id: string; title: string; slug: string | null; start_date: string | null; end_date: string | null; city: string; country: string; association: string | null };

export default function ClashCheckerPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [region, setRegion] = useState('');
  const [clashes, setClashes] = useState<ClashEvent[]>([]);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setChecked(false);
    const supabase = createSupabaseBrowserClient();

    let query = supabase
      .from('events')
      .select('id, title, slug, start_date, end_date, city, country, association')
      .eq('approved', true)
      .lte('start_date', endDate)
      .or(`end_date.gte.${startDate},end_date.is.null`);

    if (region) query = query.eq('region', region);

    const { data } = await query.order('start_date');

    // Filter: event overlaps with proposed range
    const results = (data ?? []).filter((e) => {
      const eStart = e.start_date ?? '';
      const eEnd = e.end_date ?? e.start_date ?? '';
      return eStart <= endDate && eEnd >= startDate;
    });

    setClashes(results);
    setChecked(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      {/* Hero — futuristic vocabulary */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-10 pt-24 sm:pb-16 sm:pt-32">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-20 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_65%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-10 -right-20 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.14),transparent_65%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="container-shell relative text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600 backdrop-blur-sm sm:tracking-[0.3em]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)] animate-pulse" />
            Planning tool
          </span>
          <h1 className="mt-3 text-[2rem] font-bold leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-[3.5rem] lg:text-[4.5rem]">
            Date{' '}
            <span
              className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
              style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
            >
              clash
            </span>{' '}
            checker
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">Check if your proposed event dates overlap with existing conferences in the calendar.</p>
        </div>
      </div>

      <div className="container-shell py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          {/* Form */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Proposed start date</label>
                <div className="mt-1.5 flex min-h-[2.75rem] items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <input type="date" className="flex-1 border-0 bg-transparent text-sm outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Proposed end date</label>
                <div className="mt-1.5 flex min-h-[2.75rem] items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <input type="date" className="flex-1 border-0 bg-transparent text-sm outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">Region (optional)</label>
              <select className="field-input mt-1.5 w-full" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">All regions</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={handleCheck}
              disabled={!startDate || !endDate || loading}
              className="btn-primary mt-6 w-full px-6 py-3 text-sm disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check for clashes'}
            </button>
          </div>

          {/* Results */}
          {checked && (
            <div className="mt-8">
              {clashes.length > 0 ? (
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="h-5 w-5" />
                    <h2 className="text-lg font-bold">Your dates clash with {clashes.length} event{clashes.length > 1 ? 's' : ''}</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {clashes.map((e) => (
                      <a key={e.id} href={`/events/${e.slug}`} className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-white p-4 transition hover:shadow-sm">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3 shrink-0" /> {new Date(e.start_date ?? '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}{e.end_date ? ` – ${new Date(e.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /> {e.city}, {e.country}</span>
                          </div>
                          {e.association && <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{e.association}</span>}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-6 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                  <h2 className="mt-2 text-lg font-bold text-emerald-700">No clashes found</h2>
                  <p className="mt-1 text-sm text-emerald-600">Your proposed dates are clear — safe to proceed.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
