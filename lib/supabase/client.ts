"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Canonical browser Supabase client (@supabase/ssr).
 *
 * createBrowserClient reads/writes the auth session through cookies (not
 * localStorage), which is what lets the session survive full page navigations,
 * refreshes, and the Razorpay redirect round-trip — the server, middleware and
 * browser all share the same cookie-based session.
 *
 * Placeholder fallbacks keep `next build` from throwing when env vars are not
 * present at build time; the real values are injected at runtime.
 */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

/** Singleton browser client — safe to call from client components and effects. */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}
