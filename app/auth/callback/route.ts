import { NextResponse } from "next/server";
import {
  clearCodeVerifierCookie,
  createSupabaseServerClient,
  exchangeCodeForSession,
  getSafeRelativePath,
  getSiteUrl,
  setAuthCookies,
  verifyOtpForSession,
  type AuthSessionPayload,
  type SupabaseOtpType,
} from "@/lib/supabase/server";

const AUTH_ERROR_PARAM = "auth_callback_failed";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = getParam(url, "code");
  const tokenHash = getParam(url, "token_hash");
  const type = getParam(url, "type");
  const providerError = getParam(url, "error") || getParam(url, "error_code");
  const nextPath = getSafeRelativePath(getParam(url, "next"), getFallbackForType(type));

  if (providerError && !code && !tokenHash) {
    return redirectWithClearedVerifier(request, `/login?error=${AUTH_ERROR_PARAM}`);
  }

  if (tokenHash) {
    const otpType = getSupportedOtpType(type);

    if (!otpType) {
      return redirectWithClearedVerifier(request, `/login?error=${AUTH_ERROR_PARAM}`);
    }

    try {
      const session = await verifyOtpForSession(tokenHash, otpType);
      return redirectWithSession(request, nextPath, session);
    } catch {
      return redirectWithClearedVerifier(request, getErrorPathForType(type));
    }
  }

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !session?.access_token) {
        throw error ?? new Error("Missing session after auth code exchange.");
      }

      return redirectWithSession(request, nextPath, {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        user: session.user as AuthSessionPayload["user"],
      });
    } catch {
      try {
        const session = await exchangeCodeForSession(code);
        return redirectWithSession(request, nextPath, session);
      } catch {
        return redirectWithClearedVerifier(request, `/login?error=${AUTH_ERROR_PARAM}`);
      }
    }
  }

  return redirectWithClearedVerifier(request, `/login?error=${AUTH_ERROR_PARAM}`);
}

function getParam(url: URL, key: string) {
  const value = url.searchParams.get(key);
  return value && value.trim() ? value : null;
}

function getSupportedOtpType(type: string | null): SupabaseOtpType | null {
  if (
    type === "recovery" ||
    type === "email" ||
    type === "signup" ||
    type === "magiclink" ||
    type === "invite" ||
    type === "email_change"
  ) {
    return type;
  }

  return null;
}

function getFallbackForType(type: string | null) {
  return type === "recovery" ? "/reset-password" : "/dashboard";
}

function getErrorPathForType(type: string | null) {
  return type === "recovery" ? "/forgot-password?error=auth_callback_failed" : `/login?error=${AUTH_ERROR_PARAM}`;
}

function redirectWithSession(request: Request, path: string, session: AuthSessionPayload) {
  const response = NextResponse.redirect(resolveRedirectUrl(request, path));
  setAuthCookies(response, session);
  clearCodeVerifierCookie(response);
  return response;
}

function redirectWithClearedVerifier(request: Request, path: string) {
  const response = NextResponse.redirect(resolveRedirectUrl(request, path));
  clearCodeVerifierCookie(response);
  return response;
}

function resolveRedirectUrl(request: Request, path: string) {
  const requestUrl = new URL(request.url);
  const isLocal = requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1";
  const base = isLocal ? requestUrl.origin : getSiteUrl();
  return new URL(path, base);
}