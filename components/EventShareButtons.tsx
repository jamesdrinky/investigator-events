'use client';

import { useState, useEffect, useRef } from 'react';
import { Share2, Copy, Check, Send, Users, MessageCircle, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';
import { isNativeApp, nativeShare } from '@/lib/capacitor';

export function EventShareButtons({ eventTitle, eventSlug }: { eventTitle: string; eventSlug: string }) {
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Array<{ id: string; full_name: string | null; avatar_url: string | null; username: string | null }>>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/events/${eventSlug}`
    : `https://investigatorevents.com/events/${eventSlug}`;

  const casualMsg = `${eventTitle} — thought this would be on your radar. Details and attendees here:\n\n${url}`;
  const inviteMsg = `${eventTitle} is coming up and I thought you'd want to know about it. You can see the full details, who's going, and join the discussion on Investigator Events.\n\n${url}`;

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyMessage = async () => {
    try { await navigator.clipboard.writeText(inviteMsg); } catch { /* fallback */ }
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const togglePanel = () => {
    // On native app, use the OS share sheet instead of custom dropdown
    if (isNativeApp) {
      nativeShare({ title: eventTitle, text: `${eventTitle} — details on Investigator Events`, url });
      return;
    }
    setOpen((prev) => !prev);
  };

  const searchUsers = async (q: string) => {
    setSearch(q);
    if (q.length < 2 || !userId) { setResults([]); return; }
    const supabase = createSupabaseBrowserClient();
    const safeQ = q.replace(/[,%().*\\]/g, '');
    if (!safeQ) { setResults([]); return; }
    const { data } = await supabase.from('profiles').select('id, full_name, avatar_url, username').eq('is_public', true).or(`full_name.ilike.%${safeQ}%,username.ilike.%${safeQ}%`).neq('id', userId).limit(8);
    setResults((data ?? []) as any[]);
  };

  const sendToUser = async (targetId: string) => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from('messages' as any).insert({
      sender_id: userId,
      receiver_id: targetId,
      content: `Check out ${eventTitle}\n${url}`,
    } as any);
    setSent((prev) => new Set(prev).add(targetId));
  };

  const channels = [
    {
      name: 'WhatsApp',
      color: '#25D366',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(casualMsg)}`,
    },
    {
      name: 'LinkedIn',
      color: '#0A66C2',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'iMessage',
      color: '#34C759',
      icon: <MessageCircle className="h-5 w-5" />,
      href: `sms:?&body=${encodeURIComponent(casualMsg)}`,
    },
    {
      name: 'Telegram',
      color: '#26A5E4',
      icon: <Send className="h-5 w-5" />,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${eventTitle} — details and attendees on Investigator Events`)}`,
    },
    {
      name: 'X',
      color: '#000000',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${eventTitle} — details and attendees on Investigator Events`)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Email',
      color: '#6366f1',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      ),
      href: `mailto:?subject=${encodeURIComponent(eventTitle)}&body=${encodeURIComponent(inviteMsg)}`,
    },
  ];

  return (
    <>
      <div className="relative" ref={panelRef}>
        <button
          type="button"
          onClick={togglePanel}
          className="btn-secondary flex items-center gap-2 px-5 py-2.5"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

        {open && (
          <div className="absolute left-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Quick share grid */}
            <div className="p-3">
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Share via</p>
              <div className="grid grid-cols-3 gap-1">
                {channels.slice(0, 3).map((ch) => (
                  <a
                    key={ch.name}
                    href={ch.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: ch.color }}>
                      {ch.icon}
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">{ch.name}</span>
                  </a>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {channels.slice(3).map((ch) => (
                  <a
                    key={ch.name}
                    href={ch.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: ch.color }}>
                      {ch.icon}
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">{ch.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Send to someone on the platform */}
            {userId && (
              <div className="border-t border-slate-100 px-3 py-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setShowSendModal(true); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                    <Send className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-700">Send to a connection</p>
                    <p className="text-[11px] text-slate-400">Message someone on the platform</p>
                  </div>
                </button>
              </div>
            )}

            {/* Copy invite message */}
            <div className="border-t border-slate-100 px-3 py-2">
              <button
                onClick={copyMessage}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-semibold text-slate-700">{copiedMsg ? 'Copied!' : 'Copy invite message'}</p>
                  <p className="truncate text-[11px] text-slate-400">Ready to paste in any chat</p>
                </div>
                {copiedMsg ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-300" />}
              </button>
            </div>

            {/* Copy link */}
            <div className="border-t border-slate-100 px-3 py-2 pb-3">
              <button
                onClick={() => { copyLink(); setOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </div>
                <span className="text-xs font-medium text-slate-600">{copied ? 'Link copied!' : 'Copy event link'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send in message modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSendModal(false)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Send event</h3>
                <p className="text-xs text-slate-400">Share &ldquo;{eventTitle}&rdquo; with someone</p>
              </div>
              <button onClick={() => setShowSendModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 pt-3">
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                placeholder="Search people..."
                value={search}
                onChange={(e) => searchUsers(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto px-2 pb-2">
              {results.length === 0 && search.length >= 2 && (
                <p className="p-4 text-center text-sm text-slate-400">No results</p>
              )}
              {results.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                  <UserAvatar src={p.avatar_url} name={p.full_name} size={36} />
                  <span className="flex-1 text-sm font-medium text-slate-900">{p.full_name}</span>
                  {sent.has(p.id) ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600"><Check className="h-3 w-3" /> Sent</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => sendToUser(p.id)}
                      className="rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-600"
                    >
                      Send
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 p-3">
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                className="w-full rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
