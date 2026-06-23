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
  description,
  logo,
}: {
  id: string;
  /** Accepted for call-site compatibility; the poster is served from the
   *  stable /api/video/<id>/poster route instead. */
  poster?: string | null;
  className?: string;
  videoClassName?: string;
  /** Title shown on the thumbnail (bottom). */
  label?: string | null;
  /** Short explanation of the video, shown under the title on the thumbnail. */
  description?: string | null;
  /** Logo (e.g. association/organiser) overlaid as a badge on the thumbnail. */
  logo?: string | null;
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
          className="group absolute inset-0 flex items-center justify-center bg-black/15 transition hover:bg-black/25"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logo && (
            <span className="pointer-events-none absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 p-1.5 shadow-md ring-1 ring-black/5">
              <img src={logo} alt="" className="h-full w-full object-contain" />
            </span>
          )}
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.6)] ring-1 ring-white/40 backdrop-blur transition group-hover:scale-105">
            <Play className="ml-1 h-7 w-7 fill-slate-900 text-slate-900" />
          </span>
          {(label || description) && (
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3.5 pt-10 text-left">
              {label && <span className="block line-clamp-1 text-sm font-bold leading-tight text-white drop-shadow">{label}</span>}
              {description && <span className="mt-0.5 block line-clamp-2 text-xs leading-snug text-white/85 drop-shadow">{description}</span>}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
