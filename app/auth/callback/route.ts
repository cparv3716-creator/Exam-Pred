import { NextResponse } from "next/server";
import { clearCodeVerifierCookie, exchangeCodeForSession, getSafeRelativePath, setAuthCookies } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = getSafeRelativePath(url.searchParams.get("next"), "/dashboard");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
  }

  try {
    const session = await exchangeCodeForSession(code);
    const response = NextResponse.redirect(new URL(nextPath, request.url));
    setAuthCookies(response, session);
    clearCodeVerifierCookie(response);
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
    clearCodeVerifierCookie(response);
    return response;
  }
}
