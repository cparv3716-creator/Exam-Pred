import "server-only";

import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  getAccessTokenFromCookies,
  getUserFromToken,
  type SupabaseUser,
} from "@/lib/supabase/server";
import { supabaseAdminRestFetch } from "@/lib/supabase/admin";

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export type UserExamPreference = {
  id: string;
  user_id: string;
  exam_slug: string;
  target_year: number | null;
  target_month: string | null;
  current_level: string | null;
};

export async function getCurrentUser(): Promise<SupabaseUser | null> {
  // Primary: the @supabase/ssr cookie session. getUser() validates the token
  // against the Supabase auth server (more secure than trusting getSession()).
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user && !error) {
      return user as unknown as SupabaseUser;
    }
  } catch {
    // fall through to the legacy recovery-session check below
  }

  // Fallback: the legacy ss-* recovery-session cookie used solely by the OTP
  // password-reset flow (forgot-password / reset-password). This keeps that
  // flow working unchanged while the main session moves to @supabase/ssr.
  const token = await getAccessTokenFromCookies();
  return getUserFromToken(token);
}

export async function requireUser(nextPath = "/dashboard") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function getCurrentProfile(user?: SupabaseUser | null) {
  const currentUser = user ?? (await getCurrentUser());

  if (!currentUser) {
    return null;
  }

  try {
    const profiles = await supabaseAdminRestFetch<UserProfile[]>(
      `profiles?id=eq.${encodeURIComponent(currentUser.id)}&select=*&limit=1`,
    );
    return profiles[0] ?? null;
  } catch {
    return null;
  }
}

export async function getUserExamPreferences(userId: string) {
  try {
    return await supabaseAdminRestFetch<UserExamPreference[]>(
      `user_exam_preferences?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc`,
    );
  } catch {
    return [];
  }
}

export async function isAdmin(user?: SupabaseUser | null) {
  const currentUser = user ?? (await getCurrentUser());

  if (!currentUser) {
    return false;
  }

  try {
    const rows = await supabaseAdminRestFetch<Array<{ user_id: string }>>(
      `admin_users?user_id=eq.${encodeURIComponent(currentUser.id)}&select=user_id&limit=1`,
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}
