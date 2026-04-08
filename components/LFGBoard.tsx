'use client';

import { useEffect, useState } from 'react';
import { Search, MapPin, Clock, AlertCircle, CheckCircle, Plus, Send } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

type LFGPost = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  specialism: string | null;
  location: string | null;
  country: string | null;
  urgency: string;
  status: string;
  responses_count: number;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
};

const URGENCY_COLORS = {
  urgent: 'bg-red-50 text-red-700 border-red-200',
  normal: 'bg-blue-50 text-blue-700 border-blue-200',
  flexible: 'bg-slate-50 text-slate-600 border-slate-200',
};

const SPECIALISMS = [
  'Surveillance', 'Due Diligence', 'Asset Tracing', 'Background Checks', 'Insurance Investigation',
  'Fraud Investigation', 'Corporate Investigation', 'Digital Forensics', 'OSINT', 'Missing Persons',
  'Process Serving', 'Skip Tracing', 'Litigation Support', 'Counter Surveillance', 'Cyber Investigation',
];

export function LFGBoard() {
  const [posts, setPosts] = useState<LFGPost[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specialism, setSpecialism] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState('normal');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    supabase
      .from('lfg_posts' as any)
      .select('*, profiles:user_id(full_name, avatar_url)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setPosts((data ?? []).map((r: any) => ({
          ...r, full_name: r.profiles?.full_name, avatar_url: r.profiles?.avatar_url,
        })));
        setLoading(false);
      });
  }, []);

  const handleCreate = async () => {
    if (!userId || !title.trim() || !description.trim()) return;
    setCreating(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('lfg_posts' as any)
      .insert({ user_id: userId, title: title.trim(), description: description.trim(), specialism: specialism || null, location: location || null, urgency } as any)
      .select('*, profiles:user_id(full_name, avatar_url)')
      .single();

    if (data) {
      const d = data as any;
      setPosts((prev) => [{ ...d, full_name: d.profiles?.full_name, avatar_url: d.profiles?.avatar_url }, ...prev]);
      setTitle(''); setDescription(''); setSpecialism(''); setLocation(''); setUrgency('normal');
      setShowCreate(false);
    }
    setCreating(false);
  };

  const timeAgo = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(ms / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Looking For</h2>
          <p className="text-xs text-slate-400">Find or offer investigation services</p>
        </div>
        {userId && (
          <button type="button" onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Post a request
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/30 p-5 space-y-3">
          <input className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-400" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you looking for? e.g. Surveillance specialist in Milan" />
          <textarea className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the work, timeline, requirements..." />
          <div className="grid gap-3 sm:grid-cols-3">
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={specialism} onChange={(e) => setSpecialism(e.target.value)}>
              <option value="">Specialism</option>
              {SPECIALISMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-500">Cancel</button>
            <button type="button" onClick={handleCreate} disabled={creating || !title.trim()} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {creating ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 p-12 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">No open requests yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar src={post.avatar_url} name={post.full_name} size={36} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{post.full_name}</p>
                    <p className="text-[11px] text-slate-400">{timeAgo(post.created_at)}</p>
                  </div>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${URGENCY_COLORS[post.urgency as keyof typeof URGENCY_COLORS] ?? URGENCY_COLORS.normal}`}>
                  {post.urgency === 'urgent' && <AlertCircle className="mr-1 inline h-3 w-3" />}
                  {post.urgency.charAt(0).toUpperCase() + post.urgency.slice(1)}
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900">{post.title}</h3>
              <p className="mt-1 text-sm text-slate-600 line-clamp-3">{post.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {post.specialism && <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">{post.specialism}</span>}
                {post.location && <span className="flex items-center gap-1 text-[11px] text-slate-400"><MapPin className="h-3 w-3" /> {post.location}</span>}
                {post.responses_count > 0 && <span className="flex items-center gap-1 text-[11px] text-slate-400"><Send className="h-3 w-3" /> {post.responses_count} responses</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
