import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client factory for ExamIQ.
 *
 * Design goals:
 *  - The app must build and run even when no Supabase project is configured
 *    (e.g. local dev, the first Vercel deploy, or anonymous practice). Nothing
 *    here throws at import time, and clients are only created lazily when the
 *    required environment variables are present.
 *  - Backend data-access functions treat a `null` client as "not configured"
 *    and fall back to a safe no-op, so practice still works without login.
 *
 * Environment variables (see .env.example):
 *  - NEXT_PUBLIC_SUPABASE_URL        (browser + server)
 *  - NEXT_PUBLIC_SUPABASE_ANON_KEY   (browser + server)
 *  - SUPABASE_SERVICE_ROLE_KEY       (server only — never expose to the client)
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** True when the public Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let cachedAnonClient: SupabaseClient | null = null;

/**
 * Anonymous (RLS-enforced) client, safe for browser and server use.
 * Returns `null` when Supabase is not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cachedAnonClient) {
    cachedAnonClient = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cachedAnonClient;
}

/**
 * Service-role client for trusted server-side work (cron, admin, aggregation).
 * Reads a non-public env var, so it is `null` in the browser by construction.
 * Never import the result into a client component.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!SUPABASE_URL || !serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Resolve the currently authenticated user id, or `null`.
 * Auth is not fully wired yet; this returns `null` until a session exists,
 * which lets callers fall back to anonymous/local behaviour.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}
