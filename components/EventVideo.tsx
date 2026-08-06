'use client';

import { VideoPlayer } from '@/components/VideoPlayer';
import { parseVideoUrl } from '@/lib/utils/video-embed';

/**
 * Plays a submitted video whichever way it arrived: an upload we host (streamed
 * by id through /api/video/<id>) or an external link (YouTube/Vimeo embed, or a
 * direct file URL). Links exist because iOS won't release large clips from
 * Photos to a web upload — see lib/utils/video-embed.
 */
export function EventVideo({
  id,
  videoUrl,
  className,
  videoClassName,
  label,
  description,
  logo,
}: {
  id: string;
  videoUrl: string;
  className?: string;
  videoClassName?: string;
  label?: string | null;
  description?: string | null;
  logo?: string | null;
}) {
  const embed = /^https?:\/\//i.test(videoUrl) ? parseVideoUrl(videoUrl) : null;

  if (embed && (embed.kind === 'youtube' || embed.kind === 'vimeo')) {
    return (
      <div className={className}>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
          <iframe
            src={embed.embedUrl}
            title={label || 'Event video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        {label && <p className="mt-2 text-sm font-semibold text-slate-800">{label}</p>}
      </div>
    );
  }

  if (embed && embed.kind === 'file') {
    return (
      <div className={className}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={embed.embedUrl} controls playsInline className={videoClassName ?? 'w-full rounded-2xl bg-black'} />
        {label && <p className="mt-2 text-sm font-semibold text-slate-800">{label}</p>}
      </div>
    );
  }

  return (
    <VideoPlayer
      id={id}
      className={className}
      videoClassName={videoClassName}
      label={label}
      description={description}
      logo={logo}
    />
  );
}
