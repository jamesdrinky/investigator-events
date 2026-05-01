'use client';

import { useEffect, useState } from 'react';
import { Calendar, Users, Search, User, MessageCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const tabs = [
  { href: '/', icon: Search, label: 'Explore' },
  { href: '/calendar', icon: Calendar, label: 'Events' },
  { href: '/people', icon: MessageCircle, label: 'Forum' },
  { href: '/associations', icon: Users, label: 'Network' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomTabBar() {
  const [pathname, setPathname] = useState('');
  const [profilePath, setProfilePath] = useState('/signin');

  useEffect(() => {
    setPathname(window.location.pathname);

    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').select('username').eq('id', data.user.id).single().then(({ data: p }) => {
          if (p?.username) setProfilePath(`/profile/${p.username}`);
          else setProfilePath('/profile/setup');
        });
      }
    });

    // Listen for navigation changes
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/profile') return pathname.startsWith('/profile');
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const href = tab.href === '/profile' ? profilePath : tab.href;
          const Icon = tab.icon;

          return (
            <a
              key={tab.label}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                active ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <div className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                active ? 'bg-blue-50 scale-110' : ''
              }`}>
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${
                active ? 'text-blue-600' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
