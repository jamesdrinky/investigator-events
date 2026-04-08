'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, ArrowLeft, Search } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';

type Conversation = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  specialisation: string | null;
  last_message: string;
  last_time: string;
  unread: number;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export function MessageInbox({ initialUserId }: { initialUserId?: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(initialUserId ?? null);
  const [activePerson, setActivePerson] = useState<{ full_name: string | null; avatar_url: string | null; username: string | null } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; full_name: string | null; avatar_url: string | null; username: string | null }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const supabase = createSupabaseBrowserClient();

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    // Get all messages involving this user, grouped by conversation partner
    const { data: sent } = await supabase.from('messages' as any).select('receiver_id, content, created_at, is_read').eq('sender_id', userId).order('created_at', { ascending: false });
    const { data: received } = await supabase.from('messages' as any).select('sender_id, content, created_at, is_read').eq('receiver_id', userId).order('created_at', { ascending: false });

    const convMap = new Map<string, { last_message: string; last_time: string; unread: number }>();

    for (const m of (sent ?? []) as any[]) {
      const pid = m.receiver_id;
      if (!convMap.has(pid) || m.created_at > convMap.get(pid)!.last_time) {
        convMap.set(pid, { last_message: m.content, last_time: m.created_at, unread: convMap.get(pid)?.unread ?? 0 });
      }
    }
    for (const m of (received ?? []) as any[]) {
      const pid = m.sender_id;
      const existing = convMap.get(pid);
      const unread = (existing?.unread ?? 0) + (m.is_read ? 0 : 1);
      if (!existing || m.created_at > existing.last_time) {
        convMap.set(pid, { last_message: m.content, last_time: m.created_at, unread });
      } else {
        convMap.set(pid, { ...existing, unread });
      }
    }

    if (convMap.size === 0) { setConversations([]); return; }

    // Fetch profiles for all conversation partners
    const ids = Array.from(convMap.keys());
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url, username, specialisation').in('id', ids);

    const convs: Conversation[] = ids.map((pid) => {
      const p = (profiles ?? []).find((pr) => pr.id === pid);
      const c = convMap.get(pid)!;
      return {
        user_id: pid,
        full_name: p?.full_name ?? null,
        avatar_url: p?.avatar_url ?? null,
        username: p?.username ?? null,
        specialisation: p?.specialisation ?? null,
        ...c,
      };
    }).sort((a, b) => b.last_time.localeCompare(a.last_time));

    setConversations(convs);
  }, [userId]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load messages for active chat
  const loadMessages = useCallback(async () => {
    if (!userId || !activeChat) return;
    const { data } = await supabase
      .from('messages' as any)
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${activeChat}),and(sender_id.eq.${activeChat},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages((data ?? []) as unknown as Message[]);

    // Mark received messages as read
    await supabase.from('messages' as any).update({ is_read: true } as any).eq('sender_id', activeChat).eq('receiver_id', userId).eq('is_read', false);
  }, [userId, activeChat]);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 3s
    if (pollRef.current) clearInterval(pollRef.current);
    if (activeChat) {
      pollRef.current = setInterval(loadMessages, 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadMessages, activeChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load active person info
  useEffect(() => {
    if (!activeChat) { setActivePerson(null); return; }
    const cached = conversations.find((c) => c.user_id === activeChat);
    if (cached) {
      setActivePerson({ full_name: cached.full_name, avatar_url: cached.avatar_url, username: cached.username });
    } else {
      supabase.from('profiles').select('full_name, avatar_url, username').eq('id', activeChat).single()
        .then(({ data }) => { if (data) setActivePerson(data); });
    }
  }, [activeChat, conversations]);

  const sendMessage = async () => {
    if (!userId || !activeChat || !newMsg.trim() || sending) return;
    setSending(true);
    const { data } = await supabase.from('messages' as any).insert({ sender_id: userId, receiver_id: activeChat, content: newMsg.trim() } as any).select('*').single();
    if (data) {
      setMessages((prev) => [...prev, data as unknown as Message]);
      setNewMsg('');
      loadConversations();
    }
    setSending(false);
  };

  // Search users to start new conversation
  const searchUsers = async (q: string) => {
    setSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase.from('profiles').select('id, full_name, avatar_url, username').eq('is_public', true).or(`full_name.ilike.%${q}%,username.ilike.%${q}%`).neq('id', userId!).limit(6);
    setSearchResults((data ?? []) as any[]);
  };

  const startChat = (person: { id: string; full_name: string | null; avatar_url: string | null; username: string | null }) => {
    setActiveChat(person.id);
    setActivePerson(person);
    setSearch('');
    setSearchResults([]);
  };

  const timeDisplay = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString('en-GB', { weekday: 'short' });
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  if (!userId) return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-slate-400">Please sign in to use messaging.</p></div>;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-5xl overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
      {/* Left: conversation list */}
      <div className={`w-full flex-shrink-0 border-r border-slate-100 sm:w-80 ${activeChat ? 'hidden sm:block' : ''}`}>
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-bold text-slate-900">Messages</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              placeholder="Search people..."
              value={search}
              onChange={(e) => searchUsers(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg">
                {searchResults.map((p) => (
                  <button key={p.id} type="button" onClick={() => startChat(p)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50">
                    <UserAvatar src={p.avatar_url} name={p.full_name} size={32} />
                    <span className="text-sm font-medium text-slate-900">{p.full_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100% - 7rem)' }}>
          {conversations.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">No conversations yet. Search for someone to message.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user_id}
                type="button"
                onClick={() => setActiveChat(c.user_id)}
                className={`flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left transition ${activeChat === c.user_id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
              >
                <UserAvatar src={c.avatar_url} name={c.full_name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-slate-900">{c.full_name ?? 'User'}</p>
                    <span className="text-[10px] text-slate-400">{timeDisplay(c.last_time)}</span>
                  </div>
                  <p className="truncate text-xs text-slate-400">{c.last_message}</p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{c.unread}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: chat */}
      <div className={`flex flex-1 flex-col ${!activeChat ? 'hidden sm:flex' : 'flex'}`}>
        {activeChat && activePerson ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <button type="button" onClick={() => setActiveChat(null)} className="sm:hidden"><ArrowLeft className="h-5 w-5 text-slate-500" /></button>
              <a href={activePerson.username ? `/profile/${activePerson.username}` : '#'} className="flex items-center gap-3">
                <UserAvatar src={activePerson.avatar_url} name={activePerson.full_name} size={36} />
                <p className="text-sm font-semibold text-slate-900">{activePerson.full_name}</p>
              </a>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m) => {
                const isMine = m.sender_id === userId;
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className={`mt-1 text-[10px] ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>{timeDisplay(m.created_at)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 p-3">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message..."
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={sending || !newMsg.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="text-lg font-bold text-slate-900">Your messages</p>
              <p className="mt-1 text-sm text-slate-400">Select a conversation or search for someone to message.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
