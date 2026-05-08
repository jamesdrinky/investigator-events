import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';
import { getProfileCompletion } from '@/lib/utils/profile-completion';
import type { ReengagementInput } from '@/lib/email/reengagement';

const SITE = 'https://investigatorevents.com';

const FIELD_HREF: Record<string, string> = {
  full_name: `${SITE}/profile/edit`,
  avatar_url: `${SITE}/profile/edit`,
  headline: `${SITE}/profile/edit`,
  country: `${SITE}/profile/edit`,
  specialisation: `${SITE}/profile/edit`,
  bio: `${SITE}/profile/edit`,
  website: `${SITE}/profile/edit`,
  banner_url: `${SITE}/profile/edit`,
  auth_provider: `${SITE}/profile/edit`,
  hasAssociations: `${SITE}/profile/edit`,
  hasExperience: `${SITE}/profile/edit`,
};

interface BuildArgs {
  admin: SupabaseClient<Database>;
  userId: string;
}

export interface UserSnapshot {
  userId: string;
  email: string | null;
  fullName: string | null;
  username: string | null;
  isLinkedInVerified: boolean;
  isManuallyVerified: boolean;
  completionScore: number;
  isNewsletterSubscribed: boolean;
  unsubscribeToken: string | null;
  input: ReengagementInput;
}

export async function buildReengagementSnapshot({ admin, userId }: BuildArgs): Promise<UserSnapshot | null> {
  // Profile
  const { data: profile } = await admin.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (!profile) return null;

  // Email + last_sign_in_at via auth admin API
  const { data: authData } = await admin.auth.admin.getUserById(userId);
  const email = authData?.user?.email ?? null;
  const lastSignInAt = authData?.user?.last_sign_in_at ?? null;

  // Associations and experience flags for completion score
  const [{ data: assocs }, { data: experiences }] = await Promise.all([
    admin.from('user_associations').select('id').eq('user_id', userId).limit(1),
    admin.from('work_experience').select('id').eq('user_id', userId).limit(1),
  ]);
  const hasAssociations = (assocs ?? []).length > 0;
  const hasExperience = (experiences ?? []).length > 0;

  const p = profile as any;
  const completion = getProfileCompletion({
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    headline: p.headline,
    country: p.country,
    specialisation: p.specialisation,
    bio: p.bio,
    website: p.website,
    banner_url: p.banner_url,
    auth_provider: p.auth_provider,
    hasAssociations,
    hasExperience,
  });

  const missingItems = completion.checks
    .filter((c) => !c.completed)
    .sort((a, b) => b.weight - a.weight)
    .map((c) => ({ label: c.label, href: FIELD_HREF[c.key] ?? `${SITE}/profile/edit` }));

  const isLinkedInVerified = p.auth_provider === 'linkedin_oidc';
  const isManuallyVerified = p.is_verified === true;

  // Stats since last sign-in (or last 30 days if never)
  const sinceISO = lastSignInAt ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const [eventsCountResult, assocsCountResult, newEventsListResult, newAssocsListResult] = await Promise.all([
    admin.from('events').select('id', { count: 'exact', head: true }).eq('approved', true).gt('created_at', sinceISO),
    admin.from('association_pages').select('id', { count: 'exact', head: true }).gt('created_at', sinceISO),
    // Up to 5 most-recent new events that are still upcoming, since last login
    admin.from('events')
      .select('title, slug, city, country, start_date, image_path')
      .eq('approved', true)
      .gt('created_at', sinceISO)
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(5),
    admin.from('association_pages')
      .select('name, slug, logo_url')
      .gt('created_at', sinceISO)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);
  const newEventsCount = eventsCountResult.count ?? 0;
  const newAssociationsCount = assocsCountResult.count ?? 0;
  const mapEvent = (e: any) => ({
    title: e.title,
    slug: e.slug ?? '',
    city: e.city,
    country: e.country,
    startDate: e.start_date,
    imagePath: e.image_path ?? null,
  });
  const mapAssoc = (a: any) => ({ name: a.name, slug: a.slug, logoUrl: a.logo_url ?? null });

  // Resolve events block: prefer "new since last visit"; otherwise show next 5 upcoming.
  let events = (newEventsListResult.data ?? []).map(mapEvent);
  let eventsMode: 'new_since_visit' | 'upcoming' = 'new_since_visit';
  let eventsTotalCount = newEventsCount;
  if (events.length === 0) {
    const { data: upcoming } = await admin.from('events')
      .select('title, slug, city, country, start_date, image_path')
      .eq('approved', true)
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(5);
    events = (upcoming ?? []).map(mapEvent);
    eventsMode = 'upcoming';
    eventsTotalCount = events.length;
  }

  // Resolve associations block: prefer "new since last visit"; otherwise show 5 featured/recent.
  let associations = (newAssocsListResult.data ?? []).map(mapAssoc);
  let associationsMode: 'new_since_visit' | 'featured' = 'new_since_visit';
  let associationsTotalCount = newAssociationsCount;
  if (associations.length === 0) {
    const { data: featured } = await admin.from('association_pages')
      .select('name, slug, logo_url')
      .order('member_count', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(5);
    associations = (featured ?? []).map(mapAssoc);
    associationsMode = 'featured';
    associationsTotalCount = associations.length;
  }

  const daysSinceLastSeen = lastSignInAt
    ? Math.max(0, Math.round((Date.now() - new Date(lastSignInAt).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Newsletter eligibility (GDPR): only send to opted-in active subscribers.
  let unsubscribeToken: string | null = null;
  let isNewsletterSubscribed = false;
  if (email) {
    const { data: sub } = await (admin.from('newsletter_subscribers' as any)
      .select('status, unsubscribe_token')
      .eq('email', email.toLowerCase())
      .maybeSingle() as any);
    if (sub && sub.status === 'active') {
      isNewsletterSubscribed = true;
      unsubscribeToken = sub.unsubscribe_token ?? null;
    }
  }

  const input: ReengagementInput = {
    fullName: p.full_name,
    username: p.username,
    completionScore: completion.score,
    missingItems,
    isLinkedInVerified,
    isManuallyVerified,
    daysSinceLastSeen,
    eventsMode,
    eventsTotalCount,
    events,
    associationsMode,
    associationsTotalCount,
    associations,
    hasOwnAssociations: hasAssociations,
    unsubscribeToken,
  };

  return {
    userId,
    email,
    fullName: p.full_name,
    username: p.username,
    isLinkedInVerified,
    isManuallyVerified,
    completionScore: completion.score,
    isNewsletterSubscribed,
    unsubscribeToken,
    input,
  };
}
