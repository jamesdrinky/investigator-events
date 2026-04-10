'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import {
  Search, MapPin, Clock, AlertCircle, Plus, Send, ChevronDown, ChevronUp,
  Globe, Shield, DollarSign, X, Filter, Briefcase, MessageSquare, User, CheckCircle2,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

/* ── Types ── */

type ReferralPost = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  specialism: string | null;
  location: string | null;
  country: string | null;
  budget_range: string | null;
  urgency: string;
  status: string;
  responses_count: number;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  specialisation: string | null;
};

type ReferralResponse = {
  id: string;
  lfg_id: string;
  user_id: string;
  message: string;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  specialisation: string | null;
  country: string | null;
};

type MatchingInvestigator = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  country: string | null;
  specialisation: string | null;
  headline: string | null;
};

/* ── Constants ── */

const SPECIALISMS = [
  'Surveillance', 'Due Diligence', 'Asset Tracing', 'Background Checks', 'Insurance Investigation',
  'Fraud Investigation', 'Corporate Investigation', 'Digital Forensics', 'OSINT', 'Missing Persons',
  'Process Serving', 'Skip Tracing', 'Litigation Support', 'Counter Surveillance', 'Cyber Investigation',
];

const COUNTRIES = [
  'United Kingdom', 'United States', 'Germany', 'Italy', 'France', 'Spain', 'India', 'Australia',
  'Canada', 'Netherlands', 'Ireland', 'South Africa', 'United Arab Emirates', 'Czech Republic',
  'Costa Rica', 'Switzerland', 'Belgium', 'Sweden', 'Norway', 'Denmark', 'Other',
];

const BUDGET_RANGES = [
  'Under £500', '£500 – £1,000', '£1,000 – £2,500', '£2,500 – £5,000', '£5,000 – £10,000', '£10,000+', 'To be discussed',
];

