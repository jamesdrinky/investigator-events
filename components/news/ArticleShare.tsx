'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { isNativeApp, nativeShare } from '@/lib/capacitor';

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

/** Share row for articles — LinkedIn first, since that's where the industry talks. */
export function ArticleShare({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/news/${slug}` : `https://www.investigatorevents.com/news/${slug}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function share() {
    if (isNativeApp) {
      await nativeShare({ title, url });
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
      return;
    }
    copy();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-[#0a66c2] px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
      >
        <LinkedinIcon className="h-3.5 w-3.5" /> Share on LinkedIn
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-200/70"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-200/70"
      >
        <Share2 className="h-3.5 w-3.5" /> Share
      </button>
    </div>
  );
}
