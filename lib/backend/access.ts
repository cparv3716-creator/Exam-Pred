import "server-only";

import { redirect } from "next/navigation";
import { isAdmin, getCurrentUser } from "@/lib/backend/auth";
import {
  getAnyActiveExamSubscription,
  hasActiveExamSubscription,
} from "@/lib/backend/payments";
import type { ExamId } from "@/lib/payments/plans";
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

export async function requireActiveExamSubscription(
  examId: ExamId,
  nextPath: string,
) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (await isAdmin(user)) {
    return null;
  }

  const hasAccess = await hasActiveExamSubscription(user.id, examId).catch(
    () => false,
  );

  if (!hasAccess) {
    const params = new URLSearchParams({ examId, next: nextPath });
    redirect(`/pricing?${params.toString()}`);
  }

  return true;
}

export async function requireAnyActiveExamSubscription(nextPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (await isAdmin(user)) {
    return true;
  }

  const subscription = await getAnyActiveExamSubscription(user.id).catch(
    () => null,
  );

  if (!subscription) {
    redirect(`/pricing?next=${encodeURIComponent(nextPath)}`);
  }

  return true;
}
