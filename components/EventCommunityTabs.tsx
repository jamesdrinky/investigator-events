'use client';

import { useState } from 'react';
import { MessageCircle, Star } from 'lucide-react';
import { EventChat } from '@/components/EventChat';
import { EventReview } from '@/components/EventReview';

const tabs = [
  { id: 'discussion', label: 'Discussion', icon: MessageCircle },
  { id: 'reviews', label: 'Reviews', icon: Star },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function EventCommunityTabs({ eventId, isPast }: { eventId: string; isPast: boolean }) {
  const [active, setActive] = useState<TabId>('discussion');

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
      {/* Tab header */}
      <div className="flex border-b border-slate-100">
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
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-4 sm:p-6">
        {active === 'discussion' && <EventChat eventId={eventId} />}
        {active === 'reviews' && <EventReview eventId={eventId} isPast={isPast} />}
      </div>
    </div>
  );
}
