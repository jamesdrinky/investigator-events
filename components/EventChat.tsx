'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, ImagePlus } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

type Message = {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
};

export function EventChat({ eventId }: { eventId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    supabase
      .from('event_messages')
      .select('id, message, created_at, user_id, profiles:user_id(full_name, avatar_url, username)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        const rows = (data ?? []).map((r: any) => ({
          id: r.id,
          message: r.message,
          created_at: r.created_at,
          user_id: r.user_id,
          full_name: r.profiles?.full_name ?? null,
          avatar_url: r.profiles?.avatar_url ?? null,
          username: r.profiles?.username ?? null,
        }));
        setMessages(rows);
      });

    const channel = supabase
      .channel(`event-chat-${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'event_messages', filter: `event_id=eq.${eventId}` },
        async (payload) => {
          const msg = payload.new as any;
          const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url, username').eq('id', msg.user_id).single();
          setMessages((prev) => [
            ...prev,
            {
              id: msg.id,
              message: msg.message,
              created_at: msg.created_at,
              user_id: msg.user_id,
              full_name: profile?.full_name ?? null,
              avatar_url: profile?.avatar_url ?? null,
              username: profile?.username ?? null,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const [sendError, setSendError] = useState(false);

  const handleSend = async () => {
    if (!userId || !text.trim()) return;
    setSending(true);
    setSendError(false);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('event_messages').insert({ event_id: eventId, user_id: userId, message: text.trim() });
    if (error) {
      setSendError(true);
      setSending(false);
      return;
    }
    setText('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-950">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/8 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-purple-500/6 blur-[80px]" />

      {/* Header */}
      <div className="border-b border-white/5 px-5 py-4">
        <h3 className="text-sm font-bold text-white">Event discussion</h3>
        <p className="text-xs text-slate-500">{messages.length} {messages.length === 1 ? 'message' : 'messages'}</p>
      </div>

      {/* Messages area */}
      <div
        ref={containerRef}
        className="h-72 overflow-y-auto px-4 py-3 sm:h-80"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent)',
        }}
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500">No messages yet. Start the conversation!</p>
          </div>
        )}
        <div className="space-y-1">
          {messages.map((m, i) => {
            const isOwn = m.user_id === userId;
            const showAvatar = !isOwn && (i === 0 || messages[i - 1].user_id !== m.user_id);
            const showName = !isOwn && (i === 0 || messages[i - 1].user_id !== m.user_id);
            return (
              <div key={m.id} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {!isOwn && (
                  <div className="w-7 flex-shrink-0">
                    {showAvatar && (
                      <a href={m.username ? `/profile/${m.username}` : '#'}>
                        <UserAvatar src={m.avatar_url} name={m.full_name} size={28} />
                      </a>
                    )}
                  </div>
                )}
                <div className={`max-w-[88%] sm:max-w-[75%] ${isOwn ? '' : ''}`}>
                  {showName && (
                    <p className="mb-0.5 pl-1 text-[10px] font-medium text-slate-500">
                      {m.username ? (
                        <a href={`/profile/${m.username}`} className="hover:text-indigo-400 transition">{m.full_name ?? 'Anonymous'}</a>
                      ) : (
                        m.full_name ?? 'Anonymous'
                      )}
                    </p>
                  )}
                  <div className={`rounded-2xl px-3.5 py-2 text-sm ${
                    isOwn
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      : 'bg-white/[0.06] text-slate-200'
                  }`}>
                    <p className="whitespace-pre-wrap">{m.message}</p>
                  </div>
                  <p className={`mt-0.5 text-[10px] text-slate-600 ${isOwn ? 'text-right pr-1' : 'pl-1'}`}>{formatTime(m.created_at)}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      {userId ? (
        <div className="border-t border-white/5 bg-slate-950/80 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {sendError && <p className="absolute -top-6 left-3 text-[10px] text-red-400">Failed to send. Try again.</p>}
            <input
              type="text"
              value={text}
              onChange={(e) => { setText(e.target.value); setSendError(false); }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500/40 focus:bg-white/8"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white transition hover:from-indigo-400 hover:to-purple-500 disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-white/5 px-5 py-3 text-center">
          <a href="/signin" className="text-sm text-indigo-400 hover:text-indigo-300 transition">Sign in to join the discussion</a>
        </div>
      )}
    </div>
  );
}
