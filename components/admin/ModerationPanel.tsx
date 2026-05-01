'use client';

import { useEffect, useState } from 'react';
import { Trash2, MessageCircle, Star, Flag, FileText, RefreshCw, AlertTriangle } from 'lucide-react';

type ContentItem = {
  id: string;
  type: 'review' | 'comment' | 'post' | 'report';
  content: string;
  author: string;
  context: string;
  created_at: string;
};

export function ModerationPanel() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'review' | 'comment' | 'post' | 'report'>('all');

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/moderation');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      }
    } catch {
      // Network error — items stay empty
    }
    setLoading(false);
  };

  useEffect(() => { loadContent(); }, []);

  const deleteItem = async (id: string, type: string) => {
    if (!confirm('Delete this content permanently?')) return;
    setDeleting(id);
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  };

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);

  const icon = (type: string) => {
    switch (type) {
      case 'review': return <Star className="h-3.5 w-3.5 text-amber-500" />;
      case 'comment': return <MessageCircle className="h-3.5 w-3.5 text-blue-500" />;
      case 'post': return <FileText className="h-3.5 w-3.5 text-violet-500" />;
      case 'report': return <Flag className="h-3.5 w-3.5 text-red-500" />;
      default: return null;
    }
  };

  const counts = {
    all: items.length,
    review: items.filter((i) => i.type === 'review').length,
    comment: items.filter((i) => i.type === 'comment').length,
    post: items.filter((i) => i.type === 'post').length,
    report: items.filter((i) => i.type === 'report').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Content Moderation
          </h2>
          <p className="text-sm text-slate-500">Review and delete user-generated content across the platform.</p>
        </div>
        <button onClick={loadContent} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {(['all', 'report', 'review', 'comment', 'post'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}s{' '}
            {counts[f] > 0 && <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold">{counts[f]}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-400">Loading content...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-400">
          No {filter === 'all' ? 'content' : `${filter}s`} to moderate.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
              item.type === 'report' ? 'border-red-200/60 bg-red-50/20' : 'border-slate-100 bg-white'
            }`}>
              <div className="mt-0.5 flex-shrink-0">{icon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    item.type === 'report' ? 'bg-red-100 text-red-700'
                    : item.type === 'review' ? 'bg-amber-100 text-amber-700'
                    : item.type === 'comment' ? 'bg-blue-100 text-blue-700'
                    : 'bg-violet-100 text-violet-700'
                  }`}>{item.type}</span>
                  <span className="font-medium text-slate-700">{item.author}</span>
                  <span className="text-slate-300">{new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.content}</p>
                {item.context && <p className="mt-0.5 text-[11px] text-slate-400">{item.context}</p>}
              </div>
              <button
                onClick={() => deleteItem(item.id, item.type)}
                disabled={deleting === item.id}
                className="flex-shrink-0 rounded-lg border border-red-200 p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
