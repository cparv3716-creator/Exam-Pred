import { NextResponse } from "next/server";
import { clearAuthCookies, createSupabaseServerClient } from "@/lib/supabase/server";

async function signOut(request: Request) {
  // Sign out via the @supabase/ssr server client. This revokes the session and
  // deletes the sb-* auth cookies through the next/headers cookie store.
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut().catch(() => null);

  const response = NextResponse.redirect(new URL("/", request.url));

  // Also clear the legacy ss-* cookies (OTP recovery flow) on the redirect, so
  // no stale auth state survives logout regardless of which flow set it.
  clearAuthCookies(response);

  return response;
}

export function GET(request: Request) {
  return signOut(request);
}

export function POST(request: Request) {
  return signOut(request);
}
