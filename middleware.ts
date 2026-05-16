import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  // Only purpose: refresh Supabase auth cookies so server components get the session.
  // No DB queries — those kill performance.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If a logged-in user lands on /signin or /signup, send them straight to
  // their profile. Prevents the brief "login page flash" some users were
  // hitting when navigation raced ahead of the client-side auth state
  // (e.g. tapping the Profile tab before BottomTabBar's async resolved).
  if (user) {
    const path = request.nextUrl.pathname;
    if (path === '/signin' || path === '/signup') {
      const url = request.nextUrl.clone();
      url.pathname = '/profile';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|json)$).*)',
  ],
};
