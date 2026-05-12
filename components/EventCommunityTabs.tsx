'use client';

import { useState } from 'react';
import { MessageCircle, Star } from 'lucide-react';
import { EventChat } from '@/components/EventChat';
import { EventReview } from '@/components/EventReview';

const tabs = [
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'discussion', label: 'Discussion', icon: MessageCircle },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function EventCommunityTabs({ eventId, isPast }: { eventId: string; isPast: boolean }) {
  const [active, setActive] = useState<TabId>('reviews');

  return (
    <div id="reviews" className="mt-10 scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
      {/* Tab header */}
      <div className="flex">
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
                  ? 'text-slate-950'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-500' : ''}`} />
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content — reserve min height so chat/reviews loading
          doesn't shift the rest of the page upwards as you scroll past. */}
      <div className="min-h-[420px]">
        {active === 'discussion' && <EventChat eventId={eventId} />}
        {active === 'reviews' && (
          <div className="p-4 sm:p-6">
            <EventReview eventId={eventId} isPast={isPast} />
          </div>
        )}
      </div>
    </div>
  );
}
