'use client';

import { useEffect, useState } from 'react';
import { Globe, ChevronRight, Calendar, MapPin, Plus, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { getAssociationBrandLogoSrc } from '@/lib/utils/association-branding';

interface UserAssoc {
  association_name: string;
  association_slug: string;
}

interface AssocEvent {
  id: string;
  title: string;
  city: string;
  country: string;
  start_date: string;
  slug: string;
}

interface AssocPage {
  name: string;
  slug: string;
  country: string | null;
  website: string | null;
  member_count: number | null;
}

interface AssocWithDetails {
  assoc: UserAssoc;
  page: AssocPage | null;
  events: AssocEvent[];
  memberCount: number;
}

export default function MyAssociationsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [associations, setAssociations] = useState<AssocWithDetails[]>([]);
  const [explore, setExplore] = useState<AssocPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return; }
      const uid = data.user.id;
      setUserId(uid);

      // Get user's associations
      const { data: userAssocs } = await supabase
        .from('user_associations')
        .select('association_name, association_slug')
        .eq('user_id', uid);

      const assocs = (userAssocs ?? []) as UserAssoc[];

      // For each association, get the page info, upcoming events, and member count
      const details: AssocWithDetails[] = await Promise.all(
        assocs.map(async (assoc) => {
          const [pageRes, eventsRes, memberRes] = await Promise.all([
            supabase
              .from('association_pages')
              .select('name, slug, country, website, member_count')
              .eq('slug', assoc.association_slug)
              .maybeSingle(),
            supabase
              .from('events')
              .select('id, title, city, country, start_date, slug')
              .eq('approved', true)
              .ilike('association', assoc.association_name)
              .gte('start_date', new Date().toISOString().split('T')[0])
              .order('start_date', { ascending: true })
              .limit(3),
            supabase
              .from('user_associations')
              .select('id', { count: 'exact', head: true })
              .eq('association_name', assoc.association_name),
          ]);

          return {
            assoc,
            page: pageRes.data as AssocPage | null,
            events: (eventsRes.data ?? []) as AssocEvent[],
            memberCount: memberRes.count ?? 0,
          };
        })
      );

      setAssociations(details);

      // Explore: association pages not in user's list
      const userAssocSlugs = new Set(assocs.map(a => a.association_slug));
      const { data: allPages } = await supabase
        .from('association_pages')
        .select('name, slug, country, website, member_count')
        .order('name', { ascending: true })
        .limit(50);
      setExplore(
        ((allPages ?? []) as AssocPage[]).filter(p => !userAssocSlugs.has(p.slug)).slice(0, 8)
      );

      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
        <div className="container-shell max-w-3xl py-8">
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />)}
          </div>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
        <div className="container-shell py-20 text-center">
          <Globe className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Sign in to see your associations</h2>
          <Link href="/signin" className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white">Sign in</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-2 lg:pt-20">
      <div className="container-shell max-w-3xl py-4 lg:py-10">
        <button onClick={() => window.history.back()} className="mb-3 flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-700 lg:hidden">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">My Associations</h1>
        <p className="mt-1 text-sm text-slate-500">Associations you're a member of and their upcoming events</p>

        {/* ── Your associations ── */}
        {associations.length === 0 ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
            <Globe className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-base font-semibold text-slate-900">No associations yet</p>
            <p className="mt-1 text-sm text-slate-500">Add your professional associations to see their events and connect with members.</p>
            <Link href="/profile/edit" className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add associations
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {associations.map(({ assoc, page, events, memberCount }) => {
              const logoSrc = getAssociationBrandLogoSrc(assoc.association_name);
              return (
                <div key={assoc.association_slug} className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                  {/* Header */}
                  <Link
                    href={`/associations/${assoc.association_slug}` as Route}
                    className="flex items-center gap-3 border-b border-slate-100 p-4 transition hover:bg-slate-50"
                  >
                    {logoSrc ? (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200/60 bg-white p-1.5">
                        <Image src={logoSrc} alt={assoc.association_name} width={40} height={40} className="h-auto max-h-8 w-auto object-contain" />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                        <Globe className="h-5 w-5 text-blue-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-slate-900">{assoc.association_name}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {page?.country && <span>{page.country}</span>}
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {memberCount} members on IE</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300" />
                  </Link>

                  {/* Upcoming events */}
                  {events.length > 0 ? (
                    <div className="p-3">
                      <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Upcoming events</p>
                      <div className="space-y-1.5">
                        {events.map(event => (
                          <Link
                            key={event.id}
                            href={`/events/${event.slug}` as Route}
                            className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50"
                          >
                            <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50">
                              <span className="text-[8px] font-bold uppercase text-blue-500">{new Date(event.start_date).toLocaleDateString('en-GB', { month: 'short' })}</span>
                              <span className="text-sm font-bold leading-none text-blue-700">{new Date(event.start_date).getDate()}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">{event.title}</p>
                              <p className="flex items-center gap-1 text-[11px] text-slate-400"><MapPin className="h-3 w-3" /> {event.city}, {event.country}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3">
                      <p className="text-xs text-slate-400">No upcoming events from {assoc.association_name}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Explore more ── */}
        {explore.length > 0 && (
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              <Plus className="h-4 w-4" /> Explore associations
            </h2>
            <p className="mt-1 text-xs text-slate-400">Add more associations to your profile</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {explore.map(page => {
                const logoSrc = getAssociationBrandLogoSrc(page.name);
                return (
                  <Link
                    key={page.slug}
                    href={`/associations/${page.slug}` as Route}
                    className="flex flex-col items-center gap-2 rounded-xl border border-slate-200/60 bg-white p-4 text-center shadow-sm transition active:scale-95 hover:border-blue-200"
                  >
                    {logoSrc ? (
                      <Image src={logoSrc} alt={page.name} width={32} height={32} className="h-8 w-8 object-contain" />
                    ) : (
                      <Globe className="h-8 w-8 text-slate-300" />
                    )}
                    <p className="text-xs font-semibold text-slate-700">{page.name}</p>
                    {page.country && <p className="text-[10px] text-slate-400">{page.country}</p>}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-10 text-center">
          <Link href="/associations" className="text-sm font-medium text-blue-600 hover:text-blue-700">Browse all associations →</Link>
        </div>
      </div>
    </main>
  );
}
