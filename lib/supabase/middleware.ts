import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

async function hasAdminRow(userId: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return false;
  }

  const response = await fetch(
    `${url}/rest/v1/admin_users?user_id=eq.${encodeURIComponent(userId)}&select=user_id&limit=1`,
    {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response || !response.ok) {
    return false;
  }

  const rows = (await response.json().catch(() => [])) as Array<{ user_id: string }>;
  return rows.length > 0;
}

/**
 * Refreshes the Supabase auth session on every request and keeps the session
 * cookies in sync between the browser and the server.
 *
 * This is the canonical @supabase/ssr middleware pattern: calling getUser()
 * triggers a token refresh when needed, and the rotated cookies are written
 * onto BOTH the incoming request (so downstream Server Components see them) and
 * the outgoing response (so the browser stores them). Without this, the access
 * token silently expires and the user appears logged out on navigation/refresh.
 *
 * NOTE: API routes are excluded via the matcher in middleware.ts, so this never
 * runs on (and never blocks) /api/payments/verify or any other API route.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: do not run logic between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname.startsWith("/admin") && !(await hasAdminRow(user.id))) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    dashboardUrl.searchParams.set("error", "admin");
    return NextResponse.redirect(dashboardUrl);
  }

  // Must return supabaseResponse so the refreshed Set-Cookie headers reach the
  // browser on every navigation (homepage, dashboard, refresh, etc.).
  return supabaseResponse;
}
