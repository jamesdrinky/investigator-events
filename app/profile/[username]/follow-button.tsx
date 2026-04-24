'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus, UserCheck, Clock, Send, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type Status = 'none' | 'pending-sent' | 'pending-received' | 'connected';

export function ConnectionButton({ targetUserId }: { targetUserId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('none');
  const [toggling, setToggling] = useState(false);
  const [showMessagePrompt, setShowMessagePrompt] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid || uid === targetUserId) return;

      const { data: conn } = await supabase
        .from('connections')
        .select('id, requester_id, status')
        .or(`and(requester_id.eq.${uid},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${uid})`)
        .single();

      if (conn) {
        if (conn.status === 'accepted') setStatus('connected');
        else if (conn.requester_id === uid) setStatus('pending-sent');
        else setStatus('pending-received');
      }
    });
  }, [targetUserId]);

  if (!userId || userId === targetUserId) return null;

  const handleConnect = async () => {
    setToggling(true);
    const supabase = createSupabaseBrowserClient();

    if (status === 'none') {
      const { error: insertErr } = await supabase.from('connections').insert({ requester_id: userId, addressee_id: targetUserId, status: 'pending' });
      if (!insertErr) {
        setStatus('pending-sent');
        const { data: myProfile } = await supabase.from('profiles').select('full_name, username').eq('id', userId).single();
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: targetUserId,
            actorId: userId,
            type: 'connection_request',
            title: `${myProfile?.full_name ?? 'Someone'} wants to connect`,
            body: 'You have a new connection request.',
            link: myProfile?.username ? `/profile/${myProfile.username}` : '/people?tab=discover',
          }),
        }).catch(() => {});
      }
    } else if (status === 'pending-received') {
      const { error: updateErr } = await supabase.from('connections').update({ status: 'accepted' }).or(`and(requester_id.eq.${targetUserId},addressee_id.eq.${userId})`);
      if (!updateErr) {
        setStatus('connected');
        setShowMessagePrompt(true);
        const { data: myProfile } = await supabase.from('profiles').select('full_name, username').eq('id', userId).single();
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: targetUserId,
            actorId: userId,
            type: 'connection_accepted',
            title: `${myProfile?.full_name ?? 'Someone'} accepted your connection`,
            link: myProfile?.username ? `/profile/${myProfile.username}` : '/people?tab=discover',
          }),
        }).catch(() => {});
      }
    } else if (status === 'connected' || status === 'pending-sent') {
      await supabase.from('connections').delete().or(`and(requester_id.eq.${userId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${userId})`);
      setStatus('none');
      setShowMessagePrompt(false);
    }
    setToggling(false);
  };

  const config = {
    none: { label: 'Connect', icon: UserPlus, cls: 'bg-blue-600 text-white hover:bg-blue-700' },
    'pending-sent': { label: 'Pending', icon: Clock, cls: 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500' },
    'pending-received': { label: 'Accept', icon: UserCheck, cls: 'bg-emerald-600 text-white hover:bg-emerald-700' },
    connected: { label: 'Connected', icon: UserCheck, cls: 'bg-blue-50 text-blue-600 hover:bg-red-50 hover:text-red-500' },
  }[status];

  const Icon = config.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleConnect}
        disabled={toggling}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${config.cls}`}
      >
        <Icon className="h-4 w-4" />
        {status === 'connected' && !toggling ? 'Connected' : config.label}
      </button>

      {/* Message prompt after accepting connection */}
      {showMessagePrompt && (
        <div className="absolute left-1/2 top-full z-20 mt-3 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMessagePrompt(false)}
              className="absolute -right-1 -top-1 rounded-full p-0.5 text-slate-300 hover:text-slate-500"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="text-sm font-semibold text-slate-900">You're now connected!</p>
            <p className="mt-1 text-xs text-slate-500">Want to send them a message to introduce yourself?</p>
            <div className="mt-3 flex items-center gap-2">
              <Link
                href={`/messages?to=${targetUserId}` as any}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                <Send className="h-3 w-3" /> Send message
              </Link>
              <button
                type="button"
                onClick={() => setShowMessagePrompt(false)}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
