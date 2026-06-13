import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "ss-access-token";
export const REFRESH_TOKEN_COOKIE = "ss-refresh-token";

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

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), anonKey };
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.statstrive.com").replace(/\/$/, "");
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
    ...(maxAge ? { maxAge } : {}),
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
