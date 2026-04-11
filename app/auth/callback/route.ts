import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/profile';
  // Prevent open redirect — only allow relative paths starting with /
  const next = /^\/[^\/\\]/.test(rawNext) ? rawNext : '/profile';

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
          const provider = user.app_metadata?.provider ?? 'email';
          const meta = user.user_metadata ?? {};
          const fullName = meta.full_name || meta.name || null;
          const avatarUrl = meta.avatar_url || meta.picture || null;

          const admin = createSupabaseAdminServerClient();

          // Check if profile exists
          const { data: existing } = await admin.from('profiles').select('id, full_name, avatar_url').eq('id', user.id).single();

          // Extract LinkedIn profile URL from identity data if available
          const linkedinUrl = provider === 'linkedin_oidc'
            ? (meta.linkedin_url || meta.profile_url || (user.identities?.[0]?.identity_data as any)?.profile_url || null)
            : null;

          if (!existing) {
            // New user — create profile with OAuth data
            await admin.from('profiles').insert({
              id: user.id,
              full_name: fullName,
              avatar_url: avatarUrl,
              username: fullName ? fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null,
              is_public: true,
              auth_provider: provider,
              linkedin_url: linkedinUrl,
              tos_accepted_at: new Date().toISOString(),
            } as any);

            // Redirect new OAuth users to profile setup
            return NextResponse.redirect(`${origin}/profile/setup`);
          } else {
            // Existing user — always update auth_provider, backfill missing data
            const updates: Record<string, string | null> = {
              auth_provider: provider,
            };
            if (!existing.avatar_url && avatarUrl) updates.avatar_url = avatarUrl;
            if (!existing.full_name && fullName) updates.full_name = fullName;
            if (provider === 'linkedin_oidc') {
              // Build LinkedIn profile URL from user identity if not in metadata
              const linkedinIdentity = user.identities?.find((i) => i.provider === 'linkedin_oidc');
              const resolvedLinkedinUrl = linkedinUrl
                || (linkedinIdentity?.identity_data as any)?.profile_url
                || (linkedinIdentity?.identity_data as any)?.linkedin_url
                || null;
              if (resolvedLinkedinUrl) updates.linkedin_url = resolvedLinkedinUrl;
            }

            await admin.from('profiles').update(updates as any).eq('id', user.id);
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
