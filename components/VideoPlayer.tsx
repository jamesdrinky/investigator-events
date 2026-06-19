'use client';

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Reusable video player with an auto-generated thumbnail + obvious play button,
 * so every video on the site reads as a video before you click — no per-video
 * design needed.
 *
 * - The still is a server-generated poster frame, served from the stable
 *   /api/video/<id>/poster route (auto-created for every video in the transcode
 *   pipeline), so it shows a real frame instead of a black box.
 * - A play-button overlay + light scrim sits on top until playback starts, so
 *   it's unmistakably a video. Clicking it (or the video) plays.
 *
 * `className` styles the wrapper (control the box: aspect/size/rounding);
 * `videoClassName` styles the <video> itself.
 */
export function VideoPlayer({
  id,
  className,
  videoClassName,
  label,
}: {
  id: string;
  /** Accepted for call-site compatibility; the poster is served from the
   *  stable /api/video/<id>/poster route instead. */
  poster?: string | null;
  className?: string;
  videoClassName?: string;
  label?: string | null;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <video
        ref={ref}
        src={`/api/video/${id}`}
        poster={`/api/video/${id}/poster`}
        controls
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className={videoClassName ?? 'h-full w-full bg-black object-contain'}
      />

      {!playing && (
        <button
          type="button"
          onClick={() => ref.current?.play()}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-black/15 transition hover:bg-black/25"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.6)] ring-1 ring-white/40 backdrop-blur transition group-hover:scale-105">
            <Play className="ml-1 h-7 w-7 fill-slate-900 text-slate-900" />
          </span>
          {label && (
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8 text-left">
              <span className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow">{label}</span>
            </span>
          )}
        </button>
      )}
    </div>
  );
}
