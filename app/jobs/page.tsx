'use client';

import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Clock, Mail, Plus, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
const SPECIALISATIONS = ['Corporate Investigation', 'Due Diligence', 'Fraud Investigation', 'Insurance Investigation', 'Background Checks', 'Digital Forensics', 'Surveillance', 'Missing Persons', 'Financial Crime', 'Legal Support'];

type Job = {
  id: string; title: string; description: string; location: string | null; country: string | null;
  type: string | null; specialisation: string | null; contact_email: string; created_at: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [type, setType] = useState('');
  const [spec, setSpec] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    supabase.from('job_posts').select('*').eq('is_active', true).order('created_at', { ascending: false }).then(({ data }) => setJobs(data ?? []));
  }, []);

  const filtered = jobs.filter((j) => {
    if (filterCountry && j.country !== filterCountry) return false;
    if (filterType && j.type !== filterType) return false;
    if (filterSpec && j.specialisation !== filterSpec) return false;
    return true;
  });

  const countries = [...new Set(jobs.map((j) => j.country).filter(Boolean))] as string[];

  const handlePost = async () => {
    if (!userId || !title || !description || !email) return;
    setPosting(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from('job_posts').insert({
      user_id: userId, title, description, location: location || null, country: country || null,
      type: type || null, specialisation: spec || null, contact_email: email, is_active: true,
    }).select('*').single();
    if (data) {
      setJobs((prev) => [data, ...prev]);
      setShowForm(false);
      setTitle(''); setDescription(''); setLocation(''); setCountry(''); setType(''); setSpec(''); setEmail('');
    }
    setPosting(false);
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-10 pt-24 sm:pb-16 sm:pt-32">
        <div className="container-shell relative text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-blue-600 sm:text-xs">Careers</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Job board</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500">Positions in the private investigation and intelligence sector.</p>
        </div>
      </div>

      <div className="container-shell py-10 sm:py-14">
        {/* Filters + post button */}
        <div className="flex flex-wrap items-center gap-3">
          <select className="field-input text-sm" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
            <option value="">All countries</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="field-input text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All types</option>
            {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="field-input text-sm" value={filterSpec} onChange={(e) => setFilterSpec(e.target.value)}>
            <option value="">All specialisations</option>
            {SPECIALISATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {userId && (
            <button type="button" onClick={() => setShowForm(true)} className="btn-primary ml-auto flex items-center gap-1.5 px-5 py-2.5 text-sm">
              <Plus className="h-4 w-4" /> Post a job
            </button>
          )}
        </div>

        {/* Post form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Post a job</h2>
                <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="mt-5 space-y-4">
                <input className="field-input w-full" placeholder="Job title *" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea className="field-input w-full" rows={4} placeholder="Description *" value={description} onChange={(e) => setDescription(e.target.value)} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className="field-input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                  <input className="field-input" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <select className="field-input" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">Job type</option>
                    {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select className="field-input" value={spec} onChange={(e) => setSpec(e.target.value)}>
                    <option value="">Specialisation</option>
                    {SPECIALISATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <input className="field-input w-full" type="email" placeholder="Contact email *" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="button" onClick={handlePost} disabled={posting || !title || !description || !email} className="btn-primary w-full px-6 py-3 text-sm disabled:opacity-50">
                  {posting ? 'Posting...' : 'Post job'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job list */}
        <div className="mt-8 space-y-4">
          {filtered.length === 0 && <p className="py-12 text-center text-sm text-slate-400">No jobs found matching your filters.</p>}
          {filtered.map((j) => (
            <div key={j.id} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{j.title}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {j.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location}{j.country ? `, ${j.country}` : ''}</span>}
                    {j.type && <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-600">{j.type}</span>}
                    {j.specialisation && <span className="rounded-full bg-violet-50 px-2 py-0.5 font-medium text-violet-600">{j.specialisation}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(j.created_at)}</span>
                  </div>
                </div>
                <a href={`mailto:${j.contact_email}`} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
                  <Mail className="h-3.5 w-3.5" /> Apply
                </a>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3">{j.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