const URGENCY_CONFIG = {
  urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', icon: AlertCircle },
  normal: { label: 'Standard', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: Clock },
  flexible: { label: 'Flexible', color: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400', icon: Clock },
} as const;

/* ── Helpers ── */

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/* ── Referral Card ── */

function ReferralCard({
  post, userId, onRespond, onToggleResponses, expanded, responses, loadingResponses,
}: {
  post: ReferralPost; userId: string | null; onRespond: (id: string) => void;
  onToggleResponses: (id: string) => void; expanded: boolean;
  responses: ReferralResponse[]; loadingResponses: boolean;
}) {
  const urg = URGENCY_CONFIG[post.urgency as keyof typeof URGENCY_CONFIG] ?? URGENCY_CONFIG.normal;
  const isOwner = userId === post.user_id;

  return (
    <div className="group rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <Link href={post.username ? `/profile/${post.username}` : '#'} className="flex items-center gap-3">
            <UserAvatar src={post.avatar_url} name={post.full_name} size={40} />
            <div>
              <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{post.full_name ?? 'Anonymous'}</p>
              <p className="text-[11px] text-slate-400">{post.specialisation ? `${post.specialisation} · ` : ''}{timeAgo(post.created_at)}</p>
            </div>
          </Link>
          <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${urg.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${urg.dot}`} />
            {urg.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-3 pb-4">
        <h3 className="text-[1.05rem] font-bold leading-snug text-slate-950">{post.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">{post.description}</p>

        {/* Tags row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {post.specialism && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              <Briefcase className="h-3 w-3" /> {post.specialism}
            </span>
          )}
          {(post.location || post.country) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <MapPin className="h-3 w-3" /> {post.location ?? post.country}
            </span>
          )}
          {post.budget_range && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              <DollarSign className="h-3 w-3" /> {post.budget_range}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <button
          type="button"
          onClick={() => onToggleResponses(post.id)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition hover:text-slate-900"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {post.responses_count} {post.responses_count === 1 ? 'response' : 'responses'}
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {userId && !isOwner && (
          <button
            type="button"
            onClick={() => onRespond(post.id)}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-blue-600"
          >
            <Send className="h-3 w-3" /> Respond
          </button>
        )}
        {isOwner && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Your post
          </span>
        )}
      </div>

      {/* Expanded responses */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
          {loadingResponses ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}
            </div>
          ) : responses.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-3">No responses yet. Be the first to offer your services.</p>
          ) : (
            <div className="space-y-3">
              {responses.map((r) => (
                <div key={r.id} className="flex gap-3 rounded-xl border border-slate-200/60 bg-white p-4">
                  <UserAvatar src={r.avatar_url} name={r.full_name} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={r.username ? `/profile/${r.username}` : '#'} className="text-sm font-semibold text-slate-900 hover:text-blue-600">{r.full_name ?? 'Anonymous'}</Link>
                      {r.country && <span className="text-[10px] text-slate-400">{r.country}</span>}
                      <span className="ml-auto text-[10px] text-slate-400">{timeAgo(r.created_at)}</span>
                    </div>
                    {r.specialisation && <p className="text-[11px] text-blue-600 font-medium">{r.specialisation}</p>}
                    <p className="mt-1 text-sm text-slate-600">{r.message}</p>
                    {userId === post.user_id && r.user_id !== userId && (
                      <Link
                        href={`/messages?to=${r.user_id}`}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <Send className="h-3 w-3" /> Message privately
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Response Modal ── */

function ResponseModal({ postTitle, onClose, onSubmit, submitting }: {
  postTitle: string; onClose: () => void; onSubmit: (msg: string) => void; submitting: boolean;
}) {
  const [message, setMessage] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Respond to referral</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500 line-clamp-1">{postTitle}</p>

        <textarea
          className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Introduce yourself, your relevant experience, and how you can help. Include your location and availability."
        />

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
          <button
            type="button"
            onClick={() => onSubmit(message)}
            disabled={submitting || !message.trim()}
            className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send response'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Create Referral Form ── */

function CreateReferralForm({ onClose, onCreated, userId }: {
  onClose: () => void; onCreated: (post: ReferralPost) => void; userId: string;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specialism, setSpecialism] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    setCreating(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('lfg_posts' as any)
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        specialism: specialism || null,
        location: location || null,
        country: country || null,
        budget_range: budgetRange || null,
        urgency,
      } as any)
      .select('*, profiles:user_id(full_name, avatar_url, username, specialisation)')
      .single();

    if (data) {
      const d = data as any;
      onCreated({
        ...d,
        full_name: d.profiles?.full_name,
        avatar_url: d.profiles?.avatar_url,
        username: d.profiles?.username,
        specialisation: d.profiles?.specialisation,
      });
    }
    setCreating(false);
  };

  return (
    <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-b from-blue-50/50 to-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Post a referral request</h3>
          <p className="text-xs text-slate-500">Describe what you need and verified investigators can respond</p>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-900"><X className="h-5 w-5" /></button>
      </div>

      <div className="mt-5 space-y-3">
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What are you looking for? e.g. Surveillance operative in Dubai for 3 days"
        />
        <textarea
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the work, timeline, requirements, and any relevant context. The more detail, the better responses you'll get."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400" value={specialism} onChange={(e) => setSpecialism(e.target.value)}>
            <option value="">Specialism needed</option>
            {SPECIALISMS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">Country needed</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or region (optional)"
          />
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}>
            <option value="">Budget range</option>
            {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Urgency selector */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Urgency</p>
          <div className="flex gap-2">
            {(['urgent', 'normal', 'flexible'] as const).map((u) => {
              const cfg = URGENCY_CONFIG[u];
              const active = urgency === u;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgency(u)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${active ? cfg.color + ' ring-2 ring-offset-1 ring-blue-200' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? cfg.dot : 'bg-slate-300'}`} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={creating || !title.trim() || !description.trim()}
            className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {creating ? 'Publishing...' : 'Publish referral'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Board ── */

export function CaseReferralBoard() {
  const [posts, setPosts] = useState<ReferralPost[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Filters
  const [filterSpecialism, setFilterSpecialism] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Responses
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, ReferralResponse[]>>({});
  const [loadingResponses, setLoadingResponses] = useState<Record<string, boolean>>({});
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Matching investigators sidebar
  const [matchingPIs, setMatchingPIs] = useState<MatchingInvestigator[]>([]);

  // Fetch posts
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    supabase
      .from('lfg_posts' as any)
      .select('*, profiles:user_id(full_name, avatar_url, username, specialisation)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setPosts((data ?? []).map((r: any) => ({
          ...r,
          full_name: r.profiles?.full_name,
          avatar_url: r.profiles?.avatar_url,
          username: r.profiles?.username,
          specialisation: r.profiles?.specialisation,
        })));
        setLoading(false);
      });

    // Fetch available investigators
    (supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username, country, specialisation, headline') as any)
      .eq('available_for_referrals', true)
      .eq('is_public', true)
      .limit(12)
      .then(({ data }: any) => {
        setMatchingPIs((data ?? []) as MatchingInvestigator[]);
      });
  }, []);

  // Fetch responses for a post
  const fetchResponses = useCallback(async (postId: string) => {
    setLoadingResponses((prev) => ({ ...prev, [postId]: true }));
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from('lfg_responses' as any)
      .select('*, profiles:user_id(full_name, avatar_url, username, specialisation, country)')
      .eq('lfg_id', postId)
      .order('created_at', { ascending: true })
      .limit(20);

    setResponses((prev) => ({
      ...prev,
      [postId]: (data ?? []).map((r: any) => ({
        ...r,
        full_name: r.profiles?.full_name,
        avatar_url: r.profiles?.avatar_url,
        username: r.profiles?.username,
        specialisation: r.profiles?.specialisation,
        country: r.profiles?.country,
      })),
    }));
    setLoadingResponses((prev) => ({ ...prev, [postId]: false }));
  }, []);

  const handleToggleResponses = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!responses[postId]) fetchResponses(postId);
    }
  };

  const handleSubmitResponse = async (message: string) => {
    if (!userId || !respondingTo || !message.trim()) return;
    setSubmittingResponse(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('lfg_responses' as any).insert({ lfg_id: respondingTo, user_id: userId, message: message.trim() } as any);

    // Increment response count
    const post = posts.find((p) => p.id === respondingTo);
    if (post) {
      await supabase.from('lfg_posts' as any).update({ responses_count: post.responses_count + 1 } as any).eq('id', respondingTo);
      setPosts((prev) => prev.map((p) => p.id === respondingTo ? { ...p, responses_count: p.responses_count + 1 } : p));
    }

    // Refresh responses if expanded
    if (expandedPost === respondingTo) fetchResponses(respondingTo);

    setRespondingTo(null);
    setSubmittingResponse(false);
  };

  // Filter posts
  const filtered = posts.filter((p) => {
    if (filterSpecialism && p.specialism !== filterSpecialism) return false;
    if (filterCountry && p.country !== filterCountry) return false;
    if (filterUrgency && p.urgency !== filterUrgency) return false;
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      if (![p.title, p.description, p.location ?? '', p.country ?? '', p.specialism ?? ''].join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const hasFilters = !!(filterSpecialism || filterCountry || filterUrgency || filterSearch);
  const respondingPost = respondingTo ? posts.find((p) => p.id === respondingTo) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* Main column */}
      <div>
        {/* Hero header */}
        <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                <Globe className="h-3 w-3" /> Case Referral Network
              </div>
              <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">Find the right investigator, anywhere in the world</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">
                Need boots on the ground in another city or country? Post a referral and let verified investigators come to you.
              </p>
            </div>
            {userId && (
              <button
                type="button"
                onClick={() => setShowCreate(!showCreate)}
                className="hidden shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-blue-50 sm:flex"
              >
                <Plus className="h-4 w-4" /> Post referral
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="mt-5 flex flex-wrap gap-6">
            <div>
              <p className="text-2xl font-bold">{posts.length}</p>
              <p className="text-[11px] text-white/40">Open referrals</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{matchingPIs.length}</p>
              <p className="text-[11px] text-white/40">Available PIs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{new Set(posts.map((p) => p.country).filter(Boolean)).size}</p>
              <p className="text-[11px] text-white/40">Countries</p>
            </div>
          </div>

          {/* Mobile CTA */}
          {userId && (
            <button
              type="button"
              onClick={() => setShowCreate(!showCreate)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-blue-50 sm:hidden"
            >
              <Plus className="h-4 w-4" /> Post a referral request
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreate && userId && (
          <div className="mt-4">
            <CreateReferralForm
              userId={userId}
              onClose={() => setShowCreate(false)}
              onCreated={(post) => { setPosts((prev) => [post, ...prev]); setShowCreate(false); }}
            />
          </div>
        )}

        {/* Search + Filters */}
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Search referrals..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${hasFilters ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter className="h-4 w-4" /> Filters {hasFilters && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">!</span>}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs" value={filterSpecialism} onChange={(e) => setFilterSpecialism(e.target.value)}>
                <option value="">All specialisms</option>
                {SPECIALISMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
                <option value="">All countries</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs" value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)}>
                <option value="">All urgency</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Standard</option>
                <option value="flexible">Flexible</option>
              </select>
              {hasFilters && (
                <button type="button" onClick={() => { setFilterSpecialism(''); setFilterCountry(''); setFilterUrgency(''); setFilterSearch(''); }} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              {hasFilters ? 'No referrals match your filters.' : 'No open referrals yet.'}
            </p>
            {userId && !hasFilters && (
              <button type="button" onClick={() => setShowCreate(true)} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700">
                Be the first to post a referral →
              </button>
            )}
            {hasFilters && (
              <button type="button" onClick={() => { setFilterSpecialism(''); setFilterCountry(''); setFilterUrgency(''); setFilterSearch(''); }} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {filtered.map((post) => (
              <ReferralCard
                key={post.id}
                post={post}
                userId={userId}
                onRespond={setRespondingTo}
                onToggleResponses={handleToggleResponses}
                expanded={expandedPost === post.id}
                responses={responses[post.id] ?? []}
                loadingResponses={loadingResponses[post.id] ?? false}
              />
            ))}
          </div>
        )}

        {/* Not logged in CTA */}
        {!userId && !loading && (
          <div className="mt-6 rounded-2xl border border-blue-200/60 bg-blue-50/30 p-6 text-center">
            <Shield className="mx-auto h-8 w-8 text-blue-400" />
            <p className="mt-2 text-sm font-medium text-slate-700">Sign in to post referrals and respond to requests</p>
            <Link href="/signin" className="mt-3 inline-flex rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600">
              Sign in
            </Link>
          </div>
        )}
      </div>

      {/* Sidebar — Available Investigators */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <Shield className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Available investigators</h3>
                <p className="text-[10px] text-slate-400">Open for referral work</p>
              </div>
            </div>

            {matchingPIs.length === 0 ? (
              <p className="mt-4 text-center text-xs text-slate-400 py-3">No investigators have set themselves as available yet.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {matchingPIs.slice(0, 8).map((pi) => (
                  <Link
                    key={pi.id}
                    href={pi.username ? `/profile/${pi.username}` : '#'}
                    className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50"
                  >
                    <UserAvatar src={pi.avatar_url} name={pi.full_name} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{pi.full_name}</p>
                      <p className="truncate text-[10px] text-slate-400">{pi.specialisation ?? pi.country ?? 'Investigator'}</p>
                    </div>
                    {pi.country && <span className="text-[10px] text-slate-300">{pi.country}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">How it works</h3>
            <div className="mt-3 space-y-3">
              {[
                { step: '1', text: 'Post a referral with the specialism and location you need' },
                { step: '2', text: 'Qualified investigators respond with their credentials' },
                { step: '3', text: 'Review responses and message privately to discuss' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{item.step}</span>
                  <p className="text-xs leading-relaxed text-slate-500">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Set yourself available */}
          {userId && (
            <Link
              href="/profile/edit"
              className="flex items-center gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/30 p-4 transition hover:border-emerald-300 hover:shadow-sm"
            >
              <User className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Available for referrals?</p>
                <p className="text-[11px] text-slate-500">Toggle this in your profile settings</p>
              </div>
            </Link>
          )}
        </div>
      </aside>

      {/* Response modal */}
      {respondingTo && respondingPost && (
        <ResponseModal
          postTitle={respondingPost.title}
          onClose={() => setRespondingTo(null)}
          onSubmit={handleSubmitResponse}
          submitting={submittingResponse}
        />
      )}
    </div>
  );
}
