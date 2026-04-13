'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
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
  const panelRef = useRef<HTMLDivElement>(null);

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${username}`
    : `https://investigatorevents.com/profile/${username}`;

  const shareText = `${fullName ?? username} on Investigator Events`;

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

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url });
        return;
      } catch { /* user cancelled */ }
    }
    setOpen(true);
  };

  const channels = [
    {
      name: 'LinkedIn',
      color: '#0A66C2',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'WhatsApp',
      color: '#25D366',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`,
    },
    {
      name: 'X / Twitter',
      color: '#000000',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Email',
      color: '#6366f1',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      ),
      href: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`Check out this investigator's profile:\n${url}`)}`,
    },
  ];

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={shareNative}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-600 hover:shadow-md"
        title="Share profile"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Profile preview card */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5" style={{ background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}03)` }}>
            <UserAvatar src={avatarUrl} name={fullName} size={40} color={accentColor} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{fullName ?? username}</p>
              {specialisation && <p className="truncate text-[11px] text-slate-400">{specialisation}</p>}
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-300 hover:text-slate-500">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Share channels */}
          <div className="p-2">
            {channels.map((ch) => (
              <a
                key={ch.name}
                href={ch.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                  style={{ background: ch.color }}
                >
                  {ch.icon}
                </div>
                <span className="text-sm font-medium text-slate-700">{ch.name}</span>
              </a>
            ))}
          </div>

          {/* Copy link */}
          <div className="border-t border-slate-100 p-2">
            <button
              onClick={copyLink}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </div>
              <span className="text-sm font-medium text-slate-700">{copied ? 'Copied!' : 'Copy link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
