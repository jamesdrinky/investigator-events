'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Calendar, Users, User, MessageCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { hapticTap } from '@/lib/capacitor';

const tabs = [
  { href: '/', icon: Home, label: 'Home', badge: false },
  { href: '/calendar', icon: Calendar, label: 'Events', badge: false },
  { href: '/people', icon: MessageCircle, label: 'Forum', badge: false },
  { href: '/associations', icon: Users, label: 'Network', badge: false },
  { href: '/profile', icon: User, label: 'Profile', badge: true },
];

export function BottomTabBar() {
  const currentPathname = usePathname();
  const [profilePath, setProfilePath] = useState('/signin');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const uid = data.user.id;
        supabase.from('profiles').select('username').eq('id', uid).single().then(({ data: p }) => {
          if (p?.username) setProfilePath(`/profile/${p.username}`);
          else setProfilePath('/profile/setup');
        });

        Promise.all([
          supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('is_read', false),
          supabase.from('messages' as any).select('id', { count: 'exact', head: true }).eq('receiver_id', uid).eq('is_read', false),
        ]).then(([notifs, msgs]) => {
          setUnreadCount((notifs.count ?? 0) + (msgs.count ?? 0));
        });
      }
    });
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return currentPathname === '/';
    if (href === '/profile') return currentPathname.startsWith('/profile');
    return currentPathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      <div className="flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const href = tab.href === '/profile' ? profilePath : tab.href;
          const Icon = tab.icon;
          const showBadge = tab.badge && unreadCount > 0;

          return (
            <Link
              key={tab.label}
              href={href as any}
              prefetch={true}
              onClick={(e) => {
                hapticTap();
                if (active) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                active ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <div className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                active ? 'bg-blue-50 scale-110' : ''
              }`}>
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                {showBadge && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${
                active ? 'text-blue-600' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
