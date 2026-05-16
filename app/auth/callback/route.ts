import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { generateUniqueUsername } from '@/lib/utils/username';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/profile';
  // Prevent open redirect — only allow known path prefixes
  const ALLOWED_PREFIXES = ['/profile', '/calendar', '/events', '/admin', '/messages', '/people', '/associations', '/directory', '/weekly', '/auth/app-redirect', '/'];
  const next = ALLOWED_PREFIXES.some((p) => rawNext === p || rawNext.startsWith(p + '/') || rawNext.startsWith(p + '?')) ? rawNext : '/profile';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Auto-populate profile from OAuth provider data
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // provider = original signup method, providers = all linked methods
          const providers: string[] = user.app_metadata?.providers ?? [];
          const currentProvider = user.app_metadata?.provider ?? 'email';
          // Use the best provider: prefer linkedin_oidc if it's linked
          const provider = providers.includes('linkedin_oidc') ? 'linkedin_oidc' : currentProvider;
          const meta = user.user_metadata ?? {};
          // Apple returns name as { firstName, lastName } on first sign-in only
          // and never returns it on subsequent sign-ins. Normalize to a string
          // so downstream code can treat it uniformly.
          let fullName: string | null = null;
          if (typeof meta.full_name === 'string') fullName = meta.full_name;
          else if (typeof meta.name === 'string') fullName = meta.name;
          else if (meta.name && typeof meta.name === 'object') {
            const n: any = meta.name;
            const composed = [n.firstName, n.lastName].filter(Boolean).join(' ').trim();
            if (composed) fullName = composed;
          }
          const oauthAvatarUrl: string | null = meta.avatar_url || meta.picture || null;

          const admin = createSupabaseAdminServerClient();

          // Check if profile exists
          const { data: existing } = await admin.from('profiles').select('id, full_name, avatar_url').eq('id', user.id).maybeSingle();

          // Store LinkedIn name and photo from OAuth (can't be faked — comes from LinkedIn directly)
          const linkedinIdentity = user.identities?.find((i) => i.provider === 'linkedin_oidc');
          const linkedinName = linkedinIdentity ? ((linkedinIdentity.identity_data as any)?.name || (linkedinIdentity.identity_data as any)?.full_name || null) : (meta.name || meta.full_name || null);
          const linkedinPicture = linkedinIdentity ? ((linkedinIdentity.identity_data as any)?.picture || null) : (meta.picture || null);

          // LinkedIn CDN URLs (media.licdn.com) are signed and expire after ~6 weeks.
          // If the OAuth avatar is from licdn, copy it into our own storage so we own the URL.
          // Otherwise (Google, custom upload, etc.) keep the original URL.
          let resolvedAvatarUrl = oauthAvatarUrl;
          const existingAvatar = existing?.avatar_url ?? null;
          const existingIsLicdn = !!existingAvatar && existingAvatar.includes('media.licdn.com');
          const shouldRehost = !!oauthAvatarUrl
            && oauthAvatarUrl.includes('media.licdn.com')
            && (!existingAvatar || existingIsLicdn);
          if (shouldRehost) {
            try {
              const res = await fetch(oauthAvatarUrl!, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InvestigatorEvents/1.0)' },
              });
              if (res.ok) {
                const buf = Buffer.from(await res.arrayBuffer());
                const filePath = `${user.id}/avatar.jpg`;
                const { error: upErr } = await admin.storage
                  .from('avatars')
                  .upload(filePath, buf, { upsert: true, contentType: 'image/jpeg' });
                if (!upErr) {
                  const { data: urlData } = admin.storage.from('avatars').getPublicUrl(filePath);
                  resolvedAvatarUrl = `${urlData.publicUrl}?v=${Date.now()}`;
                }
              }
            } catch {
              // Don't fail the login flow over a profile-pic copy
            }
          }

          if (!existing) {
            // New user — create profile with OAuth data
            const username = await generateUniqueUsername(admin, fullName, user.id);
            await admin.from('profiles').insert({
              id: user.id,
              full_name: fullName,
              avatar_url: resolvedAvatarUrl,
              username,
              is_public: true,
              auth_provider: provider,
              linkedin_name: linkedinName,
              linkedin_picture: linkedinPicture,
              tos_accepted_at: new Date().toISOString(),
            } as any);

            // Redirect new OAuth users to profile setup
            return NextResponse.redirect(`${origin}/profile/setup`);
          } else {
            // Existing user — always update auth_provider, backfill missing data,
            // and refresh the avatar if the existing one was a (now-likely-stale) licdn URL.
            const updates: Record<string, string | null> = {
              auth_provider: provider,
            };
            if (resolvedAvatarUrl && (!existingAvatar || existingIsLicdn)) {
              updates.avatar_url = resolvedAvatarUrl;
            }
            if (!existing.full_name && fullName) updates.full_name = fullName;
            if (linkedinName) updates.linkedin_name = linkedinName;
            if (linkedinPicture) updates.linkedin_picture = linkedinPicture;

            await (admin.from('profiles') as any).update(updates).eq('id', user.id);
          }
        }
      } catch (e) {
        // Don't block the auth flow if profile population fails
        console.error('Profile auto-populate error:', e);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth`);
}
