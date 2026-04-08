'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';

type AttendedEvent = {
  id: string;
  title: string;
  slug: string;
  city: string;
  country: string;
  start_date: string;
  image_path: string | null;
  is_past: boolean;
};

function getImageSrc(image_path: string | null) {
  if (image_path && /^(\/(cities|events|images)\/|https?:\/\/)/.test(image_path)) return image_path;
  return '/cities/fallback.jpg';
}

export function EventsAttendanceStack({ events }: { events: AttendedEvent[] }) {
  const [expanded, setExpanded] = useState(false);

  if (events.length === 0) return null;

  const pastEvents = events.filter((e) => e.is_past);
  const futureEvents = events.filter((e) => !e.is_past);
  const stackEvents = events.slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-bold text-slate-900">Events</h2>
      <p className="mt-1 text-xs text-slate-400">
        {pastEvents.length > 0 && <span>{pastEvents.length} attended</span>}
        {pastEvents.length > 0 && futureEvents.length > 0 && <span> · </span>}
        {futureEvents.length > 0 && <span>{futureEvents.length} upcoming</span>}
      </p>

      {/* Stacked circles - collapsed view */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="group relative flex items-center"
        >
          {/* Stacked circular images */}
          <div className="flex items-center">
            {stackEvents.map((event, i) => (
              <div
                key={event.id}
                className="relative overflow-hidden rounded-full border-[3px] border-white shadow-md transition-all duration-300 group-hover:shadow-lg"
                style={{
                  width: 56,
                  height: 56,
                  marginLeft: i === 0 ? 0 : -16,
                  zIndex: stackEvents.length - i,
                }}
              >
                <Image
                  src={getImageSrc(event.image_path)}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {events.length > 5 && (
              <div
                className="relative flex items-center justify-center rounded-full border-[3px] border-white bg-slate-100 shadow-md"
                style={{ width: 56, height: 56, marginLeft: -16, zIndex: 0 }}
              >
                <span className="text-sm font-semibold text-slate-500">+{events.length - 5}</span>
              </div>
            )}
          </div>
          <span className="ml-3 text-xs font-medium text-slate-400 transition group-hover:text-blue-600">
            {expanded ? 'Collapse' : 'View all'}
          </span>
        </button>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="mt-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Upcoming */}
          {futureEvents.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-blue-500">Going to</p>
              <div className="space-y-2">
                {futureEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={event.slug ? `/events/${event.slug}` : `/calendar`}
                    className="group/card flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 transition hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
                      <Image src={getImageSrc(event.image_path)} alt={event.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 group-hover/card:text-blue-600">{event.title}</p>
                      <p className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Calendar className="h-3 w-3" /> {new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <MapPin className="h-3 w-3" /> {event.city}, {event.country}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {pastEvents.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Been to</p>
              <div className="space-y-2">
                {pastEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={event.slug ? `/events/${event.slug}` : `/calendar`}
                    className="group/card flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 transition hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
                      <Image src={getImageSrc(event.image_path)} alt={event.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 group-hover/card:text-blue-600">{event.title}</p>
                      <p className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Calendar className="h-3 w-3" /> {new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <MapPin className="h-3 w-3" /> {event.city}, {event.country}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
