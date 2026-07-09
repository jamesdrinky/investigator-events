'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Check, Clock, AlertCircle, Film } from 'lucide-react';
import { DEFAULT_VIDEO_INVITE_BODY, DEFAULT_VIDEO_INVITE_SUBJECT } from '@/lib/email/video-invite';

interface VideoOption {
  id: string;
  title: string;
  kind: string;
  contextLabel: string | null;
  watchPath: string;
}

type SenderKey = 'james' | 'mike' | 'team';

const SENDER_LABELS: Record<SenderKey, string> = {
  james: 'James Drinkwater — Technical Lead',
  mike: 'Mike LaCorte — Founder',
  team: 'The Investigator Events Team',
};

export function VideoInviteComposer() {
  const [videos, setVideos] = useState<VideoOption[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [association, setAssociation] = useState('');
  const [conference, setConference] = useState('');
  const [videoId, setVideoId] = useState('');
  const [sender, setSender] = useState<SenderKey>('james');
  const [subject, setSubject] = useState(DEFAULT_VIDEO_INVITE_SUBJECT);
  const [bodyText, setBodyText] = useState(DEFAULT_VIDEO_INVITE_BODY);

  const [previewHtml, setPreviewHtml] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load approved videos for the picker.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/video-invite/videos');
        if (res.ok) {
          const data = await res.json();
          const list: VideoOption[] = data.videos ?? [];
          setVideos(list);
          if (list.length > 0) setVideoId(list[0].id);
        }
      } catch {}
      setLoadingVideos(false);
    })();
  }, []);

  // Debounced live preview whenever any field changes.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/video-invite/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientName, association, conference, subject, bodyText, videoId, sender }),
        });
        if (res.ok) {
          const data = await res.json();
          setPreviewHtml(data.html ?? '');
        }
      } catch {}
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [recipientName, association, conference, subject, bodyText, videoId, sender]);

  const send = async () => {
    setError(null);
    if (!recipientEmail) {
      setError('Add a recipient email first.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/video-invite/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, recipientName, association, conference, subject, bodyText, videoId, sender }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to send.');
      }
    } catch {
      setError('Network error — try again.');
    }
    setSending(false);
  };

  const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400';
  const labelClass = 'mb-1 block text-xs font-semibold text-slate-500';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Controls */}
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Recipient name</label>
            <input className={inputClass} value={recipientName} onChange={e => { setRecipientName(e.target.value); setSent(false); }} placeholder="Phillip Ryfell" />
          </div>
          <div>
            <label className={labelClass}>Recipient email</label>
            <input type="email" className={inputClass} value={recipientEmail} onChange={e => { setRecipientEmail(e.target.value); setSent(false); }} placeholder="president@association.org" />
          </div>
          <div>
            <label className={labelClass}>Association</label>
            <input className={inputClass} value={association} onChange={e => { setAssociation(e.target.value); setSent(false); }} placeholder="World Association of Detectives" />
          </div>
          <div>
            <label className={labelClass}>Conference</label>
            <input className={inputClass} value={conference} onChange={e => { setConference(e.target.value); setSent(false); }} placeholder="WAD 2026" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Video to feature</label>
            <select className={inputClass} value={videoId} onChange={e => { setVideoId(e.target.value); setSent(false); }} disabled={loadingVideos || videos.length === 0}>
              {loadingVideos && <option>Loading…</option>}
              {!loadingVideos && videos.length === 0 && <option value="">No approved videos</option>}
              {videos.map(v => (
                <option key={v.id} value={v.id}>{v.title}{v.contextLabel ? ` — ${v.contextLabel}` : ''}</option>
              ))}
            </select>
            {!loadingVideos && videos.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-600">Approve a video in the video queue first, then it appears here.</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Send as</label>
            <select className={inputClass} value={sender} onChange={e => { setSender(e.target.value as SenderKey); setSent(false); }}>
              {(Object.keys(SENDER_LABELS) as SenderKey[]).map(key => (
                <option key={key} value={key}>{SENDER_LABELS[key]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Subject</label>
          <input className={inputClass} value={subject} onChange={e => { setSubject(e.target.value); setSent(false); }} />
        </div>

        <div>
          <label className={labelClass}>Body</label>
          <textarea
            className={`${inputClass} font-mono text-xs leading-relaxed`}
            rows={16}
            value={bodyText}
            onChange={e => { setBodyText(e.target.value); setSent(false); }}
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Merge tokens: <code className="rounded bg-slate-100 px-1">{'{name}'}</code> <code className="rounded bg-slate-100 px-1">{'{association}'}</code> <code className="rounded bg-slate-100 px-1">{'{conference}'}</code> · put <code className="rounded bg-slate-100 px-1">{'{video}'}</code> on its own line where the video should appear.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={send}
            disabled={!recipientEmail || sending || sent}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? (<><Clock className="h-4 w-4 animate-spin" /> Sending…</>) : sent ? (<><Check className="h-4 w-4" /> Sent</>) : (<><Send className="h-4 w-4" /> Send email</>)}
          </button>
          {error && (
            <span className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3.5 w-3.5" /> {error}</span>
          )}
          {sent && !error && (
            <span className="text-xs text-emerald-600">Delivered to {recipientEmail}</span>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div>
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Film className="h-3.5 w-3.5" /> Live preview
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {previewHtml ? (
            <iframe title="Email preview" srcDoc={previewHtml} className="h-[640px] w-full bg-white" />
          ) : (
            <div className="flex h-[640px] items-center justify-center text-sm text-slate-400">Preview will appear here…</div>
          )}
        </div>
      </div>
    </div>
  );
}
