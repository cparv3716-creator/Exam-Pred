import "server-only";

import { supabaseAdminRestFetch } from "@/lib/supabase/admin";
import type { AdminUserRow, UserProfile } from "@/lib/backend/auth";
import type { ManualPremiumGrantRow } from "@/lib/backend/access";
import type { PaymentOrderRow, UserExamSubscriptionRow } from "@/lib/backend/payments";
import { isExamId, type ExamId } from "@/lib/payments/plans";

export type AdminAuditLogRow = {
  id: string;
  admin_user_id: string | null;
  action: string;
  target_user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AdminUserAccessSummary = {
  profile: UserProfile;
  adminUser: AdminUserRow | null;
  subscriptions: UserExamSubscriptionRow[];
  manualGrants: ManualPremiumGrantRow[];
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function assertAdminTargetUserId(value: unknown): string {
  if (typeof value !== "string" || !isUuid(value)) {
    throw new Error("A valid target user id is required.");
  }

  return value;
}

export function assertAdminExamId(value: unknown): ExamId {
  if (!isExamId(value)) {
    throw new Error("A valid exam id is required.");
  }

  return value;
}

export async function listProfiles(limit = 200) {
  return supabaseAdminRestFetch<UserProfile[]>(
    `profiles?select=*&order=created_at.desc&limit=${Math.max(1, Math.min(limit, 500))}`,
  );
}

export async function listAdminUsers() {
  return supabaseAdminRestFetch<AdminUserRow[]>(
    "admin_users?select=*&order=created_at.desc",
  );
}

export async function listManualPremiumGrants() {
  return supabaseAdminRestFetch<ManualPremiumGrantRow[]>(
    "manual_premium_grants?select=*&order=updated_at.desc",
  );
}

export async function listUserExamSubscriptions(limit = 300) {
  return supabaseAdminRestFetch<UserExamSubscriptionRow[]>(
    `user_exam_subscriptions?select=*&order=valid_until.desc&limit=${Math.max(1, Math.min(limit, 500))}`,
  );
}

export async function listPaymentOrders(limit = 300) {
  return supabaseAdminRestFetch<PaymentOrderRow[]>(
    `payment_orders?select=*&order=created_at.desc&limit=${Math.max(1, Math.min(limit, 500))}`,
  );
}

export async function listAdminAuditLogs(limit = 100) {
  return supabaseAdminRestFetch<AdminAuditLogRow[]>(
    `admin_audit_logs?select=*&order=created_at.desc&limit=${Math.max(1, Math.min(limit, 300))}`,
  );
}

async function getManualGrantByUserExam(userId: string, examId: ExamId) {
  const rows = await supabaseAdminRestFetch<ManualPremiumGrantRow[]>(
    `manual_premium_grants?user_id=eq.${encodeURIComponent(userId)}&exam_id=eq.${encodeURIComponent(examId)}&select=*&limit=1`,
  );

  return rows[0] ?? null;
}

export async function insertAdminAuditLog(input: {
  adminUserId: string;
  action: string;
  targetUserId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return supabaseAdminRestFetch<AdminAuditLogRow[]>("admin_audit_logs", {
    method: "POST",
    body: JSON.stringify({
      admin_user_id: input.adminUserId,
      action: input.action,
      target_user_id: input.targetUserId ?? null,
      metadata: input.metadata ?? {},
    }),
  });
}

export async function grantManualPremium(input: {
  adminUserId: string;
  targetUserId: string;
  examId: ExamId;
  reason?: string | null;
  validUntil?: string | null;
}) {
  const existing = await getManualGrantByUserExam(input.targetUserId, input.examId);
  const body = {
    user_id: input.targetUserId,
    exam_id: input.examId,
    status: "active",
    reason: input.reason || "Manual admin premium grant",
    granted_by: input.adminUserId,
    revoked_by: null,
    valid_until: input.validUntil || null,
    revoked_at: null,
  };

  const rows = existing
    ? await supabaseAdminRestFetch<ManualPremiumGrantRow[]>(
        `manual_premium_grants?id=eq.${encodeURIComponent(existing.id)}`,
        { method: "PATCH", body: JSON.stringify(body) },
      )
    : await supabaseAdminRestFetch<ManualPremiumGrantRow[]>("manual_premium_grants", {
        method: "POST",
        body: JSON.stringify(body),
      });

  await insertAdminAuditLog({
    adminUserId: input.adminUserId,
    action: "manual_premium_grant",
    targetUserId: input.targetUserId,
    metadata: { examId: input.examId, grantId: rows[0]?.id ?? existing?.id ?? null, validUntil: input.validUntil ?? null },
  });

  return rows[0] ?? null;
}

export async function revokeManualPremium(input: {
  adminUserId: string;
  grantId: string;
}) {
  if (!isUuid(input.grantId)) {
    throw new Error("A valid grant id is required.");
  }

  const existingRows = await supabaseAdminRestFetch<ManualPremiumGrantRow[]>(
    `manual_premium_grants?id=eq.${encodeURIComponent(input.grantId)}&select=*&limit=1`,
  );
  const existing = existingRows[0];

  if (!existing) {
    throw new Error("Manual premium grant was not found.");
  }

  const rows = await supabaseAdminRestFetch<ManualPremiumGrantRow[]>(
    `manual_premium_grants?id=eq.${encodeURIComponent(input.grantId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "revoked",
        revoked_by: input.adminUserId,
        revoked_at: new Date().toISOString(),
      }),
    },
  );

  await insertAdminAuditLog({
    adminUserId: input.adminUserId,
    action: "manual_premium_revoke",
    targetUserId: existing.user_id,
    metadata: { examId: existing.exam_id, grantId: input.grantId },
  });

  return rows[0] ?? null;
}

export async function getAdminUserAccessSummaries() {
  const [profiles, adminUsers, subscriptions, manualGrants] = await Promise.all([
    listProfiles(),
    listAdminUsers().catch(() => []),
    listUserExamSubscriptions().catch(() => []),
    listManualPremiumGrants().catch(() => []),
  ]);

  return profiles.map<AdminUserAccessSummary>((profile) => ({
    profile,
    adminUser: adminUsers.find((admin) => admin.user_id === profile.id) ?? null,
    subscriptions: subscriptions.filter((subscription) => subscription.user_id === profile.id),
    manualGrants: manualGrants.filter((grant) => grant.user_id === profile.id),
  }));
}
