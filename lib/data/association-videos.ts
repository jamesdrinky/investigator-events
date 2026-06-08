import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

// The association_videos table isn't in the generated Database types yet, so we
// cast through `as any` for the query — the same approach the codebase already
// uses for association_pages / association_posts.

// How long a minted signed playback URL stays valid. The public association page
// re-renders every 60s (revalidate) and the admin queue is force-dynamic, so a
// 1-hour window comfortably outlives any cached HTML that embeds the URL.
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const BUCKET = 'event-videos';

export interface AssociationVideoItem {
  id: string;
  kind: string;
  associationSlug: string | null;
  associationName: string | null;
  eventSlug: string | null;
  eventTitle: string | null;
  submitterName: string;
  submitterEmail: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  status: 'pending' | 'approved' | 'rejected';
  transcodeStatus: string;
  isPaid: boolean;
  createdAt: string;
}

type AdminClient = ReturnType<typeof createSupabaseAdminServerClient>;

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

/**
 * Resolve each row's stored `video_url` to a playable URL. Member videos store a
 * path inside the private bucket → mint a short-lived signed URL. A full https
 * URL (e.g. a phase-2 Vercel Blob link) is used as-is.
 */
async function signVideoUrls(admin: AdminClient, rows: any[]): Promise<Map<string, string>> {
  const resolved = new Map<string, string>();
  const pathsToSign: string[] = [];

  for (const row of rows) {
    const raw = typeof row.video_url === 'string' ? row.video_url : '';
    if (!raw) continue;
    if (isHttpUrl(raw)) {
      resolved.set(raw, raw);
    } else {
      pathsToSign.push(raw);
    }
  }

  if (pathsToSign.length > 0) {
    const { data, error } = await admin.storage.from(BUCKET).createSignedUrls(pathsToSign, SIGNED_URL_TTL_SECONDS);
    if (error) {
      console.error('signVideoUrls failed:', error.message);
    }
    // createSignedUrls preserves input order; zip by index.
    pathsToSign.forEach((path, i) => {
      const signed = data?.[i]?.signedUrl;
      if (signed) resolved.set(path, signed);
    });
  }

  return resolved;
}

function mapRow(row: any, videoUrl: string, associationName: string | null, eventTitle: string | null = null): AssociationVideoItem {
  return {
    id: row.id,
    kind: row.kind,
    associationSlug: row.association_slug ?? null,
    associationName,
    eventSlug: row.event_slug ?? null,
    eventTitle,
    submitterName: row.submitter_name,
    submitterEmail: row.submitter_email,
    title: row.title,
    description: row.description ?? null,
    videoUrl,
    thumbnailUrl: row.thumbnail_url ?? null,
    durationSeconds: row.duration_seconds ?? null,
    status: row.status,
    transcodeStatus: row.transcode_status ?? 'ready',
    isPaid: Boolean(row.is_paid),
    createdAt: row.created_at,
  };
}

/** Look up association display names for a set of slugs (for the admin queue). */
async function fetchAssociationNames(admin: AdminClient, slugs: string[]): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return names;

  const { data, error } = await admin
    .from('association_pages' as any)
    .select('slug, name')
    .in('slug', unique);
  if (error) {
    console.error('fetchAssociationNames failed:', error.message);
    return names;
  }
  for (const row of (data ?? []) as any[]) {
    if (row.slug) names.set(row.slug, row.name ?? null);
  }
  return names;
}

/** Look up event titles for a set of slugs (for the admin queue). */
async function fetchEventTitles(admin: AdminClient, slugs: string[]): Promise<Map<string, string>> {
  const titles = new Map<string, string>();
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return titles;

  const { data, error } = await admin
    .from('events')
    .select('slug, title')
    .in('slug', unique);
  if (error) {
    console.error('fetchEventTitles failed:', error.message);
    return titles;
  }
  for (const row of (data ?? []) as any[]) {
    if (row.slug) titles.set(row.slug, row.title ?? null);
  }
  return titles;
}

/** Approved videos for a single event page (public). */
export async function fetchApprovedVideosForEvent(slug: string): Promise<AssociationVideoItem[]> {
  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await supabase
    .from('association_videos' as any)
    .select('*')
    .eq('event_slug', slug)
    .eq('status', 'approved')
    .eq('transcode_status', 'ready')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchApprovedVideosForEvent failed:', error.message);
    return [];
  }

  const rows = (data ?? []) as any[];
  const signed = await signVideoUrls(supabase, rows);
  return rows
    .map((row) => mapRow(row, signed.get(row.video_url) ?? '', null, null))
    .filter((v) => v.videoUrl !== '');
}

/** Approved videos for a single association page (public). */
export async function fetchApprovedVideosForAssociation(slug: string): Promise<AssociationVideoItem[]> {
  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await supabase
    .from('association_videos' as any)
    .select('*')
    .eq('association_slug', slug)
    .eq('status', 'approved')
    .eq('transcode_status', 'ready')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchApprovedVideosForAssociation failed:', error.message);
    return [];
  }

  const rows = (data ?? []) as any[];
  const signed = await signVideoUrls(supabase, rows);
  return rows
    .map((row) => mapRow(row, signed.get(row.video_url) ?? '', null))
    .filter((v) => v.videoUrl !== '');
}

/** Everything awaiting admin verification (admin only). */
export async function fetchPendingVideos(): Promise<AssociationVideoItem[]> {
  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await supabase
    .from('association_videos' as any)
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('fetchPendingVideos failed:', error.message);
    return [];
  }

  const rows = (data ?? []) as any[];
  const [signed, names, eventTitles] = await Promise.all([
    signVideoUrls(supabase, rows),
    fetchAssociationNames(supabase, rows.map((r) => r.association_slug)),
    fetchEventTitles(supabase, rows.map((r) => r.event_slug)),
  ]);

  return rows.map((row) =>
    mapRow(
      row,
      signed.get(row.video_url) ?? '',
      row.association_slug ? names.get(row.association_slug) ?? null : null,
      row.event_slug ? eventTitles.get(row.event_slug) ?? null : null,
    ),
  );
}
