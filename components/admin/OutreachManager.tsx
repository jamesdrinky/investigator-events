'use client';

import { useEffect, useState } from 'react';
import { Mail, Send, Eye, Check, Clock, AlertCircle, ChevronDown, ChevronUp, Edit3, X } from 'lucide-react';

interface AssociationOutreach {
  name: string;
  slug: string;
  country: string | null;
  eventCount: number;
  memberCount: number;
  hasBeenEmailed: boolean;
  lastEmailDate: string | null;
  emailStatus: string | null;
  suggestedTemplate: 'approval' | 'introduction' | 'cold';
  eventNames: string[];
  contactEmail: string | null;
}

export function OutreachManager() {
  const [associations, setAssociations] = useState<AssociationOutreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewAssoc, setPreviewAssoc] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [editingEmail, setEditingEmail] = useState<Record<string, string>>({});
  const [editingName, setEditingName] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'not-emailed' | 'emailed'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/outreach');
      if (res.ok) {
        const data = await res.json();
        setAssociations(data.associations ?? []);
      }
    } catch {}
    setLoading(false);
  };

  const previewEmail = async (assoc: AssociationOutreach) => {
    setPreviewAssoc(assoc.slug);
    const contactName = editingName[assoc.slug] ?? assoc.name;
    const params = new URLSearchParams({
      template: assoc.suggestedTemplate === 'cold' ? 'cold' : 'introduction',
      contactName,
      association: assoc.name,
      events: assoc.eventNames.join('|||'),
    });
    const res = await fetch(`/api/admin/outreach/preview?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPreviewHtml(data.html);
    }
  };

  const sendEmail = async (assoc: AssociationOutreach) => {
    const email = editingEmail[assoc.slug] ?? assoc.contactEmail;
    if (!email) return;
    setSending(assoc.slug);
    try {
      const res = await fetch('/api/admin/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: email,
          contactName: editingName[assoc.slug] ?? assoc.name,
          association: assoc.name,
          template: assoc.suggestedTemplate,
          eventNames: assoc.eventNames,
        }),
      });
      if (res.ok) {
        setSent(prev => new Set(prev).add(assoc.slug));
      }
    } catch {}
    setSending(null);
  };

  const filtered = associations.filter(a => {
    if (filter === 'not-emailed') return !a.hasBeenEmailed;
    if (filter === 'emailed') return a.hasBeenEmailed;
    return true;
  });

  const notEmailedCount = associations.filter(a => !a.hasBeenEmailed).length;
  const emailedCount = associations.filter(a => a.hasBeenEmailed).length;

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />)}
      </div>
    );
  }

  return (
    <div>
      {/* Stats + filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            All ({associations.length})
          </button>
          <button
            onClick={() => setFilter('not-emailed')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${filter === 'not-emailed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Not emailed ({notEmailedCount})
          </button>
          <button
            onClick={() => setFilter('emailed')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${filter === 'emailed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Emailed ({emailedCount})
          </button>
        </div>
      </div>

      {/* Association list */}
      <div className="space-y-2">
        {filtered.map(assoc => {
          const isExpanded = expandedSlug === assoc.slug;
          const isSent = sent.has(assoc.slug);
          const email = editingEmail[assoc.slug] ?? assoc.contactEmail ?? '';
          const contactName = editingName[assoc.slug] ?? '';

          return (
            <div key={assoc.slug} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {/* Row */}
              <button
                type="button"
                onClick={() => setExpandedSlug(isExpanded ? null : assoc.slug)}
                className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{assoc.name}</p>
                    {assoc.hasBeenEmailed ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                        <Check className="h-3 w-3" /> Sent
                      </span>
                    ) : isSent ? (
                      <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                        <Check className="h-3 w-3" /> Just sent
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                        <Clock className="h-3 w-3" /> Not emailed
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                    {assoc.country && <span>{assoc.country}</span>}
                    <span>{assoc.eventCount} events</span>
                    <span>{assoc.memberCount} members</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                      {assoc.suggestedTemplate === 'cold' ? 'Cold intro' : assoc.suggestedTemplate === 'introduction' ? 'Introduction' : 'Approval'}
                    </span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                  {/* Contact name */}
                  <div className="mb-3">
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Contact name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setEditingName(prev => ({ ...prev, [assoc.slug]: e.target.value }))}
                      placeholder={assoc.name}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                  </div>

                  {/* Email address */}
                  <div className="mb-3">
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Recipient email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEditingEmail(prev => ({ ...prev, [assoc.slug]: e.target.value }))}
                      placeholder="contact@association.org"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                  </div>

                  {/* Events listed */}
                  {assoc.eventNames.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-1 text-xs font-semibold text-slate-500">Events on platform</p>
                      <div className="space-y-1">
                        {assoc.eventNames.map(name => (
                          <p key={name} className="text-xs text-slate-600">• {name}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last email info */}
                  {assoc.hasBeenEmailed && assoc.lastEmailDate && (
                    <p className="mb-3 text-xs text-slate-400">
                      Last emailed: {new Date(assoc.lastEmailDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {assoc.emailStatus && ` · Status: ${assoc.emailStatus}`}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => previewEmail(assoc)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => sendEmail(assoc)}
                      disabled={!email || sending === assoc.slug || isSent}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {sending === assoc.slug ? (
                        <><Clock className="h-3.5 w-3.5 animate-spin" /> Sending...</>
                      ) : isSent ? (
                        <><Check className="h-3.5 w-3.5" /> Sent</>
                      ) : (
                        <><Send className="h-3.5 w-3.5" /> Send email</>
                      )}
                    </button>
                    {!email && (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="h-3.5 w-3.5" /> No email address
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Email preview modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setPreviewHtml(null); setPreviewAssoc(null); }}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
              <p className="text-sm font-bold text-slate-900">Email Preview</p>
              <button onClick={() => { setPreviewHtml(null); setPreviewAssoc(null); }} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}
    </div>
  );
}
