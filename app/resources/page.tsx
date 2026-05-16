'use client';

import { useEffect, useState } from 'react';
import { BookOpen, ExternalLink, Plus, X, Tag } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const CATEGORIES = ['Guide', 'Template', 'Training', 'Legal Reference', 'Software Tool', 'Industry Report', 'Podcast', 'Video'];

type Resource = {
  id: string; title: string; description: string | null; url: string;
  category: string | null; association_slug: string | null; created_at: string;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filterCat, setFilterCat] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    supabase.from('resources').select('*').eq('approved', true).order('created_at', { ascending: false }).then(({ data }) => setResources((data ?? []).map((r) => ({
      id: r.id, title: r.title, description: r.description, url: r.url,
      category: r.category, association_slug: r.association_slug, created_at: r.created_at ?? '',
    }))));
  }, []);

  const filtered = resources.filter((r) => !filterCat || r.category === filterCat);

  const handleSubmit = async () => {
    if (!userId || !title || !url) return;
    setPosting(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('resources').insert({
      user_id: userId, title, description: description || null, url, category: category || null, approved: false,
    });
    setShowForm(false);
    setTitle(''); setDescription(''); setUrl(''); setCategory('');
    setPosting(false);
  };

  const catColors: Record<string, string> = {
    Guide: 'bg-blue-50 text-blue-600', Template: 'bg-violet-50 text-violet-600', Training: 'bg-emerald-50 text-emerald-600',
    'Legal Reference': 'bg-amber-50 text-amber-700', 'Software Tool': 'bg-cyan-50 text-cyan-700',
    'Industry Report': 'bg-rose-50 text-rose-600', Podcast: 'bg-pink-50 text-pink-600', Video: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-10 pt-24 sm:pb-16 sm:pt-32">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-20 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_65%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-10 -right-20 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.14),transparent_65%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="container-shell relative text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600 backdrop-blur-sm sm:tracking-[0.3em]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)] animate-pulse" />
            Library
          </span>
          <h1 className="mt-3 text-[2rem] font-bold leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-[3.5rem] lg:text-[4.5rem]">
            <span
              className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
              style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
            >
              Resources
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">Guides, templates, and tools for the investigation community.</p>
        </div>
      </div>

      <div className="container-shell py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
          <select className="field-input w-full text-sm sm:w-auto" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {userId && (
            <button type="button" onClick={() => setShowForm(true)} className="btn-primary flex w-full items-center justify-center gap-1.5 px-5 py-2.5 text-sm sm:ml-auto sm:w-auto">
              <Plus className="h-4 w-4" /> Submit resource
            </button>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Submit a resource</h2>
                <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <p className="mt-1 text-xs text-slate-400">Submissions are reviewed before publishing.</p>
              <div className="mt-5 space-y-4">
                <input className="field-input w-full" placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea className="field-input w-full" rows={3} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input className="field-input w-full" placeholder="URL *" value={url} onChange={(e) => setUrl(e.target.value)} />
                <select className="field-input w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" onClick={handleSubmit} disabled={posting || !title || !url} className="btn-primary w-full px-6 py-3 text-sm disabled:opacity-50">
                  {posting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 && <p className="col-span-full py-12 text-center text-sm text-slate-400">No resources found.</p>}
          {filtered.map((r) => (
            <div key={r.id} className="group flex flex-col rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <a href={r.url} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{r.title}</h3>
              {r.description && <p className="mt-1.5 text-xs leading-relaxed text-slate-500 line-clamp-2">{r.description}</p>}
              {r.category && (
                <span className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${catColors[r.category] ?? 'bg-slate-50 text-slate-600'}`}>
                  <Tag className="h-2.5 w-2.5" /> {r.category}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
