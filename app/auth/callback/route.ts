import { NextResponse } from "next/server";
import {
  clearCodeVerifierCookie,
  exchangeCodeForSession,
  getSafeRelativePath,
  setAuthCookies,
  verifyOtpForSession,
  type SupabaseOtpType,
} from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  if (tokenHash) {
    const otpType = getSupportedOtpType(type);
    const fallback = otpType === "recovery" ? "/reset-password" : "/dashboard";
    const nextPath = getSafeRelativePath(url.searchParams.get("next"), fallback);

    if (!otpType) {
      return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
    }

    try {
      const session = await verifyOtpForSession(tokenHash, otpType);
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

function getSupportedOtpType(type: string | null): SupabaseOtpType | null {
  if (type === "recovery" || type === "email") {
    return type;
  }

  return null;
}
