'use client';

import { useEffect, useState } from 'react';
import { UserPlus, UserCheck, Clock, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type Status = 'none' | 'pending-sent' | 'pending-received' | 'connected';

export function ConnectionButton({ targetUserId }: { targetUserId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('none');
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid || uid === targetUserId) return;

      // Check if connection exists in either direction
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
      await supabase.from('connections').insert({ requester_id: userId, addressee_id: targetUserId, status: 'pending' });
      setStatus('pending-sent');
    } else if (status === 'pending-received') {
      // Accept
      await supabase.from('connections').update({ status: 'accepted' }).or(`and(requester_id.eq.${targetUserId},addressee_id.eq.${userId})`);
      setStatus('connected');
    } else if (status === 'connected' || status === 'pending-sent') {
      // Remove/withdraw
      await supabase.from('connections').delete().or(`and(requester_id.eq.${userId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${userId})`);
      setStatus('none');
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
    <button
      type="button"
      onClick={handleConnect}
      disabled={toggling}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${config.cls}`}
    >
      <Icon className="h-4 w-4" />
      {status === 'connected' && !toggling ? 'Connected' : config.label}
    </button>
  );
}
