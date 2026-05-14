'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, ArrowLeft, Search, ImagePlus, Calendar } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { UserAvatar } from '@/components/UserAvatar';
import { isNativeApp } from '@/lib/capacitor';

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
  image_url: string | null;
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const [eventResults, setEventResults] = useState<Array<{ id: string; title: string; slug: string; city: string; country: string; image_path: string | null }>>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Track iOS keyboard height via visualViewport so .messages-page-shell can
  // shrink to the visible viewport when the keyboard opens — otherwise on
  // iOS PWA the input bar (and what you're typing) sits below the keyboard
  // fold. Also snap the message list to the bottom each time the viewport
  // resizes so the latest message stays in view.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--keyboard-height', `${offset}px`);
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ block: 'end' });
      });
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      document.documentElement.style.removeProperty('--keyboard-height');
    };
  }, []);

  const loadConversations = useCallback(async () => {
    if (!userId) return;
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

  const loadMessages = useCallback(async () => {
    if (!userId || !activeChat) return;
    const { data } = await supabase
      .from('messages' as any)
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${activeChat}),and(sender_id.eq.${activeChat},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .limit(100);
    const newMessages = (data ?? []) as unknown as Message[];
    setMessages((prev) => {
      // Only update if messages actually changed to avoid unnecessary scroll triggers
      if (prev.length === newMessages.length && prev.every((m, i) => m.id === newMessages[i]?.id)) return prev;
      return newMessages;
    });

    await supabase.from('messages' as any).update({ is_read: true } as any).eq('sender_id', activeChat).eq('receiver_id', userId).eq('is_read', false);
  }, [userId, activeChat]);

  useEffect(() => {
    loadMessages();
    if (pollRef.current) clearInterval(pollRef.current);
    if (activeChat) {
      pollRef.current = setInterval(loadMessages, 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadMessages, activeChat]);

  // Scroll: only on initial load. After that, user controls scroll.
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || messages.length === 0) return;

    if (!hasScrolledRef.current) {
      container.scrollTop = container.scrollHeight;
      hasScrolledRef.current = true;
    }
  }, [messages]);

  // Reset scroll flag when switching chats
  useEffect(() => {
    hasScrolledRef.current = false;
  }, [activeChat]);

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

  const sendMessage = async (imageUrl?: string) => {
    if (!userId || !activeChat || sending) return;
    if (!imageUrl && !newMsg.trim()) return;
    setSending(true);
    const payload: any = { sender_id: userId, receiver_id: activeChat, content: imageUrl ? '' : newMsg.trim() };
    if (imageUrl) payload.image_url = imageUrl;
    const { data } = await supabase.from('messages' as any).insert(payload).select('*').single();
    if (data) {
      setMessages((prev) => [...prev, data as unknown as Message]);
      setNewMsg('');
      loadConversations();
      // Scroll message container to bottom after sending
      setTimeout(() => {
        const container = messagesContainerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
      }, 50);
    }
    setSending(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId || !activeChat) return;
    setUploadingImage(true);
    const ext = file.name.split('.').pop();
    const path = `messages/${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      if (urlData?.publicUrl) {
        await sendMessage(urlData.publicUrl);
      }
    }
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Native Camera attach for iOS — uses Capacitor's Camera plugin so the
  // user gets the real native iOS picker (Camera / Photo Library) instead
  // of the HTML <input type="file"> route which crashes the WebView on iOS
  // after the camera returns the photo. Web stays on the file input.
  const handleAttachImage = async () => {
    if (!isNativeApp) {
      fileInputRef.current?.click();
      return;
    }
    if (!userId || !activeChat) return;
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
      });
      if (!photo.base64String) return;
      setUploadingImage(true);
      const format = photo.format ?? 'jpeg';
      const path = `messages/${userId}/${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
      const dataUrl = `data:image/${format};base64,${photo.base64String}`;
      const blob = await (await fetch(dataUrl)).blob();
      const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: blob.type });
      if (!error) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        if (urlData?.publicUrl) await sendMessage(urlData.publicUrl);
      }
    } catch {
      // User cancelled the picker or denied permission — silent.
    } finally {
      setUploadingImage(false);
    }
  };

  const searchEvents = async (q: string) => {
    setEventSearch(q);
    if (q.length < 2) { setEventResults([]); return; }
    const safeQ = q.replace(/[,%().*\\]/g, '');
    if (!safeQ) { setEventResults([]); return; }
    const { data } = await supabase.from('events').select('id, title, slug, city, country, image_path').eq('approved', true).ilike('title', `%${safeQ}%`).order('start_date', { ascending: false }).limit(6);
    setEventResults((data ?? []) as any[]);
  };

  const sendEvent = async (event: { title: string; slug: string }) => {
    if (!userId || !activeChat) return;
    const url = `${window.location.origin}/events/${event.slug}`;
    setSending(true);
    const { data } = await supabase.from('messages' as any).insert({ sender_id: userId, receiver_id: activeChat, content: `Check out ${event.title}\n${url}` } as any).select('*').single();
    if (data) {
      setMessages((prev) => [...prev, data as unknown as Message]);
      loadConversations();
    }
    setSending(false);
    setShowEventPicker(false);
    setEventSearch('');
    setEventResults([]);
  };

  const searchUsers = async (q: string) => {
    setSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const safeQ = q.replace(/[,%().*\\]/g, '');
    if (!safeQ) { setSearchResults([]); return; }
    const { data } = await supabase.from('profiles').select('id, full_name, avatar_url, username').eq('is_public', true).or(`full_name.ilike.%${safeQ}%,username.ilike.%${safeQ}%`).neq('id', userId!).limit(6);
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

  if (!userId) return (
    <div className="flex min-h-full items-center justify-center px-6 pb-24 text-center">
      <p className="text-sm text-slate-400">Please sign in to use messaging.</p>
    </div>
  );

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-5xl overflow-hidden bg-slate-950 sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl sm:shadow-black/40">


      {/* Left: conversation list */}
      <div className={`relative flex min-h-0 w-full flex-shrink-0 flex-col border-r border-white/5 sm:w-80 ${activeChat ? 'hidden sm:flex' : ''}`}>
        <div className="shrink-0 border-b border-white/5 p-4">
          <h2 className="text-lg font-bold text-white">Messages</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="w-full rounded-xl border border-white/5 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none backdrop-blur-sm transition focus:border-indigo-500/40 focus:bg-white/8"
              placeholder="Search people..."
              value={search}
              onChange={(e) => searchUsers(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-xl backdrop-blur-lg">
                {searchResults.map((p) => (
                  <button key={p.id} type="button" onClick={() => startChat(p)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/5">
                    <UserAvatar src={p.avatar_url} name={p.full_name} size={32} />
                    <span className="text-sm font-medium text-white">{p.full_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto pb-24 sm:pb-0 [-webkit-overflow-scrolling:touch] [overscroll-behavior:contain]"
          style={{ touchAction: 'pan-y' }}
        >
          {conversations.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">No conversations yet. Search for someone to message.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user_id}
                type="button"
                onClick={() => setActiveChat(c.user_id)}
                className={`flex w-full items-center gap-3 border-b border-white/[0.02] px-4 py-3.5 text-left transition ${activeChat === c.user_id ? 'bg-white/5' : 'hover:bg-white/[0.03]'}`}
              >
                <UserAvatar src={c.avatar_url} name={c.full_name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-white">{c.full_name ?? 'User'}</p>
                    <span className="text-[10px] text-slate-500">{timeDisplay(c.last_time)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{c.last_message || 'Sent an image'}</p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">{c.unread}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: chat — explicit bg-slate-950 so the column never shows the
          underlying [data-app-content] white through during keyboard-open
          layout shifts on iOS. */}
      <div className={`relative min-h-0 flex-1 flex-col bg-slate-950 ${!activeChat ? 'hidden sm:flex' : 'flex'}`}>
        {activeChat && activePerson ? (
          <>
            {/* Chat header */}
            <div className="shrink-0 flex items-center gap-3 border-b border-white/5 bg-slate-950/95 px-4 py-3 backdrop-blur-sm">
              <button type="button" onClick={() => setActiveChat(null)} className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 sm:hidden"><ArrowLeft className="h-5 w-5" /></button>
              <a href={activePerson.username ? `/profile/${activePerson.username}` : '#'} className="flex min-w-0 items-center gap-3 transition hover:opacity-80">
                <UserAvatar src={activePerson.avatar_url} name={activePerson.full_name} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{activePerson.full_name}</p>
                </div>
              </a>
            </div>

            {/* Messages — explicit bg-slate-950, momentum scroll, contained
                overscroll. Mask removed earlier (was causing iOS repaint
                jank). The bg matters: without it the column briefly shows
                white during the keyboard-open layout shift on iOS. */}
            <div
              ref={messagesContainerRef}
              className="relative min-h-0 flex-1 overflow-y-auto bg-slate-950 px-3 py-4 sm:px-4 [-webkit-overflow-scrolling:touch] [overscroll-behavior:contain]"
              style={{ touchAction: 'pan-y' }}
            >
              <div className="space-y-2">
                {messages.map((m, i) => {
                  const isMine = m.sender_id === userId;
                  const showAvatar = !isMine && (i === 0 || messages[i - 1].sender_id !== m.sender_id);
                  // Read receipt: show "Seen" on the last message sent by me if it's been read
                  const isLastSentByMe = isMine && (i === messages.length - 1 || !messages.slice(i + 1).some((next) => next.sender_id === userId));
                  return (
                    <div key={m.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && (
                        <div className="w-7 flex-shrink-0">
                          {showAvatar && <UserAvatar src={activePerson.avatar_url} name={activePerson.full_name} size={28} />}
                        </div>
                      )}
                      <div className={`max-w-[84%] sm:max-w-[70%] ${isMine ? 'order-1' : ''}`}>
                        {m.image_url && (
                          <img
                            src={m.image_url}
                            alt="Shared image"
                            className="max-h-64 rounded-2xl object-cover"
                            loading="lazy"
                          />
                        )}
                        {m.content && (() => {
                          // Detect event links and render as rich cards
                          const eventMatch = m.content.match(/(?:https?:\/\/[^/]+)?\/events\/([a-z0-9-]+)/i);
                          if (eventMatch) {
                            const eventSlug = eventMatch[1];
                            return (
                              <a href={`/events/${eventSlug}`} className="block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]">
                                <div className="px-3.5 py-2.5">
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Event</p>
                                  <p className="mt-0.5 text-sm font-medium text-white">{eventSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                                  <p className="mt-1 text-[11px] text-slate-400">Tap to view event details</p>
                                </div>
                              </a>
                            );
                          }
                          return (
                            <div className={`rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed ${
                              isMine
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                : 'bg-white/[0.06] text-slate-200'
                            }`}>
                              <p className="whitespace-pre-wrap break-words">{m.content}</p>
                            </div>
                          );
                        })()}
                        <div className={`mt-0.5 flex items-center gap-1.5 text-[10px] ${isMine ? 'justify-end pr-0.5' : 'pl-1'}`}>
                          <span className="text-slate-600">{timeDisplay(m.created_at)}</span>
                          {isLastSentByMe && m.is_read && (
                            <span className="text-indigo-400">Seen</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-white/5 bg-slate-950 p-2.5 sm:p-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={handleAttachImage}
                  disabled={uploadingImage}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/5 hover:text-slate-300 disabled:opacity-40 sm:h-10 sm:w-10"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
                {/* Share event button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEventPicker(!showEventPicker)}
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition sm:h-10 sm:w-10 ${showEventPicker ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                  >
                    <Calendar className="h-5 w-5" />
                  </button>
                  {showEventPicker && (
                    <div className="fixed inset-x-3 bottom-[5.25rem] z-[70] max-h-[55vh] overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-xl backdrop-blur-lg sm:absolute sm:bottom-full sm:left-0 sm:right-auto sm:mb-2 sm:w-72">
                      <div className="p-3">
                        <p className="text-xs font-semibold text-slate-400">Share an event</p>
                        <input
                          className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/40"
                          placeholder="Search events..."
                          value={eventSearch}
                          onChange={(e) => searchEvents(e.target.value)}
                          autoFocus
                        />
                      </div>
                      {eventResults.length > 0 && (
                        <div className="max-h-48 overflow-y-auto border-t border-white/5">
                          {eventResults.map((ev) => (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => sendEvent(ev)}
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/5"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">{ev.title}</p>
                                <p className="truncate text-[11px] text-slate-500">{ev.city}, {ev.country}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <input
                  className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-[16px] text-white placeholder-slate-500 outline-none transition focus:border-indigo-500/40 focus:bg-white/8 sm:min-h-10"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Message..."
                  autoComplete="off"
                  autoCorrect="on"
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={sending || !newMsg.trim()}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white transition hover:from-indigo-400 hover:to-purple-500 disabled:opacity-30 sm:h-10 sm:w-10"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-24 text-center sm:pb-0">
            <div className="relative rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
              <p className="relative text-lg font-bold text-white">Your messages</p>
              <p className="relative mt-1 text-sm text-slate-500">Select a conversation or search for someone to message.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
