import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Globe, ShieldCheck, ExternalLink } from 'lucide-react';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { fetchAllEvents } from '@/lib/data/events';
import { getAssociationBrandLogoSrc } from '@/lib/utils/association-branding';
import { formatEventDate } from '@/lib/utils/date';
import { UserAvatar } from '@/components/UserAvatar';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createSupabaseSSRServerClient();
  const { data: page } = await supabase.from('association_pages' as any).select('name').eq('slug', params.slug).single();
  return { title: page ? `${(page as any).name} | Investigator Events` : 'Association' };
}

export default async function AssociationPage({ params }: { params: { slug: string } }) {
  const supabase = await createSupabaseSSRServerClient();
  const { data: pageData } = await supabase.from('association_pages' as any).select('*').eq('slug', params.slug).single();
  if (!pageData) notFound();
  const page = pageData as any;

  const logoSrc = getAssociationBrandLogoSrc(page.name) || getAssociationBrandLogoSrc(page.slug.toUpperCase());

  // Get events for this association
  const allEvents = await fetchAllEvents();
  const assocEvents = allEvents.filter((e) => {
    const assocLower = (e.association ?? e.organiser ?? '').toLowerCase();
    return assocLower.includes(page.slug) || assocLower.includes(page.name.toLowerCase());
  });

  const now = new Date();
  const upcoming = assocEvents.filter((e) => new Date(e.date) >= now).slice(0, 6);
  const past = assocEvents.filter((e) => new Date(e.date) < now).slice(0, 4);

  // Get verified members
  const { data: members } = await supabase
    .from('user_associations')
    .select('user_id, role, profiles:user_id(full_name, avatar_url, username, specialisation)')
    .ilike('association_name', `%${page.slug}%`)
    .limit(12);

  const { count: memberCount } = await supabase
    .from('user_associations')
    .select('id', { count: 'exact', head: true })
    .ilike('association_name', `%${page.slug}%`);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero banner */}
      <div className="relative bg-slate-900 pb-20 pt-24 sm:pb-28 sm:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-slate-900 to-slate-900" />
        <div className="container-shell relative">
          <div className="flex items-center gap-6">
            {logoSrc && (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white p-3 shadow-xl sm:h-24 sm:w-24">
                <Image src={logoSrc} alt={page.name} width={80} height={80} className="h-auto max-h-14 w-auto object-contain sm:max-h-16" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white sm:text-4xl">{page.name}</h1>
                {page.is_verified && <ShieldCheck className="h-6 w-6 text-blue-400" />}
              </div>
              {page.country && <p className="mt-1 text-sm text-white/60">{page.country}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/50">
                {(memberCount ?? 0) > 0 && <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {memberCount} members</span>}
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {assocEvents.length} events listed</span>
                {page.website && (
                  <a href={page.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                    <Globe className="h-4 w-4" /> Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-shell -mt-8 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          {/* Main content */}
          <div className="space-y-6">
            {/* About */}
            {page.description && (
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">About</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{page.description}</p>
              </div>
            )}

            {/* Upcoming events */}
            {upcoming.length > 0 && (
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Upcoming events</h2>
                <div className="mt-4 space-y-3">
                  {upcoming.map((e) => {
                    const imgSrc = (e.image_path && /^(\/(cities|events|images)\/|https?:\/\/)/.test(e.image_path) ? e.image_path : e.coverImage) ?? '/cities/fallback.jpg';
                    return (
                      <Link key={e.id} href={`/events/${e.slug ?? e.id}`} className="group flex items-center gap-4 rounded-lg border border-slate-100 p-3 transition hover:border-blue-200 hover:shadow-sm">
                        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image src={imgSrc} alt={e.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600">{e.title}</p>
                          <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                            <Calendar className="h-3 w-3" /> {formatEventDate(e)}
                            <MapPin className="h-3 w-3" /> {e.city}, {e.country}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past events */}
            {past.length > 0 && (
              <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Past events</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {past.map((e) => (
                    <Link key={e.id} href={`/events/${e.slug ?? e.id}`} className="group rounded-lg border border-slate-100 p-3 transition hover:border-blue-200">
                      <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600">{e.title}</p>
                      <p className="text-xs text-slate-400">{formatEventDate(e)} · {e.city}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — members */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Members on platform</h3>
              {(members ?? []).length > 0 ? (
                <div className="mt-4 space-y-3">
                  {(members ?? []).map((m: any) => (
                    <a key={m.user_id} href={m.profiles?.username ? `/profile/${m.profiles.username}` : '#'} className="flex items-center gap-3 group">
                      <UserAvatar src={m.profiles?.avatar_url} name={m.profiles?.full_name} size={36} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 group-hover:text-blue-600">{m.profiles?.full_name ?? 'Member'}</p>
                        <p className="truncate text-[11px] text-slate-400">{m.role || m.profiles?.specialisation || ''}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No members have added this association to their profile yet.</p>
              )}
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Quick facts</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {page.founded_year && (
                  <div className="flex justify-between"><dt className="text-slate-400">Founded</dt><dd className="font-medium text-slate-700">{page.founded_year}</dd></div>
                )}
                <div className="flex justify-between"><dt className="text-slate-400">Events listed</dt><dd className="font-medium text-slate-700">{assocEvents.length}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Members here</dt><dd className="font-medium text-slate-700">{memberCount ?? 0}</dd></div>
                {page.country && (
                  <div className="flex justify-between"><dt className="text-slate-400">Based in</dt><dd className="font-medium text-slate-700">{page.country}</dd></div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
