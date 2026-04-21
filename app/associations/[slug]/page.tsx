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

  // Get ALL events for this association
  const allEvents = await fetchAllEvents();
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

  // Get members — match on slug OR name (covers all ways users add associations)
  const { data: memberRows } = await supabase
    .from('user_associations')
    .select('user_id, role, member_since, profiles:user_id(full_name, avatar_url, username, specialisation, headline, country, profile_color)')
    .or(`association_slug.eq.${page.slug},association_name.ilike.%${page.slug}%,association_name.ilike.%${page.name}%`)
    .limit(50);

  const { count: memberCount } = await supabase
    .from('user_associations')
    .select('id', { count: 'exact', head: true })
    .or(`association_slug.eq.${page.slug},association_name.ilike.%${page.slug}%,association_name.ilike.%${page.name}%`);

  // Get verified status for members
  const memberIds = (memberRows ?? []).map((m: any) => m.user_id);
  const { data: verifiedRows } = memberIds.length > 0
    ? await supabase.from('member_verifications').select('user_id, status').eq('status', 'verified').in('user_id', memberIds)
    : { data: [] };
  const verifiedSet = new Set((verifiedRows ?? []).map((v: any) => v.user_id));

  const members = (memberRows ?? []).map((m: any) => ({
    user_id: m.user_id,
    role: m.role,
    member_since: m.member_since,
    profile: m.profiles ? {
      full_name: m.profiles.full_name,
      avatar_url: m.profiles.avatar_url,
      username: m.profiles.username,
      specialisation: m.profiles.specialisation,
      headline: m.profiles.headline,
      country: m.profiles.country,
      profile_color: m.profiles.profile_color,
    } : null,
    isVerified: verifiedSet.has(m.user_id),
  }));

  // Sort: verified first
  members.sort((a, b) => (a.isVerified === b.isVerified ? 0 : a.isVerified ? -1 : 1));

  // Get association posts
  const { data: postRows } = await supabase
    .from('association_posts' as any)
    .select('id, title, content, image_url, link_url, is_pinned, likes_count, created_at, author_id')
    .eq('association_page_id', page.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20);

  const posts = (postRows ?? []).map((p: any) => ({
    id: p.id, title: p.title, content: p.content,
    image_url: p.image_url, link_url: p.link_url,
    is_pinned: p.is_pinned, likes_count: p.likes_count,
    created_at: p.created_at,
    author_name: null, author_avatar: null,
  }));

  // Get jobs linked to this association
  const { data: jobRows } = await supabase
    .from('job_posts' as any)
    .select('id, title, description, location, country, type, specialisation, created_at')
    .eq('association_page_id', page.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10);

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
        platformMembers={memberCount ?? 0}
        verifiedCount={verifiedSet.size}
      />
    </main>
  );
}
