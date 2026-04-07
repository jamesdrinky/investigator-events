'use client';

import { useState } from 'react';
import { Users, MessageCircle, Star } from 'lucide-react';
import { AttendeeAvatars } from '@/components/AttendeeAvatars';
import { EventChat } from '@/components/EventChat';
import { EventReview } from '@/components/EventReview';

const tabs = [
  { id: 'going', label: 'Going', icon: Users },
  { id: 'discussion', label: 'Discussion', icon: MessageCircle },
  { id: 'reviews', label: 'Reviews', icon: Star },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function EventCommunityTabs({ eventId, isPast }: { eventId: string; isPast: boolean }) {
  const [active, setActive] = useState<TabId>('going');

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border-2 border-blue-200/60 bg-gradient-to-b from-blue-50/40 to-white shadow-[0_12px_40px_-12px_rgba(22,104,255,0.1)]">
      {/* Tab header */}
      <div className="flex border-b border-blue-100/80 bg-white/80 backdrop-blur-sm">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 px-3 py-3.5 text-sm font-semibold transition-colors sm:py-4 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-blue-500' : ''}`} />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
              {/* Active indicator */}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-4 sm:p-6">
        {active === 'going' && <AttendeeAvatars eventId={eventId} />}
        {active === 'discussion' && <EventChat eventId={eventId} />}
        {active === 'reviews' && <EventReview eventId={eventId} isPast={isPast} />}
      </div>
    </div>
  );
}
