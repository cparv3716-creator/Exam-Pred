import "server-only";

import { redirect } from "next/navigation";
import { isAdmin, getCurrentUser } from "@/lib/backend/auth";
import {
  getActiveExamSubscription,
  getAnyActiveExamSubscription,
  getUserExamSubscriptions,
  type UserExamSubscriptionRow,
} from "@/lib/backend/payments";
import { supabaseAdminRestFetch } from "@/lib/supabase/admin";
import type { ExamId } from "@/lib/payments/plans";
import type { SupabaseUser } from "@/lib/supabase/server";

export type AccessLevel = "guest" | "free" | "premium" | "admin";
export type AccessSource = "guest" | "free" | "subscription" | "manual_grant" | "admin";

export type ManualPremiumGrantRow = {
  id: string;
  user_id: string;
  exam_id: ExamId;
  status: "active" | "revoked" | "expired";
  reason: string | null;
  granted_by: string | null;
  revoked_by: string | null;
  valid_from: string;
  valid_until: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EffectiveAccess = {
  level: AccessLevel;
  source: AccessSource;
  user: SupabaseUser | null;
  examId: ExamId | null;
  isGuest: boolean;
  isFree: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  activeSubscription: UserExamSubscriptionRow | null;
  activeManualGrant: ManualPremiumGrantRow | null;
  premiumExamIds: ExamId[];
  validUntil?: string;
};

function isGrantActive(grant: ManualPremiumGrantRow, now = new Date()) {
  if (grant.status !== "active") {
    return false;
  }

  if (!grant.valid_until) {
    return true;
  }

  return new Date(grant.valid_until).getTime() > now.getTime();
}

async function getActiveManualGrant(userId: string, examId: ExamId) {
  const rows = await supabaseAdminRestFetch<ManualPremiumGrantRow[]>(
    `manual_premium_grants?user_id=eq.${encodeURIComponent(userId)}&exam_id=eq.${encodeURIComponent(examId)}&status=eq.active&select=*&limit=1`,
  );

  return rows.find((grant) => isGrantActive(grant)) ?? null;
}

export async function getUserManualPremiumGrants(userId: string) {
  const rows = await supabaseAdminRestFetch<ManualPremiumGrantRow[]>(
    `manual_premium_grants?user_id=eq.${encodeURIComponent(userId)}&status=eq.active&select=*&order=updated_at.desc`,
  );

  return rows.filter((grant) => isGrantActive(grant));
}

export async function getEffectiveAccess(options: {
  user?: SupabaseUser | null;
  examId?: ExamId | null;
} = {}): Promise<EffectiveAccess> {
  const user = options.user ?? (await getCurrentUser());
  const examId = options.examId ?? null;

  if (!user) {
    return {
      level: "guest",
      source: "guest",
      user: null,
      examId,
      isGuest: true,
      isFree: false,
      isPremium: false,
      isAdmin: false,
      activeSubscription: null,
      activeManualGrant: null,
      premiumExamIds: [],
    };
  }

  const admin = await isAdmin(user);
  if (admin) {
    return {
      level: "admin",
      source: "admin",
      user,
      examId,
      isGuest: false,
      isFree: false,
      isPremium: true,
      isAdmin: true,
      activeSubscription: null,
      activeManualGrant: null,
      premiumExamIds: [],
    };
  }

  if (examId) {
    const [activeSubscription, activeManualGrant] = await Promise.all([
      getActiveExamSubscription(user.id, examId).catch(() => null),
      getActiveManualGrant(user.id, examId).catch(() => null),
    ]);

    if (activeSubscription || activeManualGrant) {
      return {
        level: "premium",
        source: activeSubscription ? "subscription" : "manual_grant",
        user,
        examId,
        isGuest: false,
        isFree: false,
        isPremium: true,
        isAdmin: false,
        activeSubscription,
        activeManualGrant,
        premiumExamIds: [examId],
        validUntil: activeSubscription?.valid_until ?? activeManualGrant?.valid_until ?? undefined,
      };
    }

    return {
      level: "free",
      source: "free",
      user,
      examId,
      isGuest: false,
      isFree: true,
      isPremium: false,
      isAdmin: false,
      activeSubscription: null,
      activeManualGrant: null,
      premiumExamIds: [],
    };
  }

  const [subscription, grants, allSubscriptions] = await Promise.all([
    getAnyActiveExamSubscription(user.id).catch(() => null),
    getUserManualPremiumGrants(user.id).catch(() => []),
    getUserExamSubscriptions(user.id).catch(() => []),
  ]);
  const activeSubscriptions = allSubscriptions.filter((row) => {
    return row.status === "active" && new Date(row.valid_until).getTime() > Date.now();
  });
  const premiumExamIds = Array.from(
    new Set([...activeSubscriptions.map((row) => row.exam_id), ...grants.map((grant) => grant.exam_id)]),
  );

  if (subscription || grants.length > 0) {
    const grant = grants[0] ?? null;
    return {
      level: "premium",
      source: subscription ? "subscription" : "manual_grant",
      user,
      examId,
      isGuest: false,
      isFree: false,
      isPremium: true,
      isAdmin: false,
      activeSubscription: subscription,
      activeManualGrant: grant,
      premiumExamIds,
      validUntil: subscription?.valid_until ?? grant?.valid_until ?? undefined,
    };
  }

  return {
    level: "free",
    source: "free",
    user,
    examId,
    isGuest: false,
    isFree: true,
    isPremium: false,
    isAdmin: false,
    activeSubscription: null,
    activeManualGrant: null,
    premiumExamIds,
  };
}

export async function getUserAccessLevel(user?: SupabaseUser | null): Promise<AccessLevel> {
  const access = await getEffectiveAccess({ user });
  return access.level;
}

export async function requireActiveExamSubscription(examId: ExamId, nextPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const access = await getEffectiveAccess({ user, examId });
  if (access.isPremium || access.isAdmin) {
    return access;
  }

  const params = new URLSearchParams({ examId, next: nextPath });
  redirect(`/pricing?${params.toString()}`);
}

export async function requireAnyActiveExamSubscription(nextPath: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const access = await getEffectiveAccess({ user });
  if (access.isPremium || access.isAdmin) {
    return access;
  }

  redirect(`/pricing?next=${encodeURIComponent(nextPath)}`);
}
