/**
 * External video links (YouTube / Vimeo / direct file URLs).
 *
 * Large clips can't reliably leave an iPhone's photo library through a web
 * upload — iOS copies the whole asset first and gives up on big files. Most
 * conference footage already lives on YouTube or Vimeo anyway, so accepting a
 * link sidesteps the upload entirely and works on every device.
 */

export type VideoEmbed =
  | { kind: 'youtube'; id: string; embedUrl: string; thumbnailUrl: string }
  | { kind: 'vimeo'; id: string; embedUrl: string; thumbnailUrl: null }
  | { kind: 'file'; embedUrl: string; thumbnailUrl: null };

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);

/** Direct-playable file, e.g. a Dropbox/Drive/CDN link ending in a video type. */
const FILE_EXT = /\.(mp4|mov|m4v|webm)(\?|$)/i;

/**
 * Parse a user-supplied URL into something we can render. Returns null when the
 * link isn't a video we can embed — callers should reject it with a message
 * rather than storing something that will never play.
 */
export function parseVideoUrl(input: string): VideoEmbed | null {
  const raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const host = url.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.has(host)) {
    // youtu.be/<id> · /watch?v=<id> · /embed/<id> · /shorts/<id> · /live/<id>
    let id = '';
    if (host.endsWith('youtu.be')) {
      id = url.pathname.split('/').filter(Boolean)[0] ?? '';
    } else if (url.pathname === '/watch') {
      id = url.searchParams.get('v') ?? '';
    } else {
      const parts = url.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live', 'v'].includes(parts[0] ?? '')) id = parts[1] ?? '';
    }
    if (!/^[\w-]{6,20}$/.test(id)) return null;
    return {
      kind: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  if (VIMEO_HOSTS.has(host)) {
    const parts = url.pathname.split('/').filter(Boolean);
    const id = (parts[0] === 'video' ? parts[1] : parts[0]) ?? '';
    if (!/^\d{6,12}$/.test(id)) return null;
    return { kind: 'vimeo', id, embedUrl: `https://player.vimeo.com/video/${id}`, thumbnailUrl: null };
  }

  if (FILE_EXT.test(url.pathname)) {
    return { kind: 'file', embedUrl: url.toString(), thumbnailUrl: null };
  }

  // Dropbox/Drive share pages need a tweak to serve the file itself.
  if (host.endsWith('dropbox.com')) {
    url.searchParams.set('dl', '1');
    return { kind: 'file', embedUrl: url.toString(), thumbnailUrl: null };
  }

  return null;
}

export function isSupportedVideoUrl(input: string): boolean {
  return parseVideoUrl(input) !== null;
}
