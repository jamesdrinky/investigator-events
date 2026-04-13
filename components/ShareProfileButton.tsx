'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check, X, MessageCircle, Send, Users } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';

interface ShareProfileButtonProps {
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  specialisation: string | null;
  accentColor: string;
}

export function ShareProfileButton({ username, fullName, avatarUrl, specialisation, accentColor }: ShareProfileButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${username}`
    : `https://investigatorevents.com/profile/${username}`;

  const name = fullName ?? username;
  const tagline = specialisation ? ` — ${specialisation}` : '';

  // Pre-written shareable messages
  const casualMsg = `${name} is on Investigator Events${tagline}. Worth connecting with if you're in the industry.\n\n${url}`;
  const inviteMsg = `Thought you'd find this useful — ${name} is on Investigator Events, the global network for private investigators.${tagline}\n\nYou can view their full profile and connect here:\n${url}`;

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

  const copyMessage = async (msg: string) => {
    try { await navigator.clipboard.writeText(msg); } catch { /* fallback */ }
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const togglePanel = () => setOpen((prev) => !prev);

  const channels = [
    {
      name: 'WhatsApp',
      color: '#25D366',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(`${name} is on Investigator Events${tagline} — worth a look\n\n${url}`)}`,
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
      name: 'iMessage / SMS',
      color: '#34C759',
      icon: <MessageCircle className="h-5 w-5" />,
      href: `sms:?&body=${encodeURIComponent(`${name} is on Investigator Events${tagline} — worth connecting with\n\n${url}`)}`,
    },
    {
      name: 'Telegram',
      color: '#26A5E4',
      icon: <Send className="h-5 w-5" />,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${name} is on Investigator Events${tagline} — worth connecting with`)}`,
    },
    {
      name: 'X / Twitter',
      color: '#000000',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${name} is on Investigator Events — the global network for private investigators`)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Email',
      color: '#6366f1',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      ),
      href: `mailto:?subject=${encodeURIComponent(`${name} on Investigator Events`)}&body=${encodeURIComponent(inviteMsg)}`,
    },
  ];

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={togglePanel}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-600 hover:shadow-md"
        title="Share profile"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Profile preview card — shows what the recipient will see */}
          <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accentColor}12, ${accentColor}06)` }}>
            <div className="relative flex items-center gap-3.5 px-5 py-4">
              <UserAvatar src={avatarUrl} name={fullName} size={48} color={accentColor} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{name}</p>
                {specialisation && <p className="truncate text-[11px] text-slate-500">{specialisation}</p>}
                <p className="mt-0.5 text-[10px] text-slate-400">investigatorevents.com</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-300 hover:text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick share channels */}
          <div className="border-t border-slate-100 px-3 py-2">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Share via</p>
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
                  <span className="text-[10px] font-medium text-slate-500">{ch.name.split(' ')[0]}</span>
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
                  <span className="text-[10px] font-medium text-slate-500">{ch.name.split(' ')[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Copy pre-written message */}
          <div className="border-t border-slate-100 px-3 py-2">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Copy & paste</p>
            <button
              onClick={() => copyMessage(inviteMsg)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-700">{copiedMsg ? 'Copied to clipboard!' : 'Copy invite message'}</p>
                <p className="truncate text-[11px] text-slate-400">Ready to paste anywhere</p>
              </div>
              {copiedMsg ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-300" />}
            </button>
          </div>

          {/* Copy link */}
          <div className="border-t border-slate-100 px-3 py-2 pb-3">
            <button
              onClick={copyLink}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </div>
              <span className="text-xs font-medium text-slate-600">{copied ? 'Link copied!' : 'Copy profile link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
