import { notFound } from 'next/navigation';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { fetchAllEvents } from '@/lib/data/events';
import { getAssociationBrandLogoSrc, shouldInvertLogoOnLight } from '@/lib/utils/association-branding';
import { formatEventDate } from '@/lib/utils/date';
import { AssociationPageTabs } from '@/components/associations/AssociationPageTabs';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createSupabaseSSRServerClient();
  const { data: page } = await supabase.from('association_pages' as any).select('name, description').eq('slug', params.slug).single();
  if (!page) return { title: 'Association' };
  return {
    title: `${(page as any).name} | Investigator Events`,
    description: (page as any).description || `${(page as any).name} — professional investigator association on Investigator Events.`,
  };
}

export default async function AssociationPage({ params }: { params: { slug: string } }) {
  const supabase = await createSupabaseSSRServerClient();
  const { data: pageData } = await supabase.from('association_pages' as any).select('*').eq('slug', params.slug).single();
  if (!pageData) notFound();
  const page = pageData as any;

  const logoSrc = getAssociationBrandLogoSrc(page.name) || getAssociationBrandLogoSrc(page.slug.toUpperCase());
  const invertLogo = shouldInvertLogoOnLight(page.name) || shouldInvertLogoOnLight(page.slug.toUpperCase());

  // Fire every independent query in parallel (was sequential — 7 round-trips
  // back-to-back blew up first-load latency on slow connections).
  const orFilter = `association_slug.eq.${page.slug},association_name.ilike.%${page.slug}%`;
  const [
    allEvents,
    memberRowsRes,
    verifiedRowsRes,
    memberCountRes,
    postRowsRes,
    jobRowsRes,
  ] = await Promise.all([
    fetchAllEvents(),
    supabase
      .from('user_associations')
      .select('user_id, role, member_since')
      .or(orFilter)
      .limit(100),
    supabase
      .from('member_verifications' as any)
      .select('user_id, status')
      .eq('status', 'verified')
      .ilike('association_name', `%${page.slug}%`),
    supabase
      .from('user_associations')
      .select('id', { count: 'exact', head: true })
      .or(orFilter),
    supabase
      .from('association_posts' as any)
      .select('id, title, content, image_url, link_url, is_pinned, likes_count, created_at, author_id')
      .eq('association_page_id', page.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('job_posts' as any)
      .select('id, title, description, location, country, type, specialisation, created_at')
      .eq('association_page_id', page.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const memberRows = memberRowsRes.data;
  const verifiedRows = verifiedRowsRes.data;
  const memberCount = memberCountRes.count;
  const postRows = postRowsRes.data;
  const jobRows = jobRowsRes.data;

  const assocEvents = allEvents.filter((e) => {
    const assocLower = (e.association ?? e.organiser ?? '').toLowerCase();
    return assocLower.includes(page.slug) || assocLower.includes(page.name.toLowerCase());
  });

  const now = new Date();
  const upcoming = assocEvents
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((e) => ({
      id: e.id, title: e.title, slug: e.slug, date: e.date,
      city: e.city, country: e.country, category: e.category,
      image_path: e.image_path, coverImage: (e as any).coverImage,
      formattedDate: formatEventDate(e),
    }));

  const past = assocEvents
    .filter((e) => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((e) => ({
      id: e.id, title: e.title, slug: e.slug, date: e.date,
      city: e.city, country: e.country, category: e.category,
      image_path: e.image_path, coverImage: (e as any).coverImage,
      formattedDate: formatEventDate(e),
    }));

  // PostgREST can't reliably resolve the user_associations -> profiles
  // embedded join (the FK on user_associations.user_id points at
  // auth.users.id, not profiles.id). Fetch the auth_provider /
  // is_verified flags as a separate query keyed by user id, then merge.
  const allMemberIds = (memberRows ?? []).map((m: any) => m.user_id);
  const profileFlagsMap = new Map<string, { auth_provider: string | null; is_verified: boolean | null; full_name: string | null; avatar_url: string | null; username: string | null; specialisation: string | null; headline: string | null; country: string | null; profile_color: string | null }>();
  if (allMemberIds.length > 0) {
    const { data: profileFlags } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username, specialisation, headline, country, profile_color, auth_provider, is_verified')
      .in('id', allMemberIds);
    for (const p of (profileFlags ?? []) as any[]) {
      profileFlagsMap.set(p.id, p);
    }
  }

  // Profile-level verified users (LinkedIn OAuth OR admin-toggled) are
  // auto-verified for every association they've claimed. Code-based
  // member verifications still count too, so the table stays as a
  // legacy / formal-verification option.
  const legacyVerifiedIds = new Set((verifiedRows ?? []).map((v: any) => v.user_id));
  const profileLevelVerifiedIds = new Set<string>();
  for (const m of (memberRows ?? []) as any[]) {
    const p = profileFlagsMap.get(m.user_id);
    if (p && (p.auth_provider === 'linkedin_oidc' || p.is_verified === true)) {
      profileLevelVerifiedIds.add(m.user_id);
    }
  }
  const verifiedSet = new Set([...legacyVerifiedIds, ...profileLevelVerifiedIds]);
  const memberUserIds = new Set((memberRows ?? []).map((m: any) => m.user_id));
  const missingVerifiedIds = (verifiedRows ?? [])
    .filter((v: any) => !memberUserIds.has(v.user_id))
    .map((v: any) => v.user_id);

  let extraMembers: any[] = [];
  if (missingVerifiedIds.length > 0) {
    const { data: extraProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username, specialisation, headline, country, profile_color')
      .in('id', missingVerifiedIds);
    extraMembers = (extraProfiles ?? []).map((p: any) => ({
      user_id: p.id,
      role: null,
      member_since: null,
      profiles: p,
    }));
  }

  const allMemberRows = [...(memberRows ?? []), ...extraMembers];
  const totalMemberCount = (memberCount ?? 0) + missingVerifiedIds.length;

  const members = allMemberRows.map((m: any) => {
    // Source of truth: separately-fetched profileFlagsMap. extraMembers
    // (verified-only with no user_associations row) carry their profile
    // inline via m.profiles.
    const p = profileFlagsMap.get(m.user_id) ?? m.profiles ?? null;
    return {
    user_id: m.user_id,
    role: m.role,
    member_since: m.member_since,
    profile: p ? {
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      username: p.username,
      specialisation: p.specialisation,
      headline: p.headline,
      country: p.country,
      profile_color: p.profile_color,
    } : null,
    isVerified: verifiedSet.has(m.user_id),
    };
  });

  // Sort: verified first
  members.sort((a, b) => (a.isVerified === b.isVerified ? 0 : a.isVerified ? -1 : 1));

  const posts = (postRows ?? []).map((p: any) => ({
    id: p.id, title: p.title, content: p.content,
    image_url: p.image_url, link_url: p.link_url,
    is_pinned: p.is_pinned, likes_count: p.likes_count,
    created_at: p.created_at,
    author_name: null, author_avatar: null,
  }));

  const jobs = (jobRows ?? []).map((j: any) => ({
    id: j.id, title: j.title, description: j.description,
    location: j.location, country: j.country,
    type: j.type, specialisation: j.specialisation,
    created_at: j.created_at,
  }));

  return (
    <main className="min-h-screen bg-slate-50/80">
      <AssociationPageTabs
        page={{
          name: page.name,
          slug: page.slug,
          description: page.description,
          country: page.country,
          website: page.website,
          founded_year: page.founded_year,
          member_count: page.member_count,
          contact_email: page.contact_email,
          social_links: page.social_links,
          is_verified: page.is_verified,
          logo_url: page.logo_url,
          cover_image_url: page.cover_image_url,
        }}
        logoSrc={logoSrc ?? null}
        invertLogo={invertLogo}
        upcoming={upcoming}
        past={past}
        members={members}
        posts={posts}
        jobs={jobs}
        platformMembers={totalMemberCount}
        verifiedCount={verifiedSet.size}
      />
    </main>
  );
}
