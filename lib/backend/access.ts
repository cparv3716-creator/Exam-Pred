import "server-only";

import { isAdmin, getCurrentUser } from "@/lib/backend/auth";
import { supabaseAdminRestFetch } from "@/lib/supabase/admin";
import type { SupabaseUser } from "@/lib/supabase/server";

export type AccessLevel = "guest" | "free" | "premium" | "admin";

export type UserSubscription = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  starts_at: string;
  ends_at: string | null;
};

export async function getUserSubscription(userId: string) {
  try {
    const rows = await supabaseAdminRestFetch<UserSubscription[]>(
      `user_subscriptions?user_id=eq.${encodeURIComponent(userId)}&status=eq.active&select=*&order=created_at.desc&limit=1`,
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getUserAccessLevel(user?: SupabaseUser | null): Promise<AccessLevel> {
  const currentUser = user ?? (await getCurrentUser());

  if (!currentUser) {
    return "guest";
  }

  if (await isAdmin(currentUser)) {
    return "admin";
  }

  const subscription = await getUserSubscription(currentUser.id);
  const premiumPlans = new Set(["monthly", "yearly", "premium"]);

  if (subscription?.status === "active" && premiumPlans.has(subscription.plan)) {
    return "premium";
  }

  return "free";
}
