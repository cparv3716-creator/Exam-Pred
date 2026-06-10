import { getSupabaseClient } from "@/lib/backend/supabase";

/**
 * Thin auth helpers over Supabase Auth. Every function degrades safely when
 * Supabase is not configured (returns an error result instead of throwing),
 * so the app keeps building and practice keeps working without login.
 */

export type AuthUser = { id: string; email: string | null };
export type AuthResult = { ok: boolean; error?: string; needsConfirmation?: boolean };

const NOT_CONFIGURED =
  "Sign-in is not available yet — Supabase is not configured for this environment.";
const LOCAL_SITE_URL = "http://localhost:3000";

export function getAuthRedirectUrl(path = "/dashboard"): string {
  const configuredSiteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const browserOrigin = typeof window !== "undefined" ? normalizeSiteUrl(window.location.origin) : null;
  const baseUrl = configuredSiteUrl ?? browserOrigin ?? LOCAL_SITE_URL;
  return new URL(path, baseUrl).toString();
}

function normalizeSiteUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.origin;
  } catch {
    return null;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: NOT_CONFIGURED };
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string,
): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: NOT_CONFIGURED };
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl("/dashboard"),
      ...(fullName ? { data: { full_name: fullName } } : {}),
    },
  });
  if (error) return { ok: false, error: error.message };
  // When email confirmation is on, there is a user but no active session yet.
  const needsConfirmation = Boolean(data.user && !data.session);
  return { ok: true, needsConfirmation };
}

export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.auth.signOut();
  } catch {
    // ignore — nothing to sign out of
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getUser();
    if (!data.user) return null;
    return { id: data.user.id, email: data.user.email ?? null };
  } catch {
    return null;
  }
}
