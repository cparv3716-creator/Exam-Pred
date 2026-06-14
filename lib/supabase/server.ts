import "server-only";

import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const ACCESS_TOKEN_COOKIE = "ss-access-token";
export const REFRESH_TOKEN_COOKIE = "ss-refresh-token";
export const CODE_VERIFIER_COOKIE = "ss-code-verifier";

export type SupabaseUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

export type AuthSessionPayload = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user?: SupabaseUser | null;
};

export type SupabaseOtpType = "recovery" | "email";

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), anonKey };
}

export function getSiteUrl() {
  const fallback = process.env.NODE_ENV === "production" ? "https://www.statstrive.com" : "http://localhost:3000";
  return (process.env.NEXT_PUBLIC_SITE_URL || fallback).replace(/\/$/, "");
}

/**
 * Canonical server-side Supabase client (@supabase/ssr).
 *
 * Reads/writes the auth session via the request cookie store from
 * `next/headers`, so Server Components, Route Handlers and Server Actions all
 * share the same cookie-based session that the browser client and middleware
 * use. `setAll` is wrapped in try/catch because Server Components cannot mutate
 * cookies — in that context the middleware (updateSession) refreshes them.
 *
 * Placeholder fallbacks keep `next build` from throwing when env vars are not
 * present at build time; real values are injected at runtime.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const config = getSupabasePublicConfig();
  const url = config?.url || "https://placeholder.supabase.co";
  const anonKey = config?.anonKey || "placeholder-anon-key";

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component where cookies are read-only.
          // The middleware updateSession() handles cookie refresh instead.
        }
      },
    },
  });
}

function base64Url(input: Buffer) {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function createPkcePair() {
  const verifier = base64Url(randomBytes(48));
  const challenge = base64Url(createHash("sha256").update(verifier).digest());

  return { verifier, challenge };
}

export async function getAccessTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export function authCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function setAuthCookies(response: NextResponse, session: AuthSessionPayload) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, authCookieOptions(session.expires_in ?? 60 * 60));

  if (session.refresh_token) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, authCookieOptions(60 * 60 * 24 * 30));
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", authCookieOptions(0));
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", authCookieOptions(0));
  response.cookies.set(CODE_VERIFIER_COOKIE, "", authCookieOptions(0));
}

export function setCodeVerifierCookie(response: NextResponse, verifier: string) {
  response.cookies.set(CODE_VERIFIER_COOKIE, verifier, authCookieOptions(60 * 15));
}

export function clearCodeVerifierCookie(response: NextResponse) {
  response.cookies.set(CODE_VERIFIER_COOKIE, "", authCookieOptions(0));
}

export async function supabaseAuthFetch<T>(path: string, init: RequestInit = {}, accessToken?: string | null) {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const response = await fetch(`${config.url}/auth/v1${path}`, {
    ...init,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken ?? config.anonKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : (null as T);

  if (!response.ok) {
    const message = typeof data === "object" && data && "msg" in data ? String((data as { msg: unknown }).msg) : response.statusText;
    throw new Error(message || "Supabase auth request failed.");
  }

  return data;
}

export async function getUserFromToken(accessToken: string | null) {
  const config = getSupabasePublicConfig();

  if (!config || !accessToken) {
    return null;
  }

  try {
    return await supabaseAuthFetch<SupabaseUser>("/user", { method: "GET" }, accessToken);
  } catch {
    return null;
  }
}

export async function exchangeCodeForSession(code: string) {
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get(CODE_VERIFIER_COOKIE)?.value;

  if (!codeVerifier) {
    throw new Error("Missing password reset verifier. Please request a fresh reset link.");
  }

  return supabaseAuthFetch<AuthSessionPayload>("/token?grant_type=pkce", {
    method: "POST",
    body: JSON.stringify({ auth_code: code, code_verifier: codeVerifier }),
  });
}

export async function verifyOtpForSession(tokenHash: string, type: SupabaseOtpType) {
  return supabaseAuthFetch<AuthSessionPayload>("/verify", {
    method: "POST",
    body: JSON.stringify({ token_hash: tokenHash, type }),
  });
}

export function getSafeRelativePath(value: string | null, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://www.statstrive.com");
    if (parsed.origin !== "https://www.statstrive.com") {
      return fallback;
    }
  } catch {
    return fallback;
  }

  return value;
}
