'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

type Message = {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export function EventChat({ eventId }: { eventId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    // Fetch existing messages
    supabase
      .from('event_messages')
      .select('id, message, created_at, user_id, profiles:user_id(full_name, avatar_url)')
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
        }));
        setMessages(rows);
      });

    // Subscribe to realtime
    const channel = supabase
      .channel(`event-chat-${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'event_messages', filter: `event_id=eq.${eventId}` },
        async (payload) => {
          const msg = payload.new as any;
          const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', msg.user_id).single();
          setMessages((prev) => [
            ...prev,
            {
              id: msg.id,
              message: msg.message,
              created_at: msg.created_at,
              user_id: msg.user_id,
              full_name: profile?.full_name ?? null,
              avatar_url: profile?.avatar_url ?? null,
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!userId || !text.trim()) return;
    setSending(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('event_messages').insert({ event_id: eventId, user_id: userId, message: text.trim() });
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
    <div>
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-bold text-slate-950">Event discussion</h3>
        <p className="text-xs text-slate-400">{messages.length} messages</p>
      </div>

      {/* Messages area */}
      <div className="h-64 overflow-y-auto px-5 py-3 sm:h-80">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">No messages yet. Start the conversation!</p>
        )}
        {messages.map((m) => {
          const isOwn = m.user_id === userId;
          return (
            <div key={m.id} className={`mb-3 flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <UserAvatar src={m.avatar_url} name={m.full_name} size={28} />
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${isOwn ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                <p className={`text-[11px] font-medium ${isOwn ? 'text-blue-100' : 'text-slate-500'}`}>{m.full_name ?? 'Anonymous'}</p>
                <p className="text-sm">{m.message}</p>
                <p className={`mt-0.5 text-[10px] ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>{formatTime(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {userId ? (
        <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="border-t border-slate-100 px-5 py-3 text-center text-sm text-slate-400">
          Sign in to join the discussion
        </div>
      )}
    </div>
  );
}
