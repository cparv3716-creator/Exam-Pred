import "server-only";

import { isAdmin, getCurrentUser } from "@/lib/backend/auth";
import { getAnyActiveExamSubscription } from "@/lib/backend/payments";
import type { SupabaseUser } from "@/lib/supabase/server";

export type AccessLevel = "guest" | "free" | "premium" | "admin";

export async function getUserAccessLevel(user?: SupabaseUser | null): Promise<AccessLevel> {
  const currentUser = user ?? (await getCurrentUser());

  if (!currentUser) {
    return "guest";
  }

  if (await isAdmin(currentUser)) {
    return "admin";
  }

  const examSubscription = await getAnyActiveExamSubscription(currentUser.id).catch(() => null);
  if (examSubscription) {
    return "premium";
  }

  return "free";
}
